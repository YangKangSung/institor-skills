/* Institor desk webview */
(function () {
  const vscode = acquireVsCodeApi();
  const scene = document.getElementById("scene");
  const url = document.getElementById("url");
  const load = document.getElementById("load");
  const constraints = document.getElementById("constraints");
  const go = document.getElementById("go");
  const save = document.getElementById("save");
  const cardEl = document.getElementById("card");

  function payload() {
    return {
      scene: scene.value,
      url: url.value,
      load: load.value,
      constraints: constraints.value,
    };
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(card, casesDir) {
    const kws = (card.keywords || [])
      .map((k) => `<button type="button" class="kw" data-kw="${esc(k)}">${esc(k)}</button>`)
      .join("");
    const how = (card.how || []).map((h) => `<li>${esc(h)}</li>`).join("");
    const avoid = (card.avoid || []).map((a) => `<li>${esc(a)}</li>`).join("");
    const rows = (card.shortlist || [])
      .map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.why)}</td></tr>`)
      .join("");
    cardEl.hidden = false;
    cardEl.className = "card";
    cardEl.innerHTML =
      `<p class="verdict">${esc(card.verdictLine)}</p>` +
      `<div>로드: <span class="term" title="소비 전력 대역">${esc(card.load)}</span></div>` +
      (how ? `<div>방법</div><ul>${how}</ul>` : "") +
      `<div>키워드 <button type="button" class="btn" id="copyAll">모두 복사</button></div>` +
      `<div class="kws">${kws || "—"}</div>` +
      `<div>숏리스트 (제품군)</div>` +
      `<table><thead><tr><th>클래스</th><th>이유</th></tr></thead><tbody>${rows}</tbody></table>` +
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
