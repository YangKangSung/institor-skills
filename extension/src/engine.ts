import { BUNDLED_PACKS, LOAD_PHRASES, LoadClass, Pack } from "./packs";

export type Verdict = "OK" | "no" | "conditional" | "unverified";

export interface SceneInput {
  scene: string;
  url?: string;
  load?: LoadClass | "";
  constraints?: string;
}

export interface ShortItem {
  name: string;
  why: string;
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

export function buildCard(input: SceneInput, opts: EngineOptions = {}): Card {
  const scene = (input.scene || "").trim();
  const extra = (input.constraints || "").trim();
  const url = (input.url || "").trim();
  const blob = [scene, extra, url].filter(Boolean).join("\n");
  if (!scene) {
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
    };
  }

  const packs = [...BUNDLED_PACKS, ...(opts.extraPacks || [])];
  const load = inferLoad(blob, input.load);
  const matched = matchPacks(blob, packs);
  const fit = matched.some((p) => p.id === "fit") || /\d{2}\s*mm/i.test(blob);
  const door = matched.some((p) => p.id === "door-power");
  const gift = /사은품|전모델호환/.test(blob);
  const mm = mmFrom(blob);

  let verdict: Verdict = "OK";
  let verdictLine = "";
  const how: string[] = [];

  if (load === "heavy") {
    verdict = "no";
    verdictLine = "heavy — 문틈·쇼핑몰 코드로 풀 일이 아님. 전용 회로/시공 쪽.";
    how.push("건조기·전열 연속 부하는 쇼핑 팁 범위 밖.");
    how.push("플러그·멀티탭이 따뜻하면 즉시 중단.");
  } else if (fit) {
    verdict = gift ? "unverified" : mm ? "conditional" : "conditional";
    if (gift) {
      verdictLine = "unverified — 제목·사은품만으로는 호환을 확정하지 않음.";
    } else if (mm) {
      verdictLine = `conditional — 스트랩 폭 ${mm}이 맞는지 리스팅 옵션을 확인.`;
    } else {
      verdictLine = "conditional — 모델명 + mm(스트랩 폭)이 필요함.";
    }
    how.push("케이스 지름 광고 숫자가 아니라 스트랩 폭(mm).");
    how.push("주문/마이쇼핑이면 사은품 줄까지 본다.");
    if (mm) {
      how.push(`${mm} 스트랩과 어댑터가 같은 폭이어야 함.`);
    }
  } else if (load === "microwave-tier" && door) {
    verdict = "conditional";
    verdictLine = "conditional — microwave-tier. 짧은 10–15A + 문풍지 통과. 슬림 리본 단독 금지.";
    how.push("릴선은 끝까지 푼다. 같은 탭에 다른 전열기 금지.");
    how.push("피복을 문짝이 집어 물면 안 됨.");
  } else if (load === "microwave-tier") {
    verdict = "conditional";
    verdictLine = "conditional — microwave-tier. 10–15A 짧은 선, 정격 확인.";
    how.push("동시 사용 부하는 더한다.");
  } else if (load === "light" && door) {
    verdict = "OK";
    verdictLine = "OK — light. 일반 연장 + 문풍지 통과 가능. 전선이 짓눌리지 않게.";
    how.push("LED·충전·선풍기 대역.");
  } else if (load === "light") {
    verdict = "OK";
    verdictLine = "OK — light. 일반 연장선으로 충분.";
  } else if (matched.length === 0) {
    verdict = "conditional";
    verdictLine = "conditional — 맞는 팩이 없음. 장면·모델·와트를 더 적으면 키워드가 생긴다.";
    how.push("네이버/쿠팡에는 짧은 토큰만. 장문 질문 금지.");
  } else {
    verdict = "OK";
    verdictLine = `OK — ${matched.map((p) => p.title).join(" · ")} 팩.`;
  }

  const keywords: string[] = [];
  const avoid: string[] = ["검색창에 장문 블로그 질문", "영어만으로 KR SKU 찾기"];
  const shortlist: ShortItem[] = [];
  if (fit && mm) {
    keywords.push(`${mm} 스트랩`, `스트랩 ${mm}`, "전용 어댑터");
  }
  for (const p of matched) {
    for (const k of p.keywords) {
      if (!keywords.includes(k)) {
        keywords.push(k);
      }
    }
    for (const a of p.avoid) {
      if (!avoid.includes(a)) {
        avoid.push(a);
      }
    }
    for (const s of p.shortlist) {
      if (!shortlist.some((x) => x.name === s.name)) {
        shortlist.push(s);
      }
    }
  }
  if (load === "microwave-tier" || load === "heavy") {
    for (const a of ["초슬림 문틈 전선", "무정격 리본 코드"]) {
      if (!avoid.includes(a)) {
        avoid.push(a);
      }
    }
  }
  if (shortlist.length === 0 && !fit) {
    shortlist.push({ name: "장면 키워드 1종", why: "팩이 비어 있으면 토큰만" });
  }

  return {
    verdict,
    verdictLine,
    load,
    how: how.slice(0, 3),
    keywords: keywords.slice(0, 10),
    avoid: avoid.slice(0, 6),
    shortlist: shortlist.slice(0, 3),
    packIds: matched.map((p) => p.id),
    fit,
  };
}
