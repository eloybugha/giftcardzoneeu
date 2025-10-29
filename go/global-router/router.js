// Geo Router v2 — fast providers + timeout + debug
(function () {
  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.get("debug") === "1";

  const LINKS = {
    PH: "https://otieu.com/4/4203960",
    NL: "https://t.avlmy.com/393289/7910?popUnder=true&aff_sub5=NL",
    US: "https://t.avlmy.com/393289/7910?popUnder=true&aff_sub5=US",
    BR: "https://otieu.com/4/4203960",
    XX: "https://giftcardzoneeu.com/NeutralCPC/"
  };

  const fetchWithTimeout = (url, ms=1500) =>
    Promise.race([
      fetch(url, { cache: "no-store" }),
      new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))
    ]);

  const providers = [
    { name: "country.is", url: "https://api.country.is", pick: j => j && j.country },
    { name: "ipapi.co",   url: "https://ipapi.co/json/", pick: j => j && j.country },
    { name: "ipwho.is",   url: "https://ipwho.is/",      pick: j => j && j.country_code }
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
        const r = await fetchWithTimeout(p.url, 1600);
        if (!r || !r.ok) continue;
        const j = await r.json();
        const cc = p.pick(j);
        if (cc) return redirect(cc, p.name, j);
      } catch (_) {}
    }
    redirect("XX", "fallback", null);
  })();
})();
