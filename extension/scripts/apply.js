#!/usr/bin/env node
/**
 * Kampff-class apply: compile → smoke → VSIX → install → junction.
 *
 *   npm run apply
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const vsix = path.join(root, `${pkg.name}-${pkg.version}.vsix`);
const env = { ...process.env, NODE_ENV: "development" };

function run(cmd, args, opts = {}) {
  const quoted = /\s/.test(cmd) ? `"${cmd}"` : cmd;
  console.log(`\n$ ${quoted} ${args.join(" ")}`);
  const r = spawnSync(quoted, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env,
    ...opts,
  });
  if (r.status !== 0) {
    console.error(`[apply] failed: ${cmd} ${args.join(" ")} (rc=${r.status})`);
    process.exit(r.status || 1);
  }
  return r;
}

function findCode() {
  const home = os.homedir();
  const names = process.platform === "win32" ? ["code.cmd", "code-insiders.cmd"] : ["code", "code-insiders"];
  for (const n of names) {
    const w = spawnSync(process.platform === "win32" ? "where" : "which", [n.replace(".cmd", "")], {
      encoding: "utf8",
      shell: true,
    });
    const line = (w.stdout || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
    if (line && fs.existsSync(line)) {
      return line;
    }
  }
  const extra = [
    path.join(home, "AppData", "Local", "Programs", "Microsoft VS Code", "bin", "code.cmd"),
    path.join(home, "AppData", "Local", "Programs", "Microsoft VS Code Insiders", "bin", "code-insiders.cmd"),
    "C:\\Program Files\\Microsoft VS Code\\bin\\code.cmd",
    "C:\\Program Files\\Microsoft VS Code Insiders\\bin\\code-insiders.cmd",
  ];
  for (const p of extra) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return "";
}

console.log(`[apply] ${pkg.publisher}.${pkg.name}@${pkg.version}`);
run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "compile"]);
run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "smoke"]);
run(process.platform === "win32" ? "npx.cmd" : "npx", [
  "--yes",
  "@vscode/vsce",
  "package",
  "--no-dependencies",
]);

if (!fs.existsSync(vsix)) {
  console.error("[apply] missing", vsix);
  process.exit(1);
}

const code = findCode();
if (!code) {
  console.error("[apply] VS Code CLI not found. VSIX is ready:");
  console.error(" ", vsix);
  console.error("Install from Extensions → … → Install from VSIX, then: npm run dev:link");
  process.exit(2);
}

run(code, ["--install-extension", vsix, "--force"]);
run(process.execPath, [path.join(root, "scripts", "dev-link.js")]);

const listed = spawnSync(code, ["--list-extensions", "--show-versions"], {
  encoding: "utf8",
  shell: true,
  env,
});
const id = `${pkg.publisher}.${pkg.name}`;
const hit = (listed.stdout || "")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s.toLowerCase().includes("institor"));
console.log("\n[apply] triangle");
console.log("  package.json", pkg.version);
console.log("  vsix        ", path.basename(vsix));
console.log("  installed   ", hit.join(", ") || "(none listed)");
console.log("  id          ", id);
console.log("\n[apply] next: Developer: Reload Window");
