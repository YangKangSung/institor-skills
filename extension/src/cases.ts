import * as fs from "fs";
import * as path from "path";
import { Card, SceneInput } from "./engine";

function slug(s: string): string {
  const t = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return t || "case";
}

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function renderCase(input: SceneInput, card: Card): string {
  const title = input.scene.trim().slice(0, 80);
  const rows = card.shortlist
    .map((s, i) => `| ${i + 1} | ${s.name} | ${s.why} |`)
    .join("\n");
  const kws = card.keywords.map((k) => `- \`${k}\``).join("\n") || "-";
  const dont = card.avoid.map((a) => `- ${a}`).join("\n") || "-";
  const how = card.how.map((h) => `- ${h}`).join("\n") || "-";
  return `---
type: shopping-case
title: ${title}
date: ${today()}
load_class: ${card.load}
intent: ${card.intent}
list_kind: ${card.listKind}
status: research
verdict: ${card.verdict}
tags: [shopping]
---

## Scene

${input.scene.trim()}

## Constraints

${input.constraints?.trim() || "-"}

## URL

${input.url?.trim() || "-"}

## Verdict

${card.verdictLine}

## Load class

${card.load}

## How

${how}

## Keywords

${kws}

## Shortlist (classes)

| # | Class | Why |
|---|-------|-----|
${rows || "| 1 | | |"}

## Don’t

${dont}

## Decision

deferred
`;
}

export function writeCase(casesDir: string, input: SceneInput, card: Card): string {
  fs.mkdirSync(casesDir, { recursive: true });
  const name = `${today()}-${slug(input.scene)}.md`;
  const dest = path.join(casesDir, name);
  fs.writeFileSync(dest, renderCase(input, card), "utf8");
  return dest;
}

export interface CaseItem {
  file: string;
  title: string;
  date: string;
}

export function listCases(casesDir: string): CaseItem[] {
  if (!fs.existsSync(casesDir)) {
    return [];
  }
  const files = fs
    .readdirSync(casesDir)
    .filter((f) => f.endsWith(".md") && f !== "Index.md")
    .map((f) => path.join(casesDir, f));
  const items: CaseItem[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const title = (raw.match(/^title:\s*(.+)$/m) || [])[1]?.trim() || path.basename(file, ".md");
    const date = (raw.match(/^date:\s*(.+)$/m) || [])[1]?.trim() || "";
    items.push({ file, title, date });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.file < b.file ? 1 : -1));
  return items;
}
