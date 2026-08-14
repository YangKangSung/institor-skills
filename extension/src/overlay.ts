import * as fs from "fs";
import * as path from "path";
import { Pack } from "./packs";

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "pack"
  );
}

/** Parse `## Pack: title` sections and backtick queries from keyword-packs.md. */
export function parsePacksMd(md: string): Pack[] {
  const chunks = md.split(/^## Pack:\s*/m).slice(1);
  const out: Pack[] = [];
  for (const chunk of chunks) {
    const lines = chunk.split(/\r?\n/);
    const title = (lines[0] || "").trim();
    if (!title || /^avoid noise/i.test(title)) {
      continue;
    }
    const keywords: string[] = [];
    const avoid: string[] = [];
    let inAvoid = false;
    for (const line of lines.slice(1)) {
      if (/^\*\*Avoid/i.test(line) || /^## /.test(line)) {
        inAvoid = /^\*\*Avoid/i.test(line);
        if (/^## /.test(line)) {
          break;
        }
      }
      const ticks = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter(Boolean);
      if (inAvoid) {
        for (const t of ticks) {
          if (!avoid.includes(t)) {
            avoid.push(t);
          }
        }
      } else {
        for (const t of ticks) {
          if (!keywords.includes(t)) {
            keywords.push(t);
          }
        }
      }
    }
    const signals = title
      .split(/[/\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 3);
    out.push({
      id: `live-${slug(title)}`,
      title,
      keywords,
      avoid,
      shortlist: [],
      signals,
    });
  }
  return out;
}

export function loadOverlayPacks(skillsRoot: string): Pack[] {
  if (!skillsRoot) {
    return [];
  }
  const file = path.join(skillsRoot, "institor", "references", "keyword-packs.md");
  if (!fs.existsSync(file)) {
    return [];
  }
  return parsePacksMd(fs.readFileSync(file, "utf8"));
}
