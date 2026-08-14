# VS Code Marketplace — YangKangSung.institor

Same publisher and sequence as Kampff. Product SoT is **this repo** (`institor-skills`). No `-dev` twin.

| Item | Value |
|------|--------|
| Publisher | `YangKangSung` |
| Extension id | `YangKangSung.institor` |
| Build cwd | `extension/` |
| Artifact | `extension/institor-<ver>.vsix` (gitignored) |
| Public repo | https://github.com/YangKangSung/institor-skills |
| Live item | `vsce show YangKangSung.institor` — package ≠ published |

## Sequence

```text
1 edit institor-skills (skill + extension) → origin (product-only)
2 NODE_ENV=development  npm ci && npm run lint && npm run smoke && npm run package
3 Manage UI or vsce publish → YangKangSung.institor
```

```bash
cd extension
export NODE_ENV=development
npm ci
npm run lint && npm run smoke && npm run package
# → institor-0.1.0.vsix
```

Open dialog: do not type a raw `D:\…` path. Copy the vsix to `%USERPROFILE%\institor.vsix` or paste from clipboard.

## Publish A — CLI

```bash
# Azure DevOps PAT: Marketplace (Manage). Never paste into chat.
export VSCE_PAT='…'
cd extension
npx @vscode/vsce publish -p "$VSCE_PAT"
```

## Publish B — Manage UI

1. https://marketplace.visualstudio.com/manage/publishers/YangKangSung
2. New extension → Visual Studio Code
3. Upload `institor-*.vsix` (or `%USERPROFILE%\institor.vsix`)
4. Human reCAPTCHA, then Upload

## Verify

```bash
npx @vscode/vsce show YangKangSung.institor
# https://marketplace.visualstudio.com/items?itemName=YangKangSung.institor
```

Local `npm run apply` / junction ≠ gallery.

## Do not

- Claim published after package only
- Commit PAT, `node_modules`, `*.vsix`
- Ship host folder defaults (`D:\…`) or real orders/PII
- Checkout / coupon bots
- Upload from some other repo’s leftover vsix

## Related

- `extension/README.md` — apply + settings
- Kampff twin: `kampff-vscode` → marketplace-publish (same publisher)
