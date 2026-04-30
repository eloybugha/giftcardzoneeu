(function () {
  const box = document.createElement("section");
  box.className = "gz-internal-links";
  box.innerHTML = `
    <style>
      .gz-internal-links{
        max-width:1100px;
        margin:40px auto;
        padding:24px;
        border-radius:22px;
        background:#f8fafc;
        font-family:Arial,sans-serif;
      }
      .gz-internal-links h2{
        margin:0 0 14px;
        font-size:24px;
        color:#111827;
      }
      .gz-link-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
        gap:12px;
      }
      .gz-link-grid a{
        display:block;
        padding:14px 16px;
        border-radius:14px;
        background:#ffffff;
        color:#111827;
        text-decoration:none;
        font-weight:700;
        box-shadow:0 8px 20px rgba(0,0,0,.08);
      }
      .gz-link-grid a:hover{
        transform:translateY(-2px);
      }
    </style>

    <h2>Explore More Travel Guides</h2>
    <div class="gz-link-grid">
      <a href="/travel/">Travel Hub</a>
      <a href="/travel/germany/">Germany Travel Guide</a>
      <a href="/travel/germany/berlin/">Berlin Hotels</a>
      <a href="/travel/germany/dresden/">Dresden Hotels</a>
      <a href="/travel/germany/leipzig/">Leipzig Hotels</a>
      <a href="/travel/germany/hamburg/">Hamburg Hotels</a>
      <a href="/travel/germany/cologne/">Cologne Hotels</a>
      <a href="/travel/germany/dusseldorf/">Düsseldorf Hotels</a>
      <a href="/travel/germany/stuttgart/">Stuttgart Hotels</a>
      <a href="/travel/germany/nuremberg/">Nuremberg Hotels</a>
    </div>
  `;

  const footer = document.querySelector("footer");
  if (footer) {
    footer.before(box);
  } else {
    document.body.appendChild(box);
  }
})();
