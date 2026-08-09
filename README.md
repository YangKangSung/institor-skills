# Institor

### The agent that runs the errand.

[![Stars](https://img.shields.io/github/stars/YangKangSung/institor-skills?style=social)](https://github.com/YangKangSung/institor-skills/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Skill](https://img.shields.io/badge/agent-SKILL.md-0ea5e9)](institor/SKILL.md)

> Latin *institor* — the trader who fetches on someone else’s behalf.  
> You name the job. It returns **fit · load class · search keywords · short shortlist**.

---

## What is Institor?

An **agent skill** for shopping research (not checkout):

```text
scene · link · load class  →  /institor  →  verdict + keywords + 3 product classes
```

| Sibling | Job |
|---------|-----|
| [Kampff](https://github.com/YangKangSung/kampff-skills) | Read the board (people / distance) |
| **Institor** | Run the market errand (buy research) |

## Install

Copy or submodule the `institor/` folder into your agent skills directory, or point your agent at this repo’s skill path.

Triggers: `/institor`, `institor`, shopping research, Naver/Coupang keywords, product fit, load class.

## Quick example (synthetic)

**Ask:** Power a balcony workspace from a bedroom outlet without wrecking the door seal. Load ≈ microwave (~1–1.5 kW).

**Verdict:** microwave-tier OK with a short 10–15A cord + door weatherstrip pass; no slim “door gap only” junk cord; no space heater on the same strip.

**Keywords (KR malls):** `강제환기 전용 문풍지` · `연장선 15A` · `문풍지 창문`

Full sample: [docs/sample-case-balcony-power.md](docs/sample-case-balcony-power.md)

## Skill surface

| Path | Role |
|------|------|
| [institor/SKILL.md](institor/SKILL.md) | Procedure + reply shape |
| [institor/references/load-classes.md](institor/references/load-classes.md) | light / microwave-tier / heavy |
| [institor/references/keyword-packs.md](institor/references/keyword-packs.md) | Search packs |
| [institor/references/case-template.md](institor/references/case-template.md) | Case log shape |

## Anti-goals

- Auto checkout / payment / coupon bots  
- Invented reviews or fake “I bought this”  
- Treating heavy electrical work as a shopping tip  
- Shipping real orders, addresses, or host paths in git  

## Layers (like Kampff)

| Layer | Repo | Visibility |
|-------|------|------------|
| **Public** | `institor-skills` | this repo |
| **Dev** | `institor-skills-dev` | private twin |
| **Live** | your agent skill dir | operator only |
| **Data** | local case notes | never git secrets |

## License

MIT — see [LICENSE](LICENSE).

## Related

- Kampff: https://github.com/YangKangSung/kampff-skills  
- Changelog: [CHANGELOG.md](CHANGELOG.md) · Security: [SECURITY.md](SECURITY.md)
