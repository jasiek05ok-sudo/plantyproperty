/* Konfiguracja strony Planty Property.
   Wszystkie ustawienia integracji z CRM IMO są w tym jednym miejscu. */
window.PP_CONFIG = {
  // --- OFERTY ---------------------------------------------------------
  // Adres pliku JSON z ofertami. Domyślnie plik demonstracyjny.
  // Po uzgodnieniu z IMO formatu eksportu ofert na stronę www (patrz README.md)
  // wskaż tu docelowy plik/endpoint, np. "/api/offers.php" lub "/data/offers.json".
  OFFERS_URL: "data/offers.json",

  // Mapowanie pól z feedu CRM na pola używane przez stronę.
  // Jeśli feed IMO ma inne nazwy pól, zmień je tylko tutaj.
  FIELD_MAP: {
    id: "id", title: "title", transaction: "transaction", type: "type",
    city: "city", district: "district", price: "price", area: "area",
    rooms: "rooms", description: "description", photos: "photos"
  },

  // --- FORMULARZ KONTAKTOWY ---------------------------------------------
  // 1) Najpierw próba wysłania do CRM IMO – o ile podasz tu publiczny adres
  //    przyjmujący zapytania (puste = pomijane; patrz README.md).
  //    UWAGA: strona jest statyczna (GitHub Pages), więc NIE wpisuj tu żadnych tajnych kluczy API.
  LEAD_IMO_URL: "",

  // 2) Gdy IMO jest niedostępne / nieskonfigurowane, zapytanie trafia e-mailem
  //    na skrzynkę biura przez usługę FormSubmit (pierwsze wysłanie wymaga
  //    jednorazowego potwierdzenia aktywacji w mailu od FormSubmit).
  LEAD_EMAIL_ENDPOINT: "https://formsubmit.co/ajax/jasiek05ok@gmail.com",

  // --- COOKIES / ANALITYKA ---------------------------------------------
  // Skrypty wczytują się wyłącznie po zgodzie użytkownika.
  // Wpisz identyfikatory, gdy zdecydujesz się na dane narzędzia (puste = wyłączone).
  GA4_ID: "",        // np. "G-XXXXXXXXXX"  (kategoria: analityczne)
  META_PIXEL_ID: "", // np. "1234567890"    (kategoria: marketingowe)

  COOKIE_VERSION: 1  // zwiększ, aby ponownie poprosić o zgodę po zmianie polityki
};
