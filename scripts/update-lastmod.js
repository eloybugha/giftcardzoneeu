// Auto-update <lastmod> in sitemap.xml based on each file's latest git commit time.
// Requires: fast-xml-parser, git history available (checkout fetch-depth: 0)

const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// === CONFIG ===
const SITEMAP_PATH = "sitemap.xml";
const SITE_ORIGIN = "https://giftcardzoneeu.com"; // change if your domain differs
const DEFAULT_INDEX = "index.html";               // default file for trailing-slash URLs

// --- helpers ---
function urlToLocalPath(url) {
  // strip origin
  let path = url.replace(/^https?:\/\/[^/]+/i, "");
  if (!path) path = "/";               // root
  // drop query/fragment
  path = path.split("?")[0].split("#")[0];
  // map "/" -> "index.html"
  if (path.endsWith("/")) path = path + DEFAULT_INDEX;
  // trim leading slash for fs path
  if (path.startsWith("/")) path = path.slice(1);
  return path;
}

function gitLastCommitISO(filePath) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, { encoding: "utf8" }).trim();
    if (!iso) return null;
    return iso.split("T")[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

// --- run ---
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error(`❌ ${SITEMAP_PATH} not found`);
  process.exit(0);
}

const xmlText = fs.readFileSync(SITEMAP_PATH, "utf8");
const parser = new XMLParser({ ignoreAttributes: false, ignoreDeclaratio
