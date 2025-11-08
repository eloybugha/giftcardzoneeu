// scripts/update-lastmod.js
// Auto-update <lastmod> in sitemap.xml using each file's latest git commit date.
// Requires: fast-xml-parser, and checkout with fetch-depth: 0

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// === CONFIG ===
const SITEMAP_PATH = "sitemap.xml";
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://giftcardzoneeu.com").replace(/\/+$/, "");
const DEFAULT_INDEX = "index.html"; // used for trailing-slash URLs

// --- helpers ---
function urlToLocalPath(url) {
  // Ensure same origin; if different, skip by returning null
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;
  const origin = url.replace(/^(https?:\/\/[^/]+).*/, "$1");
  if (origin.toLowerCase() !== SITE_ORIGIN.toLowerCase()) return null;

  // strip origin
  let p = url.slice(origin.length);
  if (!p) p = "/";

  // drop query/fragment
  p = p.split("#")[0].split("?")[0];

  // map "/" or any trailing "/" -> add index.html
  if (p.endsWith("/")) p = p + DEFAULT_INDEX;

  // trim leading slash for fs path
  if (p.startsWith("/")) p = p.slice(1);

  // normalize duplicate slashes
  p = p.replace(/\/{2,}/g, "/");

  return p;
}

function fileExists(fp) {
  try { return fs.existsSync(fp) && fs.statSync(fp).isFile(); } catch { return false; }
}

function gitLastCommitISO(filePath) {
  // Try git history
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, { encoding: "utf8" }).trim();
    if (iso) return iso.split("T")[0]; // YYYY-MM-DD
  } catch {}

  // Fallback: filesystem mtime
  try {
    const stat = fs.statSync(filePath);
    return new Date(stat.mtime).toISOString().split("T")[0];
  } catch {}

  // Last fallback: today
  return new Date().toISOString().split("T")[0];
}

// --- run ---
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error(`❌ ${SITEMAP_PATH} not found`);
  process.exit(0); // don’t fail the workflow
}

const xmlText = fs.readFileSync(SITEMAP_PATH, "utf8");

const parser = new XMLParser({
  ignoreAttributes: false,
  preserveOrder: false,
});

let obj;
try {
  obj = parser.parse(xmlText);
} catch (e) {
  console.error("❌ Failed to parse sitemap.xml:", e.message);
  process.exit(1);
}

const urlset = obj.urlset;
if (!urlset) {
  console.error("❌ No <urlset> in sitemap.xml");
  process.exit(1);
}

const items = Array.isArray(urlset.url) ? urlset.url : (urlset.url ? [urlset.url] : []);
if (!items.length) {
  console.log("ℹ️ No <url> entries in sitemap.xml. Nothing to update.");
  process.exit(0);
}

let updated = 0;

for (const entry of items) {
  const loc = String(entry.loc || "").trim();
  if (!loc) continue;

  const local = urlToLocalPath(loc);
  if (!local) {
    // different origin or invalid; skip
    continue;
  }

  // Try exact file; if not found and it ends with .html, also try directory index fallback (rare)
  let target = local;
  if (!fileExists(target)) {
    // If the URL is .../page.html but file moved to .../page/index.html
    if (local.toLowerCase().endsWith(".html")) {
      const alt = path.join(local.slice(0, -5 - 1), "index.html"); // remove "/page.html" -> "/page/index.html"
      if (fileExists(alt)) target = alt;
    }
  }

  if (!fileExists(target)) {
    // Not found; skip rather than erroring
    continue;
  }

  const date = gitLastCommitISO(target);
  if (entry.lastmod !== date) {
    entry.lastmod = date;
    updated++;
  }
}

if (!updated) {
  console.log("ℹ️ No changes to <lastmod> (already up to date).");
  process.exit(0);
}

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  indentBy: "  ",
});
const outXml = builder.build(obj);

// Ensure XML declaration
const withDecl = outXml.startsWith("<?xml") ? outXml : `<?xml version="1.0" encoding="UTF-8"?>\n` + outXml;

fs.writeFileSync(SITEMAP_PATH, withDecl, "utf8");
console.log(`✅ Updated <lastmod> for ${updated} url(s).`);
