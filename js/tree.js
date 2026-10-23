/* Interaktywne drzewo: klik / Enter / Spacja strząsa liście, po chwili odrastają.
   Lekkie (≈40 elementów SVG), dostępne z klawiatury, wyłącza ruch przy prefers-reduced-motion. */
(function () {
  var btn = document.getElementById("tree");
  if (!btn) return;
  var g = document.getElementById("leaves");
  var hint = document.getElementById("tree-hint");
  var crown = btn.querySelector(".crown");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var GROUND = 316, COUNT = 40;
  var circles = [[160, 125, 60], [112, 150, 44], [212, 148, 46], [150, 78, 40], [200, 92, 36], [104, 104, 32]];
  var greens = ["#3f7a56", "#4f8a62", "#5f9c70", "#7bb487", "#2f6a49", "#8cc096"];
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var leaves = [];
  for (var i = 0; i < COUNT; i++) {
    var c = circles[Math.floor(rnd() * circles.length)];
    var a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * c[2] * 0.9;
    var L = {
      x: c[0] + Math.cos(a) * r, y: c[1] + Math.sin(a) * r * 0.9,
      rot: Math.floor(rnd() * 360), sc: 0.85 + rnd() * 0.8,
      color: greens[Math.floor(rnd() * greens.length)]
    };
    L.base = "translate(" + L.x + "px," + L.y + "px) rotate(" + L.rot + "deg) scale(" + L.sc + ")";
    var el = document.createElementNS(NS, "use");
    el.setAttribute("href", "#leaf");
    el.setAttribute("fill", L.color);
    el.style.transform = L.base;
    g.appendChild(el);
    L.el = el; leaves.push(L);
  }

  function T(L, px, py, r, s) {
    return "translate(" + (L.x + px) + "px," + (L.y + py) + "px) rotate(" + (L.rot + r) + "deg) scale(" + (s == null ? L.sc : s) + ")";
  }
  function setHint(fallen) {
    hint.innerHTML = "<span>" + (fallen
      ? 'Liście wrócą za chwilę. Tymczasem – <a href="#kontakt">napisz do nas</a>.'
      : HINT) + "</span>";
  }

  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var HINT = canHover ? "Najedź kursorem na drzewo i zobacz, co się stanie." : "Dotknij drzewa i strząśnij liście.";
  var busy = false;
  function shake() {
    if (busy) return;
    busy = true;
    crown.classList.add("thin");
    setHint(true);
    var end = 0;
    leaves.forEach(function (L) {
      var delay = reduce ? 0 : Math.random() * 1000;
      var dur = reduce ? 500 : 3400 + Math.random() * 2600;
      var dx = (Math.random() - 0.5) * 170, sway = 16 + Math.random() * 22;
      var dir = Math.random() < 0.5 ? -1 : 1;
      var gy = GROUND - L.y + Math.random() * 8;
      var kf = reduce
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { transform: T(L, 0, 0, 0), fill: L.color, opacity: 1, offset: 0 },
            { transform: T(L, dx * 0.25 + dir * sway, gy * 0.25, dir * 110), fill: L.color, offset: 0.18 },
            { transform: T(L, dx * 0.55 - dir * sway, gy * 0.55, -dir * 190), fill: "#d9a441", offset: 0.4 },
            { transform: T(L, dx, gy, dir * 330 + Math.random() * 40), fill: "#c8793a", opacity: 1, offset: 0.62 },
            { transform: T(L, dx, gy, dir * 330 + Math.random() * 40), fill: "#b4642b", opacity: 1, offset: 0.86 },
            { transform: T(L, dx, gy, dir * 330, L.sc), fill: "#b4642b", opacity: 0, offset: 1 }
          ];
      L.anim = L.el.animate(kf, { duration: dur, delay: delay, easing: "cubic-bezier(.35,.1,.6,1)", fill: "forwards" });
      end = Math.max(end, delay + dur);
    });
    setTimeout(regrow, end + 400);
  }

  function regrow() {
    crown.classList.remove("thin");
    var last = 0;
    leaves.forEach(function (L) {
      if (L.anim) L.anim.cancel();
      var delay = 200 + Math.random() * 1400, dur = 800;
      L.el.animate(
        [{ transform: T(L, 0, 0, 0, 0), opacity: 0 }, { transform: L.base, opacity: 1 }],
        { duration: dur, delay: delay, easing: "cubic-bezier(.2,.8,.3,1.2)", fill: "backwards" }
      );
      last = Math.max(last, delay + dur);
    });
    setTimeout(function () { busy = false; setHint(false); }, last + 100);
  }

  btn.setAttribute("aria-label", "Drzewo – " + (canHover ? "najedź kursorem lub naciśnij" : "dotknij") + ", aby strząsnąć liście");
  setHint(false);
  if (canHover) btn.addEventListener("mouseenter", shake);
  btn.addEventListener("click", shake); // dotyk i klawiatura (Enter / Spacja)
})();
