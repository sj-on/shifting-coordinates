#!/usr/bin/env node
// Removes the build output directory. Cross-platform (uses fs, not `rm -rf`,
// so this also works in a plain Windows shell, not just bash).

const fs = require("fs");
const path = require("path");

const SITE_DIR = path.join(__dirname, "..", "_site");

fs.rmSync(SITE_DIR, { recursive: true, force: true });
console.log(`cleaned: ${path.relative(process.cwd(), SITE_DIR) || "_site"}`);