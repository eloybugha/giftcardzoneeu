(() => {
  "use strict";

  /*
   * DITO LANG MAG-EDIT KAPAG MAY BAGONG PROMO.
   *
   * enabled: false = itago sa lahat ng connected pages.
   * expiresAt: automatic expiry.
   * +09:00 = Japan time.
   *
   * Ang kasalukuyang expiry ay nakatakda sa simula
   * ng January 1, 2027, Japan time.
   */
  const PROMO = {
    enabled: true,
    code: "12GOJP",
    headline: "New to 12Go? Check This Japan Offer",
    description: "Check 10% off, up to US$4, for new users on eligible Japan routes.",
    terms: "Announced terms: new users only; Japan routes only; 10% off capped at US$4; valid until 31 December 2026; 500-code redemption quota. Remaining availability and ticket eligibility must be confirmed at checkout.",
    expiresAt: "2027-01-01T00:00:00+09:00",
    bookingUrl: "https://www.dpbolvw.net/click-101586981-17115158",
    detailsUrl: "/partners/12go-japan-promo/"
  };

  const EXPIRY = Date.parse(PROMO.expiresAt);

  function isActive() {
    return (
      PROMO.enabled === true &&
      Number.isFinite(EXPIRY) &&
      Date.now() < EXPIRY
    );
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function installStyles() {
    if (document.getElementById("japan-shared-promo-style")) return;

    const style = document.createElement("style");
    style.id = "japan-shared-promo-style";

    style.textContent = `
      .jp-shared-promo {
        margin:18px 0;
        padding:24px;
        border:2px solid #ff8a24;
        border-radius:18px;
        background:#fff7ed;
        color:#213248;
        font-family:Arial,Helvetica,sans-serif;
        line-height:1.7;
      }

      .jp-shared-promo h2 {
        margin:0 0 12px;
        color:#071d38;
        font-size:25px;
        line-height:1.3;
      }

      .jp-shared-promo p {
        margin:0 0 14px;
      }

      .jp-shared-promo .jp-eyebrow {
        margin-bottom:8px;
        color:#934100;
        font-size:12px;
        font-weight:800;
        letter-spacing:1px;
        text-transform:uppercase;
      }

      .jp-shared-promo .jp-actions {
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        gap:12px;
        margin:16px 0;
      }

      .jp-shared-promo .jp-code {
        padding:8px 16px;
        border:2px dashed #934100;
        border-radius:10px;
        background:#fff;
        color:#071d38;
        font-family:monospace;
        font-size:26px;
        font-weight:800;
        user-select:all;
      }

      .jp-shared-promo .jp-copy {
        min-height:48px;
        padding:10px 17px;
        border:1px solid #071d38;
        border-radius:10px;
        background:#fff;
        color:#071d38;
        font:700 14px Arial,Helvetica,sans-serif;
        cursor:pointer;
      }

      .jp-shared-promo .jp-book {
        display:inline-flex;
        justify-content:center;
        align-items:center;
        min-height:50px;
        padding:12px 22px;
        border-radius:10px;
        background:#ff8a24;
        color:#071d38;
        font-size:16px;
        font-weight:800;
        text-align:center;
        text-decoration:none;
      }

      .jp-shared-promo .jp-book:hover {
        background:#ffab61;
      }

      .jp-shared-promo .jp-copy:focus-visible,
      .jp-shared-promo a:focus-visible {
        outline:3px solid #1269c7;
        outline-offset:4px;
      }

      .jp-shared-promo .jp-status {
        color:#071d38;
        font-size:13px;
      }

      .jp-shared-promo .jp-terms {
        margin-top:16px;
        padding-top:14px;
        border-top:1px solid #ebd2b7;
        color:#5c4937;
        font-size:13px;
      }

      .jp-shared-promo .jp-details {
        color:#1269c7;
        text-decoration:underline;
      }

      @media(max-width:600px) {
        .jp-shared-promo {
          padding:20px 18px;
        }

        .jp-shared-promo h2 {
          font-size:23px;
        }

        .jp-shared-promo .jp-book {
          width:100%;
          box-sizing:border-box;
        }
      }
    `;

    document.head.append(style);
  }

  function renderPromo(slot) {
    slot.replaceChildren();

    // Hide the whole offer when disabled or expired.
    slot.hidden = !isActive();
    if (slot.hidden) return;

    const box = element("section", "", "jp-shared-promo");
    box.setAttribute("aria-label", "Japan booking promotion");

    const eyebrow = element(
      "p",
      "Japan Promo · Check Eligibility",
      "jp-eyebrow"
    );

    const heading = element("h2", PROMO.headline);
    const description = element("p", PROMO.description);
    const actions = element("div", "", "jp-actions");
    const code = element("code", PROMO.code, "jp-code");

    const status = element("p", "", "jp-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    actions.append(code);

    if (navigator.clipboard && window.isSecureContext) {
      const copy = element("button", "Copy Code", "jp-copy");
      copy.type = "button";

      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(PROMO.code);
          status.textContent =
            "Code copied. Enter it at checkout and confirm the discount.";
        } catch {
          status.textContent =
            "Please select and copy the code manually: " + PROMO.code;
        }
      });

      actions.append(copy);
    }

    const booking = element(
      "a",
      "Check Japan Tickets on 12Go →",
      "jp-book"
    );

    booking.href = PROMO.bookingUrl;
    booking.target = "_blank";
    booking.rel = "nofollow sponsored noopener noreferrer";

    const terms = element("div", "", "jp-terms");
    const termsText = element("p", PROMO.terms);

    const reminder = element(
      "p",
      "Enter the code where a promo field is provided. Confirm the discount before paying. Opening the booking link does not apply the code automatically."
    );

    const details = element(
      "a",
      "Read the full promo guide →",
      "jp-details"
    );

    details.href = PROMO.detailsUrl;

    terms.append(termsText, reminder, details);
    box.append(
      eyebrow,
      heading,
      description,
      actions,
      status,
      booking,
      terms
    );

    slot.append(box);
  }

  function init() {
    const slots = document.querySelectorAll(
      "[data-12go-japan-promo]"
    );

    if (!slots.length) return;

    installStyles();
    slots.forEach(renderPromo);

    // Also remove an expired offer if the page stays open.
    const checkExpiry = () => {
      if (isActive()) return;

      slots.forEach(slot => {
        slot.replaceChildren();
        slot.hidden = true;
      });
    };

    window.setInterval(checkExpiry, 60000);
    window.addEventListener("pageshow", checkExpiry);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkExpiry();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once:true });
  } else {
    init();
  }
})();
