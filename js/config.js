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
  // Formularz wysyła zapytanie do skryptu na serwerze (Hostido). Skrypt przekazuje je do
  // CRM IMO (jeśli skonfigurujesz w api/config.php) albo e-mailem na adres z api/config.php.
  LEAD_ENDPOINT: "api/lead.php",

  // Zapas: gdyby skrypt na serwerze nie odpowiadał (np. awaria PHP), zapytanie trafi
  // e-mailem przez FormSubmit. Pusty ciąg = zapas wyłączony.
  LEAD_EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a15ba6412018638763c41f5e2c4f5123",

  // --- TELEFON ----------------------------------------------------------
  // Numer używany przez wszystkie przyciski „Zadzwoń” (menu, pływający przycisk, kontakt).
  // PHONE_TEL – format międzynarodowy bez spacji, np. "+48123456789".
  // PHONE_LABEL – numer w czytelnym zapisie, np. "+48 123 456 789" (puste = zostaw tekst z index.html).
  PHONE_TEL: "+48884885936",
  PHONE_LABEL: "+48 884 885 936",

  // --- COOKIES / ANALITYKA ---------------------------------------------
  // Skrypty wczytują się wyłącznie po zgodzie użytkownika.
  // Wpisz identyfikatory, gdy zdecydujesz się na dane narzędzia (puste = wyłączone).
  GA4_ID: "",        // np. "G-XXXXXXXXXX"  (kategoria: analityczne)
  META_PIXEL_ID: "", // np. "1234567890"    (kategoria: marketingowe)

  COOKIE_VERSION: 1  // zwiększ, aby ponownie poprosić o zgodę po zmianie polityki
};
