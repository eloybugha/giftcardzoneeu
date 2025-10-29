// Geo Router v3.1 — multi-provider detect + tracking + safe fallback
(function () {
  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.get("debug") === "1";

  // 👉 LINKS (your smartlink added for NL)
  const LINKS = {
    PH: "https://otieu.com/4/4203960", // Monetag PH
    NL: "https://moundconclusive.com/b3tf3q5h?key=d30075f9a8298d2e723defde10af4e33", // Adsterra NL
    US: "https://t.avlmy.com/393289/7910?popUnder=true&aff_sub5=US",                 // (change later if you have a US smartlink alt)
    BR: "https://otieu.com/4/4203960",
    XX: "https://otieu.com/4/4203960" // fallback = Monetag (auto-redirect, no click)
  };

  // ---- helpers ----
  const fetchJSON = (url, ms = 1400) =>
    Promise.race([
      fetch(url, { cache: "no-store" }),
      new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))
    ]).then(r => (r && r.ok ? r.json() : Promise.reject("bad")));

  const fetchText = (url, ms = 1200) =>
    Promise.race([
      fetch(url, { cache: "no-store" }),
      new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))
    ]).then(r => (r && r.ok ? r.text() : Promise.reject("bad")));

  const providers = [
    { name: "geojs",    run: () => fetchJSON("https://get.geojs.io/v1/ip/country.json").then(j => j && j.country) },
    { name: "ipapi-txt",run: () => fetchText("https://ipapi.co/country/").then(t => (t || "").trim()) },
    { name: "ipapi.co", run: () => fetchJSON("https://ipapi.co/json/").then(j => j && j.country) },
    { name: "ipwho.is", run: () => fetchJSON("https://ipwho.is/").then(j => j && j.country_code) }
  ];

  // append tracking (&aff_sub2=CC&aff_sub3=SOURCE) even if URL already has query
  const withTracking = (url, cc, source) => {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}aff_sub2=${encodeURIComponent(cc)}&aff_sub3=${encodeURIComponent(source)}`;
  };

  // try navigate; if blocked/NXDOMAIN, auto-fallback after 2s
  const safeRedirect = (target, cc, source) => {
    const tracked = withTracking(target, cc, source);
    location.href = tracked;
    setTimeout(() => {
      if (!document.hidden) {
        const fb = withTracking(LINKS.XX, cc || "XX", "auto-fallback");
        location.href = fb;
      }
    }, 2000);
  };

  const redirect = (cc, source, raw) => {
    const C = (cc || "XX").toUpperCase();
    const target = LINKS[C] || LINKS.XX;

    if (DEBUG) {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:grid;place-items:center;background:#0b0f19;color:#e6ecff;font-family:system-ui">
          <div style="max-width:780px;padding:24px;border:1px solid rgba(255,255,255,.08);background:#0f1626;border-radius:16px">
            <h2 style="margin:0 0 8px">🧭 Geo Debug</h2>
            <p style="margin:0 0 16px;color:#9bb0ff">Preview only — no auto redirect.</p>
            <div style="line-height:1.8">
              <div><b>Detected Country:</b> ${C}</div>
              <div><b>Source:</b> ${source}</div>
              <div><b>Target URL:</b> <code style="word-break:break-all">${withTracking(target, C, source)}</code></div>
            </div>
            <details style="margin-top:12px"><summary>Raw</summary>
              <pre style="white-space:pre-wrap;font-size:12px">${raw ? JSON.stringify(raw,null,2) : "(none)"}</pre>
            </details>
            <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
              <a href="${withTracking(target, C, source)}" style="padding:10px 14px;background:#22c55e;color:#08120a;border-radius:10px;text-decoration:none">Continue to Offer →</a>
              <a href="${location.pathname}" style="padding:10px 14px;background:#1f2937;color:#e6ecff;border-radius:10px;text-decoration:none">Reload (no debug)</a>
            </div>
          </div>
        </div>`;
      return;
    }

    // normal mode: safe redirect with fallback
    safeRedirect(target, C, source);
  };

  (async () => {
    for (const p of providers) {
      try {
        const cc = await p.run();
        if (cc && /^[A-Z]{2}$/i.test(cc)) return redirect(cc, p.name, { cc });
      } catch (_) {}
    }
    redirect("XX", "fallback", null);
  })();
})();
