# Institor

Shopping desk for VS Code. Type a purpose (`A + B + C`) → **verdict · queries · list**.

- **사기** — list is a BOM (buy together), not three alternatives.
- **팔기** — list is a memo (title tokens + what's in the box). No price.

Any shop search box. No checkout. No coupons.

## Use

1. Activity bar bag → **쇼핑 데스크**
2. Scene (`balcony door gap microwave-tier power` / `발코니 문틈으로 전자레인지급 전원`)
3. **조회** — copy a query, paste into whatever shop you use
4. Optional **케이스 저장**

## Settings

| Key | Meaning |
|-----|---------|
| `institor.dataRoot` | Scratch. Empty → `~/.institor-data` |
| `institor.wikiRoot` | Durable cases. Empty → `{dataRoot}/cases` |
| `institor.skillsRoot` | `institor-skills` clone for live packs. Auto if the extension sits in that repo |

## Apply (local)

```text
cd extension
npm run apply
# then: Developer: Reload Window
```

Marketplace: [docs/marketplace-publish.md](../docs/marketplace-publish.md)

## Packs

Local tables from `institor/references/` (load class, keyword packs, fit). The chat skill `/institor` is a separate surface.
