// GiftCardZoneEU — Centralized FAQ data + auto-detect by URL
(function () {
  const DATA = {
    home: [
      { q: "Is GiftCardZoneEU free to use?", a: "Yes, browsing deals is free. Clicking an offer takes you to the partner’s promo page." },
      { q: "How do you choose country-specific deals?", a: "Partners apply geo rules; we show promos that are active for your region and device." },
      { q: "Are the promos safe?", a: "We only link to vetted partners. Always review the partner’s terms and avoid sharing sensitive info." },
      { q: "Do I need an account on this site?", a: "No. You only choose offers here; any sign-up happens on the partner page." }
    ],
    ph: [
      { q: "Libre ba gamitin ang GiftCardZoneEU?", a: "Oo, libre mag-browse. Kapag nag-click ka ng offer, dadalhin ka sa partner page." },
      { q: "Paano pinipili ang deals para sa Philippines?", a: "Partners use geo-rules; ipinapakita namin ang active promos sa PH." },
      { q: "Safe ba ang mga promos?", a: "Nagli-link lang kami sa vetted partners. Basahin ang terms ng partner site." },
      { q: "Kailangan ba ng sign-up dito?", a: "Hindi. Ang anumang sign-up ay sa partner page kung kailangan." }
    ],
    nl: [
      { q: "Is GiftCardZoneEU gratis te gebruiken?", a: "Ja, browsen is gratis. Bij een klik ga je naar de partnerpagina." },
      { q: "Werken de aanbiedingen in Nederland?", a: "We tonen NL-geactiveerde deals op basis van geo-regels." },
      { q: "Zijn de acties veilig?", a: "We linken alleen naar gecontroleerde partners. Lees de voorwaarden." },
      { q: "Moet ik hier een account aanmaken?", a: "Nee, inschrijven gebeurt alleen op de partnersite indien nodig." }
    ],
    de: [
      { q: "Ist GiftCardZoneEU kostenlos?", a: "Ja, das Browsen ist kostenlos. Klicks führen zur Partnerseite." },
      { q: "Gibt es Angebote in Deutschland?", a: "Wir zeigen DE-aktive Deals gemäß Geo-Regeln." },
      { q: "Sind die Aktionen sicher?", a: "Wir verlinken nur geprüfte Partner. Bedingungen bitte prüfen." },
      { q: "Brauche ich hier ein Konto?", a: "Nein. Registrierung erfolgt nur auf der Partnerseite falls nötig." }
    ],
    us: [
      { q: "Is GiftCardZoneEU free to use?", a: "Yes, browsing is free. Clicking a deal takes you to the partner’s page." },
      { q: "Are offers available in the US?", a: "We show US-eligible deals based on partner geo-rules." },
      { q: "Are the promos safe?", a: "We only list vetted partners. Review the partner’s terms." },
      { q: "Do I need an account here?", a: "No. Any sign-up happens on the partner site if required." }
    ]
  };

  // Detect whether homepage or country page
  function detectCountryOrHome() {
    if (location.pathname === "/" || location.pathname === "/index.html") return "home";
    const m = location.pathname.match(/\/country\/([a-z]{2})\//i);
    return m ? m[1].toLowerCase() : null;
  }

  // Public data getter
  window.GZEU_FAQ_DATA = {
    getForCurrentPage: function () {
      const cc = detectCountryOrHome();
      return { cc, items: (cc && DATA[cc]) ? DATA[cc] : DATA["home"] };
    }
  };
})();
