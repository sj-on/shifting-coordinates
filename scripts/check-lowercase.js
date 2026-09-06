#!/usr/bin/env node
// Enforces house style: the whole site (chapter content + site data) is lowercase.
// Scans src/chapters/*.md and src/_data/site.json for stray capital letters.
//
// Deliberately does NOT scan .njk/.css files — those contain SVG path data,
// hex colors, and template code where capitals are legitimate (and would be
// false positives here). This checks the prose you actually write per chapter.
//
// Escape hatch: end a markdown line with `<!-- lint: allow-caps -->` if a
// capital letter on that line is intentional (e.g. a proper noun you want to
// keep capitalized). The line is skipped entirely.
//
// Usage:
//   node scripts/check-lowercase.js          exits 1 and lists violations if any
//   node scripts/check-lowercase.js --warn   never exits non-zero, just prints

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WARN_ONLY = process.argv.includes("--warn");

const ALLOW_MARKER = "<!-- lint: allow-caps -->";
const CAP_RE = /[A-Z]/;

function checkMarkdownFile(filePath) {
  const violations = [];
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  let inFence = false;

  lines.forEach((rawLine, i) => {
    if (rawLine.trim().startsWith("```")) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (rawLine.includes(ALLOW_MARKER)) return;

    // Strip inline code spans (`like this`) before checking — code can have caps.
    const line = rawLine.replace(/`[^`]*`/g, "");

    if (CAP_RE.test(line)) {
      violations.push({ line: i + 1, text: rawLine.trim() });
    }
  });

  return violations;
}

function checkSiteJson(filePath) {
  const violations = [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && CAP_RE.test(value)) {
      violations.push({ line: key, text: value });
    }
  }
  return violations;
}

(async () => {
  const chaptersDir = path.join(ROOT, "src/chapters");
  const chapterFiles = fs
    .readdirSync(chaptersDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(chaptersDir, f));
  const siteJsonPath = path.join(ROOT, "src/_data/site.json");

  let totalViolations = 0;

  for (const file of chapterFiles.sort()) {
    const violations = checkMarkdownFile(file);
    if (violations.length) {
      totalViolations += violations.length;
      console.log(`\n${path.relative(ROOT, file)}`);
      violations.forEach((v) => console.log(`  line ${v.line}: ${v.text}`));
    }
  }

  if (fs.existsSync(siteJsonPath)) {
    const violations = checkSiteJson(siteJsonPath);
    if (violations.length) {
      totalViolations += violations.length;
      console.log(`\n${path.relative(ROOT, siteJsonPath)}`);
      violations.forEach((v) => console.log(`  "${v.line}": ${v.text}`));
    }
  }

  if (totalViolations === 0) {
    console.log("lowercase check: all clear.");
    process.exit(0);
  }

  console.log(
    `\nlowercase check: found ${totalViolations} capital letter${totalViolations === 1 ? "" : "s"} outside code spans/fences.`
  );
  console.log(
    `if any of these are intentional, add "${ALLOW_MARKER}" to the end of that line.`
  );

  process.exit(WARN_ONLY ? 0 : 1);
})();
