(function () {
  var cfg = window.PP_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var offers = [];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    if (n == null || n === "" || isNaN(n)) return "Cena do uzgodnienia";
    return new Intl.NumberFormat("pl-PL").format(n) + " zł";
  }
  function pick(raw, key) { return raw[cfg.FIELD_MAP[key]]; }

  // Adapter: zamienia rekord z CRM na format strony.
  function normalize(raw) {
    var t = String(pick(raw, "transaction") || "").toLowerCase();
    return {
      id: String(pick(raw, "id") || ""),
      title: pick(raw, "title") || "Nieruchomość",
      transaction: /wyn|rent/.test(t) ? "wynajem" : "sprzedaz",
      type: pick(raw, "type") || "",
      city: pick(raw, "city") || "",
      district: pick(raw, "district") || "",
      price: Number(pick(raw, "price")) || null,
      area: Number(pick(raw, "area")) || null,
      rooms: Number(pick(raw, "rooms")) || null,
      description: pick(raw, "description") || "",
      photo: (pick(raw, "photos") || [])[0] || ""
    };
  }

  function placeholder(seed) {
    var hues = [150, 28, 200, 95, 12];
    var h = hues[(seed.length + seed.charCodeAt(0 || 0)) % hues.length] || 150;
    return '<svg viewBox="0 0 400 300" role="img" aria-label="Brak zdjęcia – ilustracja"><defs><linearGradient id="g' + h + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',35%,38%)"/><stop offset="1" stop-color="hsl(' + h + ',40%,22%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g' + h + ')"/><path d="M200 90 110 170h26v70h128v-70h26z" fill="rgba(255,255,255,.88)"/><rect x="186" y="190" width="28" height="50" fill="hsl(' + h + ',40%,30%)"/></svg>';
  }

  function render(list) {
    var box = $("#offers");
    var status = $("#offers-status");
    if (!list.length) {
      box.innerHTML = '<div class="empty"><h3>Brak ofert spełniających kryteria</h3><p>Zmień filtry lub <a href="#kontakt">napisz do nas</a> – możemy mieć nieruchomość, która jeszcze nie jest opublikowana.</p></div>';
      status.textContent = "";
      return;
    }
    status.textContent = "Liczba ofert: " + list.length;
    box.innerHTML = list.map(function (o) {
      var img = o.photo
        ? '<img src="' + esc(o.photo) + '" alt="' + esc(o.title) + '" loading="lazy">'
        : placeholder(o.id || o.title);
      var meta = [];
      if (o.type) meta.push("<li>" + esc(o.type) + "</li>");
      if (o.area) meta.push("<li>" + esc(o.area) + " m²</li>");
      if (o.rooms) meta.push("<li>" + esc(o.rooms) + " pok.</li>");
      var place = [o.district, o.city].filter(Boolean).join(", ");
      return '<article class="offer">' +
        '<div class="offer-img">' + img + '<span class="badge">' + (o.transaction === "wynajem" ? "Wynajem" : "Sprzedaż") + "</span></div>" +
        '<div class="offer-body"><h3>' + esc(o.title) + "</h3>" +
        '<div class="price">' + money(o.price) + (o.transaction === "wynajem" && o.price ? " / mies." : "") + "</div>" +
        (place ? '<p class="muted" style="margin:0">' + esc(place) + "</p>" : "") +
        '<ul class="meta">' + meta.join("") + "</ul>" +
        (o.description ? '<p style="margin:0;font-size:.92rem">' + esc(o.description) + "</p>" : "") +
        '<a class="btn btn-small" href="#kontakt" data-ask="' + esc(o.id) + '" data-title="' + esc(o.title) + '">Zapytaj o ofertę</a></div></article>';
    }).join("");
    observe(box.querySelectorAll(".offer"));
  }

  function filter() {
    var f = $("#search");
    var deal = f.deal.value, kind = f.kind.value, city = f.city.value.trim().toLowerCase(), max = Number(f.max.value) || 0;
    render(offers.filter(function (o) {
      return (!deal || o.transaction === deal) &&
        (!kind || o.type === kind) &&
        (!city || (o.city + " " + o.district).toLowerCase().indexOf(city) !== -1) &&
        (!max || (o.price && o.price <= max));
    }));
  }

  function loadOffers() {
    fetch(cfg.OFFERS_URL, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var arr = Array.isArray(data) ? data : (data.offers || data.items || []);
        offers = arr.map(normalize);
        render(offers);
      })
      .catch(function () {
        $("#offers-status").textContent = "Nie udało się wczytać ofert. Skontaktuj się z nami – chętnie przedstawimy aktualną ofertę.";
        $("#offers").innerHTML = "";
      });
  }

  // wyszukiwarka
  $("#search").addEventListener("submit", function (e) {
    e.preventDefault(); filter(); $("#oferty").scrollIntoView({ behavior: "smooth" });
  });

  // "Zapytaj o ofertę" -> wypełnia formularz
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ask]");
    if (!a) return;
    $("#offer_id").value = a.getAttribute("data-ask");
    var m = $("#lead-form").message;
    if (!m.value) m.value = "Dzień dobry, interesuje mnie oferta: " + a.getAttribute("data-title") + ". Proszę o kontakt.";
  });

  // menu mobilne
  var tg = $(".nav-toggle"), nav = $("#nav");
  tg.addEventListener("click", function () {
    var o = nav.classList.toggle("open"); tg.setAttribute("aria-expanded", o);
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); tg.setAttribute("aria-expanded", false); } });

  // formularz -> CRM
  // Wysyłka zapytania: najpierw CRM IMO (jeśli skonfigurowane), a przy braku/awarii – e-mail do biura.
  function sendLead(d) {
    function viaEmail() {
      return fetch(cfg.LEAD_EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          "Imię i nazwisko": d.name, "E-mail": d.email, "Telefon": d.phone || "-",
          "Wiadomość": d.message, "Oferta (ID)": d.offer_id || "-",
          "Zgoda na przetwarzanie danych": "TAK, " + new Date().toISOString(),
          "Strona": d.source_url,
          _subject: "Zapytanie ze strony www – " + d.name, _replyto: d.email,
          _template: "table", _captcha: "false"
        })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (j) {
        if (j && (j.success === false || j.success === "false")) throw new Error("email");
      });
    }
    if (!cfg.LEAD_IMO_URL) return viaEmail();
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;
    return fetch(cfg.LEAD_IMO_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.name, email: d.email, phone: d.phone, message: d.message, offer_id: d.offer_id,
        consent: true, consent_at: new Date().toISOString(), source: location.hostname
      }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (!r.ok) throw new Error(r.status); })
      .catch(viaEmail)
      .then(function (x) { if (timer) clearTimeout(timer); return x; });
  }

  var form = $("#lead-form"), msg = $("#form-msg");
  function say(t, ok) { msg.textContent = t; msg.className = "form-msg " + (ok ? "ok" : "err"); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {
      name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
      message: form.message.value.trim(), offer_id: form.offer_id.value, website: form.website.value,
      consent: form.consent.checked
    };
    if (d.website) { form.reset(); return say("Dziękujemy! Wiadomość została wysłana – odezwiemy się wkrótce.", true); } // honeypot
    if (!d.name || !d.message) return say("Uzupełnij imię i wiadomość.", false);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return say("Podaj poprawny adres e-mail.", false);
    if (!d.consent) return say("Zaznacz zgodę na przetwarzanie danych, aby wysłać formularz.", false);
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true; say("Wysyłanie…", true);
    d.source_url = location.href;
    sendLead(d)
      .then(function () { form.reset(); say("Dziękujemy! Wiadomość została wysłana – odezwiemy się wkrótce.", true); })
      .catch(function () { say("Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub skontaktuj się z nami telefonicznie.", false); })
      .then(function () { btn.disabled = false; });
  });

  // --- animacje: pojawianie przy przewijaniu, nagłówek, podświetlanie menu ---
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = ("IntersectionObserver" in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
  function observe(els) {
    if (!io) return;
    [].forEach.call(els, function (el) {
      var i = [].indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", (i % 4) * 90 + "ms");
      el.classList.add("reveal"); io.observe(el);
    });
  }
  observe(document.querySelectorAll(".section-head, .stats div, .card, .about > *, .contact-grid > *"));

  var hdr = $(".site-header");
  var prog = $("#progress");
  function onScroll() {
    hdr.classList.toggle("scrolled", window.scrollY > 10);
    if (prog) { var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")"; }
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var links = [].slice.call(document.querySelectorAll('nav#nav a[href^="#"]:not(.btn)'));
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var t = document.querySelector(l.getAttribute("href")); if (t) spy.observe(t); });
  }

  // licznik w statystykach
  [].forEach.call(document.querySelectorAll("[data-count]"), function (el) {
    if (!io || reduce) return;
    var end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
    el.textContent = "0" + suf;
    var co = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      co.disconnect();
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    co.observe(el);
  });

  $("#year").textContent = new Date().getFullYear();
  loadOffers();
})();
