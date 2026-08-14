# Institor VS Code — shopping desk

Date: 2026-08-14  
Repo: `institor-skills` (single SoT, no `-dev`)  
Status: approved direction — implement v0.1

## What it is

A **shopping desk** in the sidebar:

scene / URL / load / constraints → **verdict + load class + paste-ready keywords + ≤3 product classes + don’ts** → optional case markdown.

Judgment is **local packs** (`keyword-packs`, `load-classes`, `fit-routing`). No Hermes job. No harvest. No checkout.

## What it is not

- Kampff analyze shell (queue, spawn, pause, sites)
- Chrome coupon / price-compare
- DeskOS life OS
- Payment or mall scrape

## Layers

| Layer | Role |
|-------|------|
| `institor/SKILL.md` + `references/` | Pack SoT. Chat skill stays `/institor`. |
| `extension/` | Desk UI + local engine + case files |
| Operator cases | `wikiRoot` if set, else `{dataRoot}/cases` — not committed |

Bundled pack tables ship in the VSIX so the desk works without a clone. If `institor.skillsRoot` points at this repo, live markdown overlays the bundle.

## One loop

1. Type a scene (required). Optional URL, load override, constraints.
2. **조회** matches packs + load phrases/watts.
3. Card: verdict first. Copy keywords.
4. **케이스 저장** writes the case template filled.
5. **적용** `npm run apply` = compile → smoke → VSIX → `code --install-extension --force` → junction. Reload once.

## Settings

| Key | Default | Meaning |
|-----|---------|---------|
| `institor.dataRoot` | `~/.institor-data` | scratch + cases fallback |
| `institor.wikiRoot` | empty | durable case folder (operator: vault `Idea/Shopping`) |
| `institor.skillsRoot` | auto if `institor/SKILL.md` sits next to the extension | live pack overlay |

## Honesty

- Classes, not seller SKUs. No invented prices.
- `heavy` is not solved with a door-gap cord.
- Gift / “전모델호환” → conditional or unverified.
- Research guidance, not an electrical certificate.

## Done when

- `npm run compile` in `extension/` exits 0
- Smoke: balcony microwave-tier, dryer=heavy/no, 22mm strap=fit/conditional, LED=light
- F5 host: form → card → save opens a markdown case
