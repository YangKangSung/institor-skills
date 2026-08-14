import { BUNDLED_PACKS, LOAD_PHRASES, LoadClass, Pack } from "./packs";

export type Verdict = "OK" | "no" | "conditional" | "unverified";
export type Intent = "buy" | "sell";
export type ListKind = "classes" | "bom" | "memo";
export type ItemRole = "must" | "note";

export interface SceneInput {
  scene: string;
  url?: string;
  load?: LoadClass | "";
  constraints?: string;
  intent?: Intent | "";
}

export interface ShortItem {
  name: string;
  why: string;
}

export interface CardItem {
  name: string;
  role: ItemRole;
}

export interface Card {
  verdict: Verdict;
  verdictLine: string;
  load: LoadClass;
  how: string[];
  keywords: string[];
  avoid: string[];
  shortlist: ShortItem[];
  packIds: string[];
  fit: boolean;
  intent: Intent;
  listKind: ListKind;
  items: CardItem[];
}

export interface EngineOptions {
  extraPacks?: Pack[];
}

const HEAVY_W = 2000;
const MICRO_W = 800;

export function parseWatts(text: string): number | undefined {
  const k = text.match(/(\d+(?:\.\d+)?)\s*k(?:w|W)\b/);
  if (k) {
    return Math.round(parseFloat(k[1]) * 1000);
  }
  const w = text.match(/(\d+(?:\.\d+)?)\s*(?:w|W|와트)\b/);
  if (w) {
    return Math.round(parseFloat(w[1]));
  }
  return undefined;
}

export function inferLoad(text: string, override?: LoadClass | ""): LoadClass {
  if (override && override !== "unknown") {
    return override;
  }
  const blob = text.toLowerCase();
  const watts = parseWatts(blob);
  if (watts !== undefined) {
    if (watts >= HEAVY_W) {
      return "heavy";
    }
    if (watts >= MICRO_W) {
      return "microwave-tier";
    }
    return "light";
  }
  for (const row of LOAD_PHRASES) {
    if (row.tokens.some((t) => blob.includes(t.toLowerCase()))) {
      return row.class;
    }
  }
  if (/두\s*대|동시에|같이\s*쓰/.test(blob) && /전자레인지|microwave|히터/.test(blob)) {
    return "heavy";
  }
  return "unknown";
}

export function inferIntent(text: string, override?: Intent | ""): Intent {
  if (override === "sell" || override === "buy") {
    return override;
  }
  if (/팝니|판매|중고|당근|번개장터|중고나라|내놓|파는경우|파는 경우|\bsell\b|\blisting\b/i.test(text)) {
    return "sell";
  }
  return "buy";
}

/** Split a purpose line into parts: `A + B + C`. */
export function parseParts(scene: string): string[] {
  const raw = scene
    .split(/\s*[+＋]\s*|\s+및\s+/)
    .map((s) => s.replace(/[()]/g, " ").replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 1);
  return raw.length >= 2 ? raw : [];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

export function matchPacks(text: string, packs: Pack[] = BUNDLED_PACKS): Pack[] {
  const n = norm(text);
  const hit: Pack[] = [];
  for (const p of packs) {
    if (p.signals.some((sig) => n.includes(norm(sig)))) {
      hit.push(p);
    }
  }
  return hit;
}

function mmFrom(text: string): string | undefined {
  const m = text.match(/(\d{2})\s*mm\b/i);
  return m ? `${m[1]}mm` : undefined;
}

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "with",
  "from",
  "into",
  "onto",
  "to",
  "of",
  "in",
  "on",
  "at",
  "is",
  "are",
  "this",
  "that",
  "need",
  "want",
  "please",
  "를",
  "을",
  "이",
  "가",
  "은",
  "는",
  "에",
  "에서",
  "으로",
  "로",
  "한",
  "하는",
  "하고",
  "및",
  "또는",
  "좀",
  "주세요",
]);

export function sceneQueries(text: string): string[] {
  const cleaned = text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[^\p{L}\p{N}.+\- ]/gu, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w.toLowerCase()));
  const out: string[] = [];
  if (words.length) {
    out.push(words.slice(0, 6).join(" "));
  }
  for (let i = 0; i < words.length - 1 && out.length < 8; i++) {
    const g = `${words[i]} ${words[i + 1]}`;
    if (!out.includes(g)) {
      out.push(g);
    }
  }
  return out;
}

function pushUnique(dst: string[], item: string): void {
  if (item && !dst.includes(item)) {
    dst.push(item);
  }
}

function emptyCard(): Card {
  return {
    verdict: "no",
    verdictLine: "장면을 한 줄 적어 주세요.",
    load: "unknown",
    how: [],
    keywords: [],
    avoid: [],
    shortlist: [],
    packIds: [],
    fit: false,
    intent: "buy",
    listKind: "classes",
    items: [],
  };
}

function buildSellCard(blob: string, scene: string): Card {
  const xboxFat = /xbox\s*one/i.test(blob) && /원본|뚱뚱|1세대|fat|original/i.test(blob);
  const xboxAny = /xbox/i.test(blob);
  const kinect = /키넥트|kinect/i.test(blob);
  const onePad = /패드\s*1|무선\s*패드\s*1|pad\s*1|controller\s*1/i.test(blob);
  const parts = parseParts(scene);
  const items: CardItem[] = (parts.length ? parts : [scene.slice(0, 80)]).map((name) => ({
    name,
    role: "note",
  }));
  const keywords: string[] = [];
  const avoid = ["Series S/X로 올리기", "풀세트 (패드 개수와 다를 때)", "호가 한 건을 체결가로 쓰기"];
  const how: string[] = ["제목 = 모델 + 구성 숫자. 장문 사연은 본문 메모."];
  const shortlist: ShortItem[] = items.map((i) => ({ name: i.name, why: "메모" }));

  if (xboxFat && kinect) {
    pushUnique(keywords, "Xbox One 원본 키넥트");
    pushUnique(keywords, "Xbox One original Kinect");
    pushUnique(keywords, "Xbox One 뚱뚱한 1세대");
    if (onePad) {
      pushUnique(keywords, "무선 패드 1개");
    }
    how.push("후면 키넥트 포트 사진 = 원본 One 근거. S/X로 쓰지 말 것.");
    if (onePad) {
      how.push("패드 1개면 제목에도 1개.");
    }
    pushUnique(avoid, "20만대 호가 (fat One + Kinect)");
    return {
      verdict: "OK",
      verdictLine: "OK — 팔기 메모. 원본 One + 키넥트. 제목에 세대·구성만.",
      load: "unknown",
      how: how.slice(0, 3),
      keywords: keywords.slice(0, 10),
      avoid: avoid.slice(0, 6),
      shortlist: shortlist.slice(0, 6),
      packIds: ["sell-memo"],
      fit: false,
      intent: "sell",
      listKind: "memo",
      items,
    };
  }

  for (const q of sceneQueries(blob)) {
    pushUnique(keywords, q);
  }
  how.push("호가 ≠ 체결.");
  return {
    verdict: "conditional",
    verdictLine: xboxAny
      ? "conditional — 팔기 메모. 원본/S/X·키넥트·패드 수를 적으면 제목이 선다."
      : "conditional — 팔기 메모. 모델 + 구성을 + 로 나열.",
    load: "unknown",
    how: how.slice(0, 3),
    keywords: keywords.slice(0, 10),
    avoid: avoid.slice(0, 6),
    shortlist: shortlist.slice(0, 6),
    packIds: ["sell-memo"],
    fit: false,
    intent: "sell",
    listKind: "memo",
    items,
  };
}

export function buildCard(input: SceneInput, opts: EngineOptions = {}): Card {
  const scene = (input.scene || "").trim();
  const extra = (input.constraints || "").trim();
  const url = (input.url || "").trim();
  const blob = [scene, extra, url].filter(Boolean).join("\n");
  if (!scene) {
    return emptyCard();
  }

  const intent = inferIntent(blob, input.intent);
  if (intent === "sell") {
    return buildSellCard(blob, scene);
  }

  const packs = [...BUNDLED_PACKS, ...(opts.extraPacks || [])];
  const load = inferLoad(blob, input.load);
  const matched = matchPacks(blob, packs);
  const fit = matched.some((p) => p.id === "fit") || /\d{2}\s*mm/i.test(blob);
  const door = matched.some((p) => p.id === "door-power");
  const gift = /사은품|전모델호환|universal fit|free gift/i.test(blob);
  const mm = mmFrom(blob);
  const parts = parseParts(scene);
  const bom = parts.length >= 2;

  let verdict: Verdict = "OK";
  let verdictLine = "";
  const how: string[] = [];

  if (load === "heavy") {
    verdict = "no";
    verdictLine = "heavy — 일반 연장선으로 풀 일이 아님. 전용 회로/시공 쪽.";
    how.push("건조기·전열 연속 부하는 검색으로 해결하지 않음.");
    how.push("플러그·멀티탭이 따뜻하면 즉시 중단.");
  } else if (fit) {
    verdict = gift ? "unverified" : "conditional";
    if (gift) {
      verdictLine = "unverified — 제목·사은품만으로는 호환을 확정하지 않음.";
    } else if (mm) {
      verdictLine = `conditional — 스트랩 폭 ${mm}이 맞는지 리스팅 옵션을 확인.`;
    } else {
      verdictLine = "conditional — 모델명 + mm(스트랩 폭)이 필요함.";
    }
    how.push("케이스 지름 광고 숫자가 아니라 스트랩 폭(mm).");
    how.push("제목만 보지 말고 옵션·구성품 줄을 본다.");
  } else if (load === "microwave-tier" && door) {
    verdict = "conditional";
    verdictLine = bom
      ? "conditional — microwave-tier 묶음. 짧은 10–15A + 문풍지. 슬림 리본 단독 금지."
      : "conditional — microwave-tier. 짧은 10–15A + 문풍지 통과. 슬림 리본 단독 금지.";
    how.push("릴선은 끝까지 푼다. 같은 탭에 다른 전열기 금지.");
    how.push("피복을 문짝이 집어 물면 안 됨.");
  } else if (load === "microwave-tier") {
    verdict = "conditional";
    verdictLine = "conditional — microwave-tier. 10–15A 짧은 선, 정격 확인.";
    how.push("동시 사용 부하는 더한다.");
  } else if (load === "light" && door) {
    verdict = "OK";
    verdictLine = "OK — light. 일반 연장 + 문풍지 통과 가능.";
    how.push("LED·충전·선풍기 대역.");
  } else if (load === "light") {
    verdict = "OK";
    verdictLine = "OK — light. 일반 연장선으로 충분.";
  } else if (matched.length === 0) {
    verdict = "conditional";
    verdictLine = bom
      ? "conditional — 묶음은 나뉨. 모델·와트를 더 적으면 검색어가 정확해짐."
      : "conditional — 전용 팩 없음. 장면 토큰으로 검색어를 뽑음.";
    how.push("어느 몰이든 검색창에는 짧은 토큰만.");
  } else {
    verdict = "OK";
    verdictLine = bom
      ? `OK — 묶음 ${parts.length}줄. ${matched.map((p) => p.title).join(" · ")}`
      : `OK — ${matched.map((p) => p.title).join(" · ")} 팩.`;
  }
  if (bom && verdict !== "no") {
    how.push("아래 구성은 대안이 아니라 같이 사는 줄.");
  }

  const keywords: string[] = [];
  const avoid: string[] = ["검색창에 장문 블로그 질문", "몰 이름 + 하소연을 같이 넣기"];
  let shortlist: ShortItem[] = [];
  for (const q of sceneQueries(blob)) {
    pushUnique(keywords, q);
  }
  if (fit && mm) {
    pushUnique(keywords, `${mm} strap`);
    pushUnique(keywords, `${mm} 스트랩`);
  }
  for (const p of matched) {
    for (const k of p.keywords) {
      pushUnique(keywords, k);
    }
    for (const a of p.avoid) {
      pushUnique(avoid, a);
    }
    for (const s of p.shortlist) {
      if (!shortlist.some((x) => x.name === s.name)) {
        shortlist.push(s);
      }
    }
  }
  if (load === "microwave-tier" || load === "heavy") {
    pushUnique(avoid, "초슬림 문틈 전선");
    pushUnique(avoid, "unrated ribbon cord");
  }

  let listKind: ListKind = "classes";
  let items: CardItem[] = [];
  if (bom) {
    listKind = "bom";
    items = parts.map((name) => ({ name, role: "must" }));
    shortlist = items.map((i) => ({ name: i.name, why: "must" }));
  } else if (shortlist.length === 0 && !fit) {
    shortlist.push({ name: sceneQueries(scene)[0] || "scene token", why: "팩이 비면 장면 토큰만" });
  }

  return {
    verdict,
    verdictLine,
    load,
    how: how.slice(0, 3),
    keywords: keywords.slice(0, 10),
    avoid: avoid.slice(0, 6),
    shortlist: shortlist.slice(0, 6),
    packIds: matched.map((p) => p.id),
    fit,
    intent: "buy",
    listKind,
    items,
  };
}
