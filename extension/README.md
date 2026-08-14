# Institor

Shopping desk for VS Code. Type a scene → **verdict · load class · paste-ready mall keywords · ≤3 product classes**. Save a case note if you will reuse the scene.

No checkout. No price scrape. No coupons.

## Use

1. Activity bar bag → **쇼핑 데스크**
2. Scene (`발코니 문틈으로 전자레인지급 전원`)
3. **조회** — copy keywords
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

Marketplace publish: [docs/marketplace-publish.md](../docs/marketplace-publish.md)

## Packs

Local tables from `institor/references/` (load class, keyword packs, fit). The chat skill `/institor` is a separate surface.
