import * as vscode from "vscode";
import { listCases } from "./cases";
import { getConfig } from "./config";

export class CaseTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(private readonly extensionPath: string) {}

  refresh(): void {
    this._onDidChange.fire();
  }

  getTreeItem(el: vscode.TreeItem): vscode.TreeItem {
    return el;
  }

  getChildren(): vscode.TreeItem[] {
    const cfg = getConfig(this.extensionPath);
    const items = listCases(cfg.casesDir);
    return items.map((c) => {
      const t = new vscode.TreeItem(c.title, vscode.TreeItemCollapsibleState.None);
      t.resourceUri = vscode.Uri.file(c.file);
      t.description = c.date;
      t.command = {
        command: "vscode.open",
        title: "Open",
        arguments: [vscode.Uri.file(c.file)],
      };
      t.tooltip = new vscode.MarkdownString(`${c.title}\n\n\`${c.file}\``);
      t.contextValue = "institorCase";
      return t;
    });
  }
}
