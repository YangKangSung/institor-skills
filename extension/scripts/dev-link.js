#!/usr/bin/env node
/**
 * Junction this working tree into VS Code / Insiders / Cursor
 * so YangKangSung.institor loads from institor-skills/extension.
 *
 *   node scripts/dev-link.js
 *   node scripts/dev-link.js --unlink
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const folderName = `${pkg.publisher}.${pkg.name}-${pkg.version}`;
const marker = path.join(root, ".institor-dev");
const unlink = process.argv.includes("--unlink");

function extensionParents() {
  const home = os.homedir();
  const candidates = [
    path.join(home, ".vscode", "extensions"),
    path.join(home, ".vscode-insiders", "extensions"),
    path.join(home, ".cursor", "extensions"),
  ];
  const out = [];
  for (const p of candidates) {
    if (fs.existsSync(path.dirname(p))) {
      out.push(p);
    }
  }
  return out;
}

function rm(p) {
  fs.rmSync(p, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
}

function real(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return null;
  }
}

function isOurLink(p) {
  const r = real(p);
  return r !== null && path.resolve(r) === path.resolve(root);
}

function listInstitorDirs(extRoot) {
  if (!fs.existsSync(extRoot)) {
    return [];
  }
  const prefix = `${pkg.publisher}.${pkg.name}`;
  return fs
    .readdirSync(extRoot)
    .filter((n) => n === prefix || n.startsWith(`${prefix}-`))
    .map((n) => path.join(extRoot, n));
}

function ensureCompiled() {
  const mainJs = path.join(root, "out", "extension.js");
  if (fs.existsSync(mainJs)) {
    return;
  }
  console.log("[dev-link] out/ missing — compile once");
  const r = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "compile"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "development" },
  });
  if (r.status !== 0) {
    console.error("[dev-link] compile failed");
    process.exit(r.status || 1);
  }
}

function linkOne(extRoot) {
  fs.mkdirSync(extRoot, { recursive: true });
  const target = path.join(extRoot, folderName);

  for (const dir of listInstitorDirs(extRoot)) {
    if (path.resolve(dir) === path.resolve(target) && isOurLink(dir)) {
      continue;
    }
    console.log("[dev-link] remove", dir);
    rm(dir);
  }

  if (fs.existsSync(target) || real(target)) {
    if (isOurLink(target)) {
      console.log("[dev-link] ok", target, "->", root);
      return target;
    }
    console.log("[dev-link] replace", target);
    rm(target);
  }

  const type = process.platform === "win32" ? "junction" : "dir";
  fs.symlinkSync(root, target, type);
  console.log("[dev-link] linked", target, "->", root);
  return target;
}

function unlinkAll() {
  if (fs.existsSync(marker)) {
    fs.unlinkSync(marker);
    console.log("[dev-link] removed .institor-dev");
  }
  for (const extRoot of extensionParents()) {
    if (!fs.existsSync(extRoot)) {
      continue;
    }
    for (const dir of listInstitorDirs(extRoot)) {
      if (isOurLink(dir)) {
        console.log("[dev-link] unlink", dir);
        rm(dir);
      }
    }
  }
}

if (unlink) {
  unlinkAll();
  console.log("[dev-link] done (unlink). Reinstall the .vsix for a frozen copy.");
  process.exit(0);
}

ensureCompiled();

const linked = [];
for (const extRoot of extensionParents()) {
  linked.push(linkOne(extRoot));
}

if (linked.length === 0) {
  console.error("[dev-link] no editor extensions dir (.vscode / .cursor under home)");
  process.exit(1);
}

fs.writeFileSync(
  marker,
  [`institor dev link`, `created ${new Date().toISOString()}`, `version ${pkg.version}`, ...linked, ""].join("\n"),
  "utf8"
);

console.log("");
console.log("[dev-link] marker:", marker);
console.log("[dev-link] next: Developer: Reload Window (once)");
