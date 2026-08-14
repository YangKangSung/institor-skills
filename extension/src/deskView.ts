import * as vscode from "vscode";
import { Card, SceneInput, buildCard } from "./engine";
import { ensureDirs, getConfig, overlayPacks, parseLoad } from "./config";
import { writeCase } from "./cases";

export class DeskViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "institor.desk";
  private view?: vscode.WebviewView;
  private lastInput?: SceneInput;
  private lastCard?: Card;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly onSaved: () => void
  ) {}

  last(): { input: SceneInput; card: Card } | undefined {
    if (!this.lastInput || !this.lastCard) {
      return undefined;
    }
    return { input: this.lastInput, card: this.lastCard };
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _ctx: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    const media = vscode.Uri.joinPath(this.extensionUri, "media");
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [media],
    };
    webviewView.webview.html = this.html(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((msg: { type?: string; payload?: Record<string, string> }) => {
      void this.onMessage(msg);
    });
  }

  async saveLast(): Promise<string | undefined> {
    const last = this.last();
    if (!last) {
      void vscode.window.showWarningMessage("Institor: 먼저 조회하세요.");
      return undefined;
    }
    const cfg = getConfig(this.extensionUri.fsPath);
    ensureDirs(cfg);
    const dest = writeCase(cfg.casesDir, last.input, last.card);
    this.onSaved();
    this.post({ type: "saved", path: dest });
    return dest;
  }

  private post(msg: unknown): void {
    void this.view?.webview.postMessage(msg);
  }

  private async onMessage(msg: { type?: string; payload?: Record<string, string> }): Promise<void> {
    if (msg.type === "run") {
      const p = msg.payload || {};
      const input: SceneInput = {
        scene: p.scene || "",
        url: p.url || "",
        load: parseLoad(p.load || ""),
        constraints: p.constraints || "",
      };
      const cfg = getConfig(this.extensionUri.fsPath);
      const card = buildCard(input, { extraPacks: overlayPacks(cfg.skillsRoot) });
      this.lastInput = input;
      this.lastCard = card;
      this.post({ type: "card", card, casesDir: cfg.casesDir });
      return;
    }
    if (msg.type === "save") {
      const dest = await this.saveLast();
      if (dest) {
        const doc = await vscode.workspace.openTextDocument(dest);
        await vscode.window.showTextDocument(doc, { preview: true });
      }
    }
  }

  private html(webview: vscode.Webview): string {
    const nonce = getNonce();
    const css = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "desk.css"));
    const js = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "desk.js"));
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${css}" />
</head>
<body>
  <details class="guide">
    <summary>시작</summary>
    <ol>
      <li>장면을 한 줄 적는다 (예: 발코니 문틈으로 전자레인지급 전원).</li>
      <li>조회 → 판정·키워드·제품군.</li>
      <li>필요하면 케이스 저장.</li>
    </ol>
    <p class="hint">에이전트 없음. 팩 매칭만. 결제 없음.</p>
  </details>
  <label>장면 <span class="req">*</span></label>
  <textarea id="scene" rows="3" placeholder="무엇을 / 어디에 / 왜"></textarea>
  <label>링크</label>
  <input id="url" type="text" placeholder="PDP 또는 주문 상세 URL" />
  <label>로드 <span class="term" title="소비 전력 대역. light / microwave-tier / heavy">클래스</span></label>
  <select id="load">
    <option value="">자동</option>
    <option value="light">light</option>
    <option value="microwave-tier">microwave-tier</option>
    <option value="heavy">heavy</option>
  </select>
  <label>제약</label>
  <input id="constraints" type="text" placeholder="드릴 금지, 문풍 유지, 예산…" />
  <div class="row">
    <button id="go" class="btn primary" type="button">조회</button>
    <button id="save" class="btn" type="button" disabled>케이스 저장</button>
  </div>
  <div id="card" hidden></div>
  <script nonce="${nonce}" src="${js}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}
