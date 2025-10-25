// GiftCardZoneEU — Universal FAQ Renderer + JSON-LD Schema
(function () {

  // Inject JSON-LD FAQ schema into <head>
  function injectJsonLd(items) {
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items.map(q => ({
        "@type": "Question",
        "name": q.q,
        "acceptedAnswer": { "@type": "Answer", "text": q.a }
      }))
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
  }

  // Create HTML element helper
  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (html) e.innerHTML = html;
    return e;
  }

  // Render FAQ on page
  function renderFAQ(targetId, items, opts) {
    if (!Array.isArray(items) || !items.length) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const sec = el("section", {
      class: "card",
      "aria-label": "FAQ",
      style: (opts && opts.style) || "margin-top:20px;"
    });
    sec.appendChild(el("h2", null, (opts && opts.title) || "❓ FAQ"));

    items.forEach(q => {
      const details = el("details");
      const summary = el("summary", null, q.q);
      const p = el("p", { class: "mini" }, q.a);
      details.appendChild(summary);
      details.appendChild(p);
      sec.appendChild(details);
    });

    target.replaceWith(sec);
    injectJsonLd(items);
  }

  // Expose globally
  window.GZEU_FAQ = { renderFAQ };

})();
