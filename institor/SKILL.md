---
name: institor
description: >-
  Shopping research agent skill: fit, load class, marketplace keywords, short
  shortlist. Triggers: /institor, institor, shopping helper, Naver, Coupang,
  product fit, 호환, 검색어, 장바구니, buy research, 문틈 전원, 연장선.
  No checkout automation. Single repo SoT: institor-skills (no -dev twin).
---

# Institor

Latin *institor* — trader/errand-runner who fetches for someone else.

```text
link | keywords | load | constraints  →  /institor  →  verdict + keywords + shortlist
```

Repo SoT: **`institor-skills` only** (no private `-dev` twin). Personal cases stay out of git.

Spelling: skill **`institor`**.

### Typo recognition

| Typed | Treat as |
|-------|----------|
| `institore` / `instittor` / `institorr` | institor |
| 쇼핑 도우미 / 장 봐줘 / 검색어 / 뭐 사 | this skill |

## Slash-ish commands

| Input | Do |
|-------|-----|
| `/institor` or bare scene | Full research card |
| `/institor keywords …` | Keyword pack only |
| `/institor load …` | Classify watts / appliance → load class |
| `/institor fit <url>` | Fit-first path (geometry) |
| `/institor case` | Emit filled case-template markdown for operator notes |

## Reply shape (default)

1. **First line = verdict** — OK / no / conditional + one clause.  
2. **Load class** — `light` | `microwave-tier` | `heavy` when power matters.  
3. **How** — 1–3 bullets.  
4. **Keywords** — paste-ready (KR malls default if user is KO).  
5. **Shortlist** — ≤3 **product classes** (not seller spam; no invented prices).  
6. **Don’t** — concrete anti-patterns.  
7. Optional case stub if they will reuse the scene.

Language: match the user (KO if they write KO).

## When to use

- Marketplace link + fit/호환  
- Naver/Coupang search terms  
- Cord / multitap / capacity class  
- Door/window power pass without wrecking seals  
- Short shopping list from constraints  

## When not to use

- Securities / stock flow  
- Checkout, card entry, coupon bots  
- Illegal acquisition  
- Medical/legal product claims  

## Procedure

### 1. Parse

| Field | Examples |
|-------|----------|
| Scene | balcony paint power, watch strap, desk lamp |
| Device / site | model, door type (hinged / sliding) |
| Load | W, A, or class name |
| Constraints | no drill, keep heat seal, budget |
| URL | PDP or **order/myshop** detail |

Order page beats PDP theory (gift adapters, real options).

### 2. Route

| Signal | Action |
|--------|--------|
| Wearable/phone accessory, mm, lug, 사은품 | **Fit path** → `references/fit-routing.md` |
| Scene / keywords / BOM | Keyword packs + shortlist |
| Power draw mentioned | Load class first, then cord keywords |
| heavy (dryer, multi-kW heat) | Say **heavy**; do not “solve” with door-gap cord shopping |

### 3. Load class

`references/load-classes.md`  
Never dress industrial feeder design as a mall tip.

### 4. Keywords

`references/keyword-packs.md`  
Short tokens > essay queries. Include **avoid** list when load ≥ microwave-tier.

### 5. Shortlist

Classes only unless a live URL was fetched this turn. No fake SKUs.

### 6. Honesty labels

| Label | When |
|-------|------|
| OK | Class known; constraints match |
| Conditional | mm / length / amp rating must match |
| Unverified seller | Title-only geometry |
| No | Wrong family or unsafe for load |

Never claim you bought or installed it.

### 7. Case log (optional)

`references/case-template.md` → operator vault/notes.  
Public git samples must stay synthetic.

## Anti-goals

1. Checkout / payment automation  
2. Fabricated reviews  
3. Host paths, real PII, cards in git-bound output  
4. Microwave-tier+ on crushed novelty ribbon cords  

## Related files

- `references/load-classes.md`  
- `references/keyword-packs.md`  
- `references/fit-routing.md`  
- `references/case-template.md`  
- `../docs/sample-case-balcony-power.md`  

## Verification

- [ ] Verdict first  
- [ ] Load named when power matters  
- [ ] Keywords paste-ready  
- [ ] No fake purchase claims  
- [ ] Heavy not waved through  
