/* Institor desk webview */
(function () {
  const vscode = acquireVsCodeApi();
  const scene = document.getElementById("scene");
  const url = document.getElementById("url");
  const load = document.getElementById("load");
  const loadWrap = document.getElementById("loadWrap");
  const constraints = document.getElementById("constraints");
  const intent = document.getElementById("intent");
  const go = document.getElementById("go");
  const save = document.getElementById("save");
  const cardEl = document.getElementById("card");

  function payload() {
    return {
      scene: scene.value,
      url: url.value,
      load: load.value,
      constraints: constraints.value,
      intent: intent.value,
    };
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncMode() {
    const sell = intent.value === "sell";
    loadWrap.hidden = sell;
    scene.placeholder = sell
      ? "원본 Xbox One + 키넥트 + 무선 패드 1개"
      : "문풍지 + 15A 연장선 + 그로밋";
    constraints.placeholder = sell ? "빠진 구성, 상태 메모…" : "드릴 금지, 문풍 유지, 예산…";
  }

  function listTitle(kind) {
    if (kind === "bom") {
      return "필요 구성 (같이 사야 함)";
    }
    if (kind === "memo") {
      return "메모";
    }
    return "제품군";
  }

  function render(card, casesDir) {
    const kws = (card.keywords || [])
      .map((k) => `<button type="button" class="kw" data-kw="${esc(k)}">${esc(k)}</button>`)
      .join("");
    const how = (card.how || []).map((h) => `<li>${esc(h)}</li>`).join("");
    const avoid = (card.avoid || []).map((a) => `<li>${esc(a)}</li>`).join("");
    const rows = (card.items && card.items.length ? card.items : card.shortlist || [])
      .map((s) => {
        const name = s.name;
        const why = s.role === "must" ? "must" : s.role === "note" ? "메모" : s.why || "";
        return `<tr><td>${esc(name)}</td><td>${esc(why)}</td></tr>`;
      })
      .join("");
    const kind = card.listKind || "classes";
    cardEl.hidden = false;
    cardEl.className = "card kind-" + kind;
    const kwLabel = card.intent === "sell" ? "제목 토큰" : "검색어";
    cardEl.innerHTML =
      `<p class="verdict">${esc(card.verdictLine)}</p>` +
      `<div class="meta-row">` +
      `<span class="term" title="사기=검색해서 산다. 팔기=올릴 글 메모.">${esc(card.intent || "buy")}</span>` +
      (card.intent === "buy"
        ? ` · 로드 <span class="term" title="소비 전력 대역">${esc(card.load)}</span>`
        : "") +
      `</div>` +
      (how ? `<div>방법</div><ul>${how}</ul>` : "") +
      `<div>${esc(kwLabel)} <button type="button" class="btn" id="copyAll">모두 복사</button></div>` +
      `<div class="kws">${kws || "—"}</div>` +
      `<div>${esc(listTitle(kind))}</div>` +
      `<table><thead><tr><th>줄</th><th></th></tr></thead><tbody>${rows}</tbody></table>` +
      (avoid ? `<div>하지 말 것</div><ul>${avoid}</ul>` : "") +
      `<div class="meta">${esc(casesDir || "")}</div>`;
    save.disabled = false;
    cardEl.querySelectorAll(".kw").forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = btn.getAttribute("data-kw") || "";
        void navigator.clipboard.writeText(t);
      });
    });
    const copyAll = document.getElementById("copyAll");
    if (copyAll) {
      copyAll.addEventListener("click", () => {
        void navigator.clipboard.writeText((card.keywords || []).join("\n"));
      });
    }
  }

  intent.addEventListener("change", syncMode);
  syncMode();

  go.addEventListener("click", () => {
    if (!scene.value.trim()) {
      scene.focus();
      return;
    }
    vscode.postMessage({ type: "run", payload: payload() });
  });
  save.addEventListener("click", () => {
    vscode.postMessage({ type: "save" });
  });
  window.addEventListener("message", (ev) => {
    const msg = ev.data || {};
    if (msg.type === "card") {
      render(msg.card, msg.casesDir);
    }
    if (msg.type === "saved") {
      const meta = cardEl.querySelector(".meta");
      if (meta) {
        meta.textContent = "저장: " + msg.path;
      }
    }
  });
})();
