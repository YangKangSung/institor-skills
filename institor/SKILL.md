---
name: institor
description: >-
  Shopping research agent skill: fit, load class, marketplace keywords, short
  shortlist. Triggers: /institor, institor, shopping helper, Naver, Coupang,
  product fit, 호환, 검색어, 장바구니, buy research. No checkout automation.
---

# Institor

Latin *institor* — trader/errand-runner who fetches for someone else.

Turn a **buy scene** into a **verdict-first** research card:

```text
link | keywords | load | constraints  →  /institor  →  verdict + keywords + shortlist
```

Spelling: skill **`institor`**. Repo may be `institor-skills`.

### Typo recognition

| Typed | Treat as |
|-------|----------|
| `institore` / `instittor` / `institorr` | institor |
| 쇼핑 도우미 / 장 봐줘 / 검색어 | this skill |

## Reply shape (default)

1. **First line = verdict** — short clause (OK / no / conditional).
2. **Load class** — light | microwave-tier | heavy (see `references/load-classes.md`).
3. **How** — 1–3 bullets (path, fit geometry, door/gap rules…).
4. **Keywords** — paste-ready mall search strings.
5. **Shortlist** — up to 3 *product classes* (not seller spam). Avoid fake prices.
6. **Don’t** — concrete anti-patterns.
7. Optional **case log** path for the operator’s notes.

Language: match the user (KO if they write KO).

## When to use

- Marketplace link + “does this fit my device?”
- “What do I search on Naver/Coupang for X?”
- Capacity / cord / multitap class (phone charger vs microwave-tier vs dryer-class)
- DIY scene: power through a door/window without wrecking seals
- Building a short shopping list from constraints

## When not to use

- Stock/securities buy flow  
- Auto-login checkout, card entry, coupon claim bots  
- Illegal acquisition / stolen account  
- Medical/legal advice disguised as product pick  

## Procedure

### 1. Parse

| Field | Examples |
|-------|----------|
| Scene | balcony paint power, watch strap, desk lamp |
| Device / site | model codes, door type |
| Load | watts, or class name |
| Constraints | no drill, keep heat seal, budget class |
| URL | mall PDP or order detail |

If the user pastes an **order/myshop** page, treat **shipped lines** as source of truth over PDP theory.

### 2. Route

| Signal | Action |
|--------|--------|
| Wearable/phone accessory fit, mm, lug, 사은품 adapter | Fit path — geometry + OEM vs third-party (see skill notes; operator may also keep a thicker private fit playbook) |
| Keywords / scene / load only | Keyword packs + load class |
| Heavy load (dryer, multi-kW heater) | State **heavy**; recommend proper circuit — do not pretend a door-gap cord is enough |

### 3. Load class

Read `references/load-classes.md`. Never upgrade “microwave-tier” advice into industrial feeder design in this skill.

### 4. Keywords

Read `references/keyword-packs.md`. Prefer short mall tokens over essay queries. Offer avoid-list (e.g. ultra-slim door cord for microwave-tier).

### 5. Shortlist

Name **classes** (e.g. “15A short extension”, “forced-vent weatherstrip”). Link live PDPs only when fetched this turn; don’t invent SKUs.

### 6. Honesty

| Label | When |
|-------|------|
| OK | Class known; constraints match |
| Conditional | Option (mm, length, A rating) must match |
| Unverified seller | Thin reviews; geometry from title only |
| No | Wrong family / unsafe for stated load |

Never claim you installed or purchased it.

### 7. Optional case log

If the operator keeps cases, use `references/case-template.md`. Public git samples must stay synthetic — no real addresses/orders.

## Anti-goals

1. Checkout / payment automation  
2. Fabricated reviews  
3. Host paths, real PII, card data in outputs destined for git  
4. “Just wedge any cord in the door” for continuous high load  

## Related files

- `references/load-classes.md`  
- `references/keyword-packs.md`  
- `references/case-template.md`  
- `../docs/sample-case-balcony-power.md`  

## Verification

- [ ] Verdict line first  
- [ ] Load class named when power matters  
- [ ] Keywords paste-ready  
- [ ] No fake purchase claims  
- [ ] Heavy loads not waved through on junk cords  
