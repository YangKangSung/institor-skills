import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { LoadClass } from "./packs";
export { loadOverlayPacks as overlayPacks } from "./overlay";

export interface InstitorConfig {
  dataRoot: string;
  wikiRoot: string;
  skillsRoot: string;
  casesDir: string;
}

function expand(p: string): string {
  const t = p.trim();
  if (!t) {
    return "";
  }
  if (t.startsWith("~")) {
    return path.join(os.homedir(), t.slice(1).replace(/^[\\/]/, ""));
  }
  return t;
}

export function detectSkillsRoot(extensionPath: string): string {
  const cfg = vscode.workspace.getConfiguration("institor").get<string>("skillsRoot") || "";
  const set = expand(cfg);
  if (set && fs.existsSync(path.join(set, "institor", "SKILL.md"))) {
    return set;
  }
  let dir = extensionPath;
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(dir, "institor", "SKILL.md"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return "";
}

export function getConfig(extensionPath: string): InstitorConfig {
  const c = vscode.workspace.getConfiguration("institor");
  const dataRaw = expand(c.get<string>("dataRoot") || "");
  const dataRoot = dataRaw || path.join(os.homedir(), ".institor-data");
  const wikiRoot = expand(c.get<string>("wikiRoot") || "");
  const skillsRoot = detectSkillsRoot(extensionPath);
  const casesDir = wikiRoot || path.join(dataRoot, "cases");
  return { dataRoot, wikiRoot, skillsRoot, casesDir };
}

export function ensureDirs(cfg: InstitorConfig): void {
  fs.mkdirSync(cfg.dataRoot, { recursive: true });
  fs.mkdirSync(cfg.casesDir, { recursive: true });
}

export function parseLoad(raw: string): LoadClass | "" {
  if (raw === "light" || raw === "microwave-tier" || raw === "heavy" || raw === "unknown") {
    return raw;
  }
  return "";
}
