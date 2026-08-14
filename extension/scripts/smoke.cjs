"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildCard, inferLoad, parseWatts } = require("../out/engine.js");
const { writeCase, listCases } = require("../out/cases.js");
const { parsePacksMd, loadOverlayPacks } = require("../out/overlay.js");

assert.strictEqual(parseWatts("1.2kW"), 1200);
assert.strictEqual(inferLoad("발코니 문틈으로 전자레인지급 전원"), "microwave-tier");
assert.strictEqual(inferLoad("건조기"), "heavy");
assert.strictEqual(inferLoad("LED 램프"), "light");

const balcony = buildCard({ scene: "발코니 문틈으로 전자레인지급 전원" });
assert.strictEqual(balcony.load, "microwave-tier");
assert.ok(balcony.packIds.includes("door-power"));
assert.ok(balcony.keywords.some((k) => k.includes("문풍지") || k.includes("15A")));
assert.notStrictEqual(balcony.verdict, "OK");

const dryer = buildCard({ scene: "건조기를 문틈 코드로" });
assert.strictEqual(dryer.load, "heavy");
assert.strictEqual(dryer.verdict, "no");

const strap = buildCard({ scene: "갤럭시워치 22mm 스트랩" });
assert.ok(strap.fit);
assert.strictEqual(strap.verdict, "conditional");
assert.ok(strap.keywords.some((k) => k.includes("22mm")));

const lamp = buildCard({ scene: "책상 LED 램프" });
assert.strictEqual(lamp.load, "light");
assert.strictEqual(lamp.verdict, "OK");

const amazon = buildCard({ scene: "balcony door gap for microwave power cord" });
assert.ok(amazon.keywords.length >= 2);
assert.ok(amazon.keywords.some((k) => /door|balcony|weatherstrip|cord/i.test(k)));
assert.ok(!JSON.stringify(amazon).includes("쿠팡"));
assert.ok(!JSON.stringify(amazon).includes("네이버"));

const empty = buildCard({ scene: "" });
assert.strictEqual(empty.verdict, "no");

const sell = buildCard({
  scene: "원본 Xbox One(뚱뚱한 1세대) + 키넥트 + 무선 패드 1개",
  intent: "sell",
});
assert.strictEqual(sell.intent, "sell");
assert.strictEqual(sell.verdict, "OK");
assert.ok(sell.keywords.some((k) => /키넥트|Kinect/i.test(k)));
assert.ok(sell.avoid.some((a) => /S\/X|풀세트/.test(a)));
assert.ok(!sell.verdictLine.includes("전용 팩 없음"));
assert.ok(!JSON.stringify(sell).includes("쿠팡"));
assert.strictEqual(sell.listKind, "memo");
assert.ok(sell.items.length >= 3);

const bom = buildCard({ scene: "문풍지 + 15A 연장선 + 케이블 그로밋" });
assert.strictEqual(bom.intent, "buy");
assert.strictEqual(bom.listKind, "bom");
assert.strictEqual(bom.items.length, 3);
assert.ok(bom.items.every((i) => i.role === "must"));

const md = fs.readFileSync(
  path.join(__dirname, "..", "..", "institor", "references", "keyword-packs.md"),
  "utf8"
);
const live = parsePacksMd(md);
assert.ok(live.length >= 3, "expected live packs from keyword-packs.md");
assert.ok(live.some((p) => p.keywords.includes("강제환기 전용 문풍지")));
const fromRoot = loadOverlayPacks(path.join(__dirname, "..", ".."));
assert.ok(fromRoot.length >= 3);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "institor-case-"));
const dest = writeCase(dir, { scene: "발코니 문틈으로 전자레인지급 전원" }, balcony);
assert.ok(fs.existsSync(dest));
const body = fs.readFileSync(dest, "utf8");
assert.ok(body.includes("microwave-tier"));
assert.ok(body.includes("type: shopping-case"));
assert.strictEqual(listCases(dir).length, 1);
fs.rmSync(dir, { recursive: true, force: true });

console.log("institor engine smoke: ok");
