// scripts/update-lastmod.js
// Auto-update <lastmod> in sitemap.xml using each file's latest git commit date.
// Requires: fast-xml-parser, and checkout with fetch-depth: 0

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// ===== CONFIG =====
const SITEMAP_PATH = "sitemap.xml";
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://giftcardzoneeu.com").replace(/\/+$/, "");
const DEFAULT_INDEX = "index.html";        // for trailing-slash URLs → .../index.html
const FORCE_TODAY = process.env.FORCE_TODAY === "1"; // one-time global bump switch
const DEBUG = process.env.DEBUG_LOG === "1";         // set to "1" to see mapping logs

// ===== helpers =====
const log = (...a) => { if (DEBUG) console.log(...a); };
const todayISO = () => new Date().toISOString().slice(0, 10);

function urlToLocalPath(url) {
  if (!/^https?:\/\//i.test(url)) return null;
  const origin = url.replace(/^(https?:\/\/[^/]+).*/, "$1");
  // accept www vs non-www, but still require same hostname ignoring www
  const norm = s => s.replace(/^https?:\/\/(www\.)?/i, "https://").toLowerCase();
  if (norm(origin) !== norm(SITE_ORIGIN)) {
    // still try to map by pathname
  }
  let p = url.slice(origin.length) || "/";
  p = p.split("#")[0].split("?")[0];
  if (p.endsWith("/")) p += DEFAULT_INDEX;
  if (p.startsWith("/")) p = p.slice(1);
  return p.replace(/\/{2,}/g, "/");
}

function fileExists(fp) {
  try { return fs.existsSync(fp) && fs.statSync(fp).isFile(); } catch { return false; }
}

function gitLastCommitISO(filePath) {
  // 1) git history
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, { encoding: "utf8" }).trim();
    if (iso) return iso.split("T")[0];
  } catch {}
  // 2) fs mtime
  try {
    const stat = fs.statSync(filePath);
    return new Date(stat.mtime).toISOString().split("T")[0];
  } catch {}
  // 3) today
  return todayISO();
}

// ===== run =====
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error(`❌ ${SITEMAP_PATH} not found`);
  process.exit(0); // don't fail the job
}

const xmlText = fs.readFileSync(SITEMAP_PATH, "utf8");
let obj;
try {
  obj = new XMLParser({ ignoreAttributes: false, preserveOrder: false }).parse(xmlText);
} catch (e) {
  console.error("❌ Failed to parse sitemap.xml:", e.message);
  process.exit(1);
}

const urlset = obj.urlset;
const items = Array.isArray(urlset?.url) ? urlset.url : (urlset?.url ? [urlset.url] : []);
if (!items.length) {
  console.log("ℹ️ No <url> entries in sitemap.xml. Nothing to update.");
  process.exit(0);
}

let updated = 0, considered = 0;

for (const entry of items) {
  const loc = String(entry.loc || "").trim();
  if (!loc) continue;

  const local = urlToLocalPath(loc);
  if (!local) { log(`• Skip (bad/foreign URL): ${loc}`); continue; }
  considered++;

  // exact file
  let target = local, tried = [target];
  let found = fileExists(target);

  // fallback: page.html → page/index.html
  if (!found && local.toLowerCase().endsWith(".html")) {
    const base = local.slice(0, -".html".length);
    const alt = path.join(base, "index.html");
    tried.push(alt);
    if (fileExists(alt)) { target = alt; found = true; }
  }

  if (!found) { log(`• No file for ${loc} → tried: ${tried.join(" , ")}`); continue; }

  const date = FORCE_TODAY ? todayISO() : gitLastCommitISO(target);
  if (entry.lastmod !== date) {
    entry.lastmod = date;
    updated++;
    log(`✔ Update: ${loc} → ${target} → ${date}`);
  } else {
    log(`= Up-to-date: ${loc} → ${target} → ${date}`);
  }
}

if (!updated) {
  console.log(`ℹ️ No changes to <lastmod>. Considered ${considered} url(s).`);
  process.exit(0);
}

const outXml = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: "  " }).build(obj);
const withDecl = outXml.startsWith("<?xml") ? outXml : `<?xml version="1.0" encoding="UTF-8"?>\n` + outXml;

fs.writeFileSync(SITEMAP_PATH, withDecl, "utf8");
console.log(`✅ Updated <lastmod> for ${updated} url(s).`);
