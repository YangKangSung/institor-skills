import * as fs from "fs";
import * as vscode from "vscode";
import { CaseTreeProvider } from "./caseTree";
import { ensureDirs, getConfig } from "./config";
import { DeskViewProvider } from "./deskView";

export function activate(context: vscode.ExtensionContext): void {
  const extPath = context.extensionPath;
  const cases = new CaseTreeProvider(extPath);
  const desk = new DeskViewProvider(context.extensionUri, () => cases.refresh());

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(DeskViewProvider.viewType, desk),
    vscode.window.registerTreeDataProvider("institor.cases", cases),
    vscode.commands.registerCommand("institor.openDesk", () => {
      void vscode.commands.executeCommand("institor.desk.focus");
    }),
    vscode.commands.registerCommand("institor.saveCase", async () => {
      const dest = await desk.saveLast();
      if (dest) {
        void vscode.window.showInformationMessage(`Institor: 저장 ${dest}`);
      }
    }),
    vscode.commands.registerCommand("institor.openCases", async () => {
      const cfg = getConfig(extPath);
      ensureDirs(cfg);
      if (!fs.existsSync(cfg.casesDir)) {
        void vscode.window.showWarningMessage("Institor: 케이스 폴더가 없습니다.");
        return;
      }
      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(cfg.casesDir));
    }),
    vscode.commands.registerCommand("institor.refreshCases", () => cases.refresh()),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("institor")) {
        cases.refresh();
      }
    })
  );
}

export function deactivate(): void {
  /* noop */
}
