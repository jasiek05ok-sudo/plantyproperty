/* Zarządzanie zgodami na cookies (RODO / Prawo komunikacji elektronicznej).
   - Cookies niezbędne: zawsze aktywne.
   - Analityczne i marketingowe: domyślnie wyłączone, ładują się dopiero po zgodzie.
   - "Odrzuć" ma taką samą wagę wizualną jak "Akceptuj".
   - Zgodę można zmienić w dowolnym momencie (link "Ustawienia cookies" w stopce). */
(function () {
  var cfg = window.PP_CONFIG || {};
  var KEY = "pp_consent";
  var loaded = { analytics: false, marketing: false };

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.v === cfg.COOKIE_VERSION) return c;
    } catch (e) {}
    return null;
  }
  function save(analytics, marketing) {
    var c = { v: cfg.COOKIE_VERSION, necessary: true, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    document.cookie = "pp_consent=" + (analytics ? "a" : "") + (marketing ? "m" : "") + "x; max-age=15552000; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    apply(c);
    return c;
  }
  function addScript(src, cb) {
    var s = document.createElement("script"); s.async = true; s.src = src; if (cb) s.onload = cb; document.head.appendChild(s);
  }
  function apply(c) {
    if (c.analytics && cfg.GA4_ID && !loaded.analytics) {
      loaded.analytics = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.GA4_ID, { anonymize_ip: true });
      addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID));
    }
    if (c.marketing && cfg.META_PIXEL_ID && !loaded.marketing) {
      loaded.marketing = true;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", cfg.META_PIXEL_ID); window.fbq("track", "PageView");
    }
  }

  var banner;
  function close() { if (banner) { banner.remove(); banner = null; } }

  function open(showPrefs) {
    close();
    var cur = read() || { analytics: false, marketing: false };
    banner = document.createElement("div");
    banner.className = "ck-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "ck-title");
    banner.innerHTML =
      '<h2 id="ck-title">Szanujemy Twoją prywatność</h2>' +
      '<p>Używamy plików cookies niezbędnych do działania strony. Za Twoją zgodą stosujemy też cookies analityczne i marketingowe. ' +
      'Możesz zaakceptować wszystkie, odrzucić opcjonalne lub wybrać ustawienia. Szczegóły: <a href="polityka-cookies.html">Polityka cookies</a> i <a href="polityka-prywatnosci.html">Polityka prywatności</a>.</p>' +
      '<div class="ck-prefs" id="ck-prefs"' + (showPrefs ? "" : " hidden") + '>' +
        '<label class="ck-row"><span><b>Niezbędne</b><small>Zapamiętanie Twojego wyboru zgód, bezpieczeństwo formularza. Zawsze aktywne.</small></span><input type="checkbox" checked disabled></label>' +
        '<label class="ck-row"><span><b>Analityczne</b><small>Statystyki odwiedzin pomagające ulepszać stronę.</small></span><input type="checkbox" id="ck-an"' + (cur.analytics ? " checked" : "") + '></label>' +
        '<label class="ck-row"><span><b>Marketingowe</b><small>Mierzenie skuteczności reklam i dopasowanie treści.</small></span><input type="checkbox" id="ck-mk"' + (cur.marketing ? " checked" : "") + '></label>' +
      '</div>' +
      '<div class="ck-actions">' +
        '<button type="button" class="btn" id="ck-accept">Akceptuj wszystkie</button>' +
        '<button type="button" class="btn" id="ck-reject">Odrzuć opcjonalne</button>' +
        '<button type="button" class="btn btn-ghost" id="ck-custom">' + (showPrefs ? "Zapisz wybór" : "Dostosuj") + '</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector("#ck-accept").onclick = function () { save(true, true); close(); };
    banner.querySelector("#ck-reject").onclick = function () { save(false, false); close(); };
    banner.querySelector("#ck-custom").onclick = function () {
      var prefs = banner.querySelector("#ck-prefs");
      if (prefs.hidden) { prefs.hidden = false; this.textContent = "Zapisz wybór"; return; }
      save(banner.querySelector("#ck-an").checked, banner.querySelector("#ck-mk").checked); close();
    };
    banner.querySelector("#ck-accept").focus();
  }

  window.PPCookies = { open: open, get: read };

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open-cookies]");
    if (t) { e.preventDefault(); open(true); }
  });

  var c = read();
  if (c) apply(c);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { open(false); });
  else open(false);
})();
