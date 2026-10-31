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
      photo: (pick(raw, "photos") || [])[0] || "",
      floor: raw.floor || "",
      demo: !!raw.demo
    };
  }

  // Grafika zastępcza (styl rysunku architektonicznego) – do czasu dodania zdjęcia
  function placeholder(type) {
    var L = 'fill="none" stroke="#8397a5" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
    var art;
    if (type === "Dom") {
      art = '<g ' + L + '><path d="M104 120 180 66l76 54"/><path d="M116 112V196h128V112"/><rect x="168" y="152" width="24" height="44"/><rect x="130" y="134" width="24" height="22"/><rect x="206" y="134" width="24" height="22"/><path d="M222 86V64h14v38"/><path d="M296 188v8"/></g><circle cx="296" cy="160" r="28" fill="#1e7d53" opacity=".4"/><rect x="138" y="138" width="16" height="14" fill="#5cc994" opacity=".6"/>';
    } else if (type === "Lokal użytkowy") {
      var aw = "";
      for (var k = 0; k < 6; k++) aw += '<path d="M' + (72 + k * 36) + ' 92h36l-3 24h-30z" fill="' + (k % 2 ? "none" : "#1e7d53") + '" ' + (k % 2 ? "" : 'fill-opacity=".55" ') + 'stroke="#8397a5" stroke-width="1.5" stroke-linejoin="round"/>';
      art = '<g ' + L + '><rect x="80" y="64" width="200" height="132"/><rect x="96" y="132" width="108" height="64"/><rect x="220" y="132" width="44" height="64"/><path d="M250 164h6"/></g>' + aw + '<rect x="100" y="136" width="48" height="56" fill="#5cc994" opacity=".18"/>';
    } else if (type === "Działka") {
      art = '<g ' + L + '><path d="M70 172 150 92l150 12-24 80z" stroke-dasharray="6 5"/><path d="M40 208C110 178 200 200 330 166" opacity=".6"/><path d="M52 224C130 196 210 214 340 184" opacity=".4"/></g><circle cx="120" cy="140" r="14" fill="#1e7d53" opacity=".45"/><circle cx="238" cy="130" r="18" fill="#1e7d53" opacity=".45"/><circle cx="196" cy="140" r="10" fill="#5cc994" opacity=".9"/><circle cx="196" cy="140" r="20" fill="none" stroke="#5cc994" stroke-opacity=".5"/>';
    } else {
      var w = "";
      for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
        var lit = (r * 3 + c) % 5 === 1;
        w += '<rect x="' + (134 + c * 34) + '" y="' + (58 + r * 28) + '" width="22" height="18" ' + (lit ? 'fill="#5cc994" fill-opacity=".6" stroke="#5cc994"' : "") + "/>";
      }
      art = '<g ' + L + '><rect x="120" y="44" width="120" height="152"/>' + w + '<rect x="168" y="172" width="24" height="24"/><rect x="246" y="104" width="70" height="92"/><rect x="44" y="124" width="68" height="72"/><path d="M258 120h12M286 120h12M258 146h12M286 146h12M58 140h12M84 140h12M58 166h12M84 166h12"/></g>';
    }
    return '<svg viewBox="0 0 360 240" role="img" aria-label="Grafika zastępcza – zdjęcie wkrótce" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c404e"/><stop offset="1" stop-color="#16222b"/></linearGradient>' +
      '<pattern id="pgrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" stroke-opacity=".06"/></pattern></defs>' +
      '<rect width="360" height="240" fill="url(#pg)"/><rect width="360" height="240" fill="url(#pgrid)"/>' +
      '<path d="M20 196H340" stroke="#8397a5" stroke-opacity=".5" stroke-width="1.5"/>' + art +
      '<text x="20" y="226" fill="#8397a5" font-size="9" letter-spacing="2.2" font-family="Inter,system-ui,sans-serif">ZDJĘCIE WKRÓTCE</text></svg>';
  }

  var ICON = {
    area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/></svg>',
    rooms: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6zM14 12h.01"/></svg>',
    floor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>'
  };

  function render(list) {
    var box = $("#offers");
    var status = $("#offers-status");
    if (!list.length) {
      box.innerHTML = '<div class="empty"><h3>Brak ofert spełniających kryteria</h3><p>Zmień filtry lub <a href="#kontakt">napisz do nas</a> – możemy mieć nieruchomość, która jeszcze nie jest opublikowana.</p><p><button type="button" class="btn btn-ghost" data-reset-filters>Wyczyść filtry</button></p></div>';
      status.textContent = "Znaleziono: 0 z " + offers.length;
      return;
    }
    var allDemo = list.every(function (o) { return o.demo; });
    status.textContent = (list.length === offers.length ? "Liczba ofert: " + list.length : "Znaleziono: " + list.length + " z " + offers.length) + (allDemo ? " · oferty przykładowe (dane demonstracyjne)" : "");
    box.innerHTML = list.map(function (o) {
      var img = o.photo
        ? '<img src="' + esc(o.photo) + '" alt="' + esc(o.title) + '" loading="lazy" decoding="async" data-type="' + esc(o.type) + '">'
        : placeholder(o.type);
      var specs = [];
      if (o.area) specs.push("<li>" + ICON.area + esc(o.area) + " m²</li>");
      if (o.rooms) specs.push("<li>" + ICON.rooms + esc(o.rooms) + " pok.</li>");
      if (o.floor) specs.push("<li>" + ICON.floor + esc(o.floor) + "</li>");
      var place = [o.district, o.city].filter(Boolean).join(", ");
      return '<article class="offer">' +
        '<div class="offer-img">' + img +
        '<span class="chip">' + (o.transaction === "wynajem" ? "Najem" : "Sprzedaż") + "</span>" +
        (o.demo ? '<span class="chip demo">Oferta przykładowa</span>' : "") + "</div>" +
        '<div class="offer-body">' +
        (place ? '<p class="loc">' + esc(place) + "</p>" : "") +
        "<h3>" + esc(o.title) + "</h3>" +
        (o.description ? '<p class="desc">' + esc(o.description) + "</p>" : "") +
        (specs.length ? '<ul class="specs">' + specs.join("") + "</ul>" : "") +
        '<div class="offer-foot"><div class="price">' + money(o.price) + (o.transaction === "wynajem" && o.price ? " <small>/ mies.</small>" : "") + "</div>" +
        '<a class="more" href="#kontakt" data-ask="' + esc(o.id) + '" data-title="' + esc(o.title) + '">Zapytaj o ofertę →</a></div></div></article>';
    }).join("");
  }

  // jeśli zdjęcie oferty nie istnieje (jeszcze go nie dodano) – pokaż grafikę zastępczą
  $("#offers").addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.getAttribute("data-type") !== null) {
      var d = document.createElement("div");
      d.innerHTML = placeholder(t.getAttribute("data-type"));
      t.replaceWith(d.firstChild);
    }
  }, true);

  // --- wyszukiwarka ---------------------------------------------------
  function norm(s) { return String(s || "").toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function num(v) { var n = Number(String(v || "").replace(/\s/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; }
  function filters() {
    var el = $("#search").elements;
    return { deal: el.deal.value, kind: el.kind.value, city: norm(el.city.value.trim()), min: num(el.min.value), max: num(el.max.value),
      amin: num(el.amin.value), amax: num(el.amax.value), rooms: num(el.rooms.value), sort: $("#sort").value };
  }
  var lastKey = null;
  function filter() {
    var F = filters();
    // nie odświeżaj listy, gdy filtry się nie zmieniły (np. samo opuszczenie pola) – inaczej kliknięcie karty lub przycisku mogłoby zostać „zgubione”
    var key = JSON.stringify(F);
    if (key === lastKey) return;
    lastKey = key;
    var list = offers.filter(function (o) {
      return (!F.deal || o.transaction === F.deal) &&
        (!F.kind || o.type === F.kind) &&
        (!F.city || norm([o.city, o.district, o.title].join(" ")).indexOf(F.city) !== -1) &&
        (!F.min || (o.price && o.price >= F.min)) &&
        (!F.max || (o.price && o.price <= F.max)) &&
        (!F.amin || (o.area && o.area >= F.amin)) &&
        (!F.amax || (o.area && o.area <= F.amax)) &&
        (!F.rooms || (o.rooms && (F.rooms >= 5 ? o.rooms >= 5 : o.rooms === F.rooms)));
    });
    if (F.sort) {
      var key = F.sort.split("-")[0], dir = F.sort.split("-")[1] === "desc" ? -1 : 1;
      list = list.slice().sort(function (a, b) {
        if (key === "price" && a.transaction !== b.transaction) return a.transaction === "sprzedaz" ? -1 : 1; // sprzedaż przed wynajmem
        var x = a[key], y = b[key];
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x - y) * dir;
      });
    }
    var any = !!(F.deal || F.kind || F.city || F.min || F.max || F.amin || F.amax || F.rooms);
    $("#finder-reset").hidden = !any;
    var rent = F.deal === "wynajem", unit = rent ? " (zł / mies.)" : " (zł)";
    $("#lbl-max").textContent = "Cena maksymalna" + unit;
    $("#lbl-min").textContent = "Cena minimalna" + unit;
    render(list);
  }
  function resetFilters() { $("#search").reset(); $("#sort").value = ""; filter(); }

  function showOffers(data) {
    var arr = Array.isArray(data) ? data : (data.offers || data.items || []);
    offers = arr.map(normalize);
    lastKey = null;
    render(offers);
  }

  function loadOffers() {
    // podgląd lokalny (dwuklik na index.html): przeglądarka blokuje fetch, więc użyj kopii z js/offers-local.js
    var web = /^https?:$/.test(location.protocol);
    if (!web && window.PP_OFFERS_LOCAL) { showOffers(window.PP_OFFERS_LOCAL); return; }
    fetch(cfg.OFFERS_URL, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(showOffers)
      .catch(function () {
        $("#offers-status").textContent = "Nie udało się wczytać ofert. Skontaktuj się z nami – chętnie przedstawimy aktualną ofertę.";
        $("#offers").innerHTML = "";
      });
  }

  // wyszukiwarka: filtrowanie na żywo + przycisk „Szukaj” przewija do wyników
  var searchForm = $("#search"), t0;
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault(); filter(); $("#oferty").scrollIntoView({ behavior: "smooth" });
  });
  function live() { clearTimeout(t0); t0 = setTimeout(filter, 150); }
  searchForm.addEventListener("input", live);
  searchForm.addEventListener("change", filter);
  $("#sort").addEventListener("change", filter);
  $("#finder-reset").addEventListener("click", resetFilters);
  $("#more-toggle").addEventListener("click", function () {
    var box = $("#finder-more"), open = box.hidden;
    box.hidden = !open; this.setAttribute("aria-expanded", open);
    this.textContent = open ? "Mniej filtrów ▴" : "Więcej filtrów ▾";
  });
  document.addEventListener("click", function (e) { if (e.target.closest("[data-reset-filters]")) resetFilters(); });

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
      // FormData = "prosty" request (bez preflightu CORS) – działa najstabilniej
      function build() {
        var fd = new FormData();
        var f = {
          name: d.name, email: d.email, phone: d.phone || "-", message: d.message,
          offer: d.offer_id || "-", consent: "TAK, " + new Date().toISOString(), page: d.source_url,
          _subject: (d.kind === "zgloszenie" ? "Zgłoszenie nieruchomości – " : d.kind === "szukam" ? "Szukam nieruchomości – " : "Zapytanie ze strony www – ") + d.name, _template: "table", _captcha: "false"
        };
        Object.keys(f).forEach(function (k) { fd.append(k, f[k]); });
        return fd;
      }
      function fail(code, msg) { var e = new Error(msg || code); e.code = code; return e; }
      return fetch(cfg.LEAD_EMAIL_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: build() })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            var m = String((j && j.message) || "");
            if (/activat/i.test(m)) throw fail("activation", m);
            if (!r.ok || (j && (j.success === false || j.success === "false"))) throw fail("rejected", m || r.status);
          });
        }, function (err) {
          // błąd sieci / CORS (np. strona otwarta jako plik z dysku) – ostatnia próba bez odczytu odpowiedzi
          if (navigator.onLine === false) throw err;
          return fetch(cfg.LEAD_EMAIL_ENDPOINT.replace("/ajax/", "/"), { method: "POST", mode: "no-cors", body: build() });
        });
    }
    function viaServer() {
      return fetch(cfg.LEAD_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !j || !j.ok) { var e = new Error("server " + r.status); e.code = "server"; e.status = r.status; throw e; }
        });
      });
    }
    function backup(err) {
      // błędy użytkownika (422/429) nie wymagają zapasu
      if (err && (err.status === 422 || err.status === 429)) throw err;
      if (!cfg.LEAD_EMAIL_ENDPOINT) throw err;
      return viaEmail();
    }
    if (!cfg.LEAD_ENDPOINT) return viaEmail();
    return viaServer().catch(backup);
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
      .catch(function (err) {
        if (window.console) console.warn("Formularz kontaktowy:", err);
        say(err && err.code === "activation"
          ? "Formularz czeka na aktywację – właściciel strony musi kliknąć link aktywacyjny z maila od FormSubmit (sprawdź też spam), a następnie wysłać wiadomość ponownie."
          : (err && err.status === 429 ? "Zbyt wiele prób – spróbuj ponownie za kilkanaście sekund." : "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub skontaktuj się z nami telefonicznie."), false);
      })
      .then(function () { btn.disabled = false; });
  });

  // --- formularz zgłoszenia nieruchomości (rozwijany) ---------------------
  var lf = $("#listing-form"), lmsg = $("#listing-msg");
  var ltoggle = $("#listing-toggle"), lbody = $("#listing-body");
  function setL(open) {
    lbody.classList.toggle("open", open);
    ltoggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  ltoggle.addEventListener("click", function () { setL(ltoggle.getAttribute("aria-expanded") !== "true"); });
  [].forEach.call(document.querySelectorAll('a[href="#zglos"]'), function (a) {
    a.addEventListener("click", function () { setL(true); });
  });
  window.addEventListener("hashchange", function () { if (location.hash === "#zglos") setL(true); });
  if (location.hash === "#zglos") setL(true);
  function sayL(t, ok) { lmsg.textContent = t; lmsg.className = "form-msg " + (ok ? "ok" : "err"); }
  var L_OK = "Dziękujemy! Zgłoszenie zostało wysłane – odezwiemy się w ciągu 24 godzin.";
  lf.addEventListener("submit", function (e) {
    e.preventDefault();
    var el = lf.elements, g = function (n) { return el[n].value.trim(); };
    if (el.website.value) { lf.reset(); return sayL(L_OK, true); } // honeypot
    if (!g("city") || !g("area")) return sayL("Podaj lokalizację i powierzchnię nieruchomości.", false);
    if (!g("name")) return sayL("Podaj imię i nazwisko.", false);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g("email"))) return sayL("Podaj poprawny adres e-mail.", false);
    if (!el.consent.checked) return sayL("Zaznacz zgodę na przetwarzanie danych, aby wysłać formularz.", false);
    var lines = ["ZGŁOSZENIE NIERUCHOMOŚCI",
      "Rodzaj: " + g("type"), "Cel: " + g("goal"), "Lokalizacja: " + g("city"), "Powierzchnia: " + g("area") + " m²"];
    if (g("rooms")) lines.push("Pokoje: " + g("rooms"));
    if (g("state")) lines.push("Stan: " + g("state"));
    if (g("year")) lines.push("Rok budowy: " + g("year"));
    if (g("notes")) lines.push("", "Uwagi: " + g("notes"));
    var d = { name: g("name"), email: g("email"), phone: g("phone"), message: lines.join("\n"), offer_id: "ZGLOSZENIE", kind: "zgloszenie",
      website: "", consent: true, source_url: location.href };
    var btn = lf.querySelector("button[type=submit]"); btn.disabled = true; sayL("Wysyłanie…", true);
    sendLead(d)
      .then(function () { lf.reset(); sayL(L_OK, true); })
      .catch(function (err) {
        if (window.console) console.warn("Formularz zgłoszenia:", err);
        sayL(err && err.status === 429 ? "Zbyt wiele prób – spróbuj ponownie za kilkanaście sekund."
          : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę lub zadzwoń do nas.", false);
      })
      .then(function () { btn.disabled = false; });
  });

  // --- formularz „Szukam nieruchomości” (rozwijany, dla kupujących i najemców) ---
  (function () {
    var sf = $("#search-form"); if (!sf) return;
    var smsg = $("#search-msg"), stoggle = $("#search-toggle"), sbody = $("#search-body");
    function setS(open) {
      sbody.classList.toggle("open", open);
      stoggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    stoggle.addEventListener("click", function () { setS(stoggle.getAttribute("aria-expanded") !== "true"); });
    [].forEach.call(document.querySelectorAll('a[href="#szukam"]'), function (x) {
      x.addEventListener("click", function () { setS(true); });
    });
    window.addEventListener("hashchange", function () { if (location.hash === "#szukam") setS(true); });
    if (location.hash === "#szukam") setS(true);
    function sayS(t, ok) { smsg.textContent = t; smsg.className = "form-msg " + (ok ? "ok" : "err"); }
    var S_OK = "Dziękujemy! Zgłoszenie zostało wysłane – odezwiemy się w ciągu 24 godzin.";
    sf.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = sf.elements, g = function (n) { return el[n].value.trim(); };
      if (el.website.value) { sf.reset(); return sayS(S_OK, true); } // honeypot
      if (!g("city")) return sayS("Podaj preferowaną lokalizację.", false);
      if (!g("name")) return sayS("Podaj imię i nazwisko.", false);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g("email"))) return sayS("Podaj poprawny adres e-mail.", false);
      if (!el.consent.checked) return sayS("Zaznacz zgodę na przetwarzanie danych, aby wysłać formularz.", false);
      var lines = ["POSZUKIWANA NIERUCHOMOŚĆ",
        "Cel: " + g("goal"), "Rodzaj: " + g("type"), "Lokalizacja: " + g("city")];
      if (g("budget")) lines.push("Budżet maks.: " + g("budget") + " zł");
      if (g("area")) lines.push("Powierzchnia od: " + g("area") + " m²");
      if (g("rooms")) lines.push("Pokoje od: " + g("rooms"));
      if (g("financing")) lines.push("Finansowanie: " + g("financing"));
      if (g("when")) lines.push("Termin: " + g("when"));
      if (g("notes")) lines.push("", "Wymagania i uwagi: " + g("notes"));
      var d = { name: g("name"), email: g("email"), phone: g("phone"), message: lines.join("\n"), offer_id: "SZUKAM", kind: "szukam",
        website: "", consent: true, source_url: location.href };
      var btn = sf.querySelector("button[type=submit]"); btn.disabled = true; sayS("Wysyłanie…", true);
      sendLead(d)
        .then(function () { sf.reset(); sayS(S_OK, true); })
        .catch(function (err) {
          if (window.console) console.warn("Formularz poszukiwania:", err);
          sayS(err && err.code === "activation"
            ? "Formularz czeka na aktywację – właściciel strony musi kliknąć link aktywacyjny z maila od FormSubmit (sprawdź też spam), a następnie wysłać zgłoszenie ponownie."
            : (err && err.status === 429 ? "Zbyt wiele prób – spróbuj ponownie za kilkanaście sekund."
              : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę lub zadzwoń do nas."), false);
        })
        .then(function () { btn.disabled = false; });
    });
  })();

  // --- telefon: jeden numer z js/config.js dla wszystkich przycisków „Zadzwoń” ---
  [].forEach.call(document.querySelectorAll("a[data-tel]"), function (a) {
    if (cfg.PHONE_TEL) a.setAttribute("href", "tel:" + cfg.PHONE_TEL);
  });
  if (cfg.PHONE_LABEL) [].forEach.call(document.querySelectorAll("[data-tel-text]"), function (n) { n.textContent = cfg.PHONE_LABEL; });

  // --- mobilny przycisk „Zadzwoń”: można go ukryć (na czas wizyty na stronie) ---
  (function () {
    var dock = document.getElementById("call-dock"), x = document.getElementById("call-close");
    if (!dock || !x) return;
    try { if (sessionStorage.getItem("pp_call_hidden") === "1") dock.hidden = true; } catch (e) {}
    x.addEventListener("click", function () {
      dock.hidden = true;
      try { sessionStorage.setItem("pp_call_hidden", "1"); } catch (e) {}
    });
  })();

  // --- animacje: pojawianie przy przewijaniu, nagłówek, podświetlanie menu ---
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ioWorked = false;
  var io = ("IntersectionObserver" in window && !reduce) ? new IntersectionObserver(function (es) {
    ioWorked = true;
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
  observe(document.querySelectorAll(".section-head, .trust > div, .svc, .step, .faq details, .split-head, .about > *, .contact-grid > *"));
  // zabezpieczenie: jeśli przeglądarka/podgląd nie uruchomi obserwatora, nie zostawiaj ukrytych sekcji
  setTimeout(function () {
    if (ioWorked) return;
    [].forEach.call(document.querySelectorAll(".reveal:not(.in)"), function (el) { el.classList.add("in"); });
  }, 1500);

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
