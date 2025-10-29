// Geo Router v3 — faster + more providers + solid fallback
(function () {
  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.get("debug") === "1";

  // 👉 Set your links here (fallback XX now goes to Monetag para auto-redirect, no click)
  const LINKS = {
    PH: "https://otieu.com/4/4203960", // Monetag PH
    NL: "https://t.avlmy.com/393289/7910?popUnder=true&aff_sub5=NL", // Adsterra NL
    US: "https://t.avlmy.com/393289/7910?popUnder=true&aff_sub5=US", // Adsterra US
    BR: "https://otieu.com/4/4203960",
    XX: "https://otieu.com/4/4203960" // ← fallback now Monetag (no-click)
    // If you still want apps page as backup, change to: "https://giftcardzoneeu.com/NeutralCPC/"
  };

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

  // 🔎 Multiple providers (any that responds first wins)
  const providers = [
    // Very permissive CORS, fast
    {
      name: "geojs",
      run: () => fetchJSON("https://get.geojs.io/v1/ip/country.json")
                   .then(j => j && j.country)
    },
    // Simple text country code
    {
      name: "ipapi-txt",
      run: () => fetchText("https://ipapi.co/country/") // returns "PH\n"
                   .then(t => (t || "").trim())
    },
    {
      name: "ipapi.co",
      run: () => fetchJSON("https://ipapi.co/json/")
                   .then(j => j && j.country)
    },
    {
      name: "ipwho.is",
      run: () => fetchJSON("https://ipwho.is/")
                   .then(j => j && j.country_code)
    }
  ];

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
              <div><b>Target URL:</b> <code style="word-break:break-all">${target}</code></div>
            </div>
            <details style="margin-top:12px"><summary>Raw</summary>
              <pre style="white-space:pre-wrap;font-size:12px">${raw ? JSON.stringify(raw,null,2) : "(none)"}</pre>
            </details>
            <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
              <a href="${target}" style="padding:10px 14px;background:#22c55e;color:#08120a;border-radius:10px;text-decoration:none">Continue to Offer →</a>
              <a href="${location.pathname}" style="padding:10px 14px;background:#1f2937;color:#e6ecff;border-radius:10px;text-decoration:none">Reload (no debug)</a>
            </div>
          </div>
        </div>`;
      return;
    }
    location.replace(target);
  };

  (async () => {
    for (const p of providers) {
      try {
        const cc = await p.run();
        if (cc && /^[A-Z]{2}$/i.test(cc)) return redirect(cc, p.name, { cc });
      } catch (_) {}
    }
    // If all fail, still auto-redirect via fallback ad (no click)
    redirect("XX", "fallback", null);
  })();
})();
