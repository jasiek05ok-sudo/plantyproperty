# Planty Property – plantypropertykraków.pl (wersja pod Hostido)

Strona w HTML/CSS/JS + jeden skrypt PHP dla formularza. Bez frameworków i zewnętrznych czcionek.
W DNS domena z „ó” zapisuje się jako **`xn--plantypropertykrakw-i5b.pl`** (punycode).

## Struktura
- `index.html`, `polityka-prywatnosci.html`, `polityka-cookies.html`, `404.html`
- `fonts/` – czcionki lokalne, `img/` – zdjęcia (patrz `ZDJECIA.md`)
- `css/style.css` – motyw „stal + zieleń” (kolory w zmiennych `:root` na początku pliku)
- `js/config.js` – konfiguracja (oferty, adres formularza, analityka)
- `js/cookies.js` – baner zgód; `js/app.js` – oferty, formularz, animacje; `js/tree.js` – drzewo
- `api/lead.php` + `api/config.php` – odbiór formularza (e-mail i opcjonalnie CRM IMO)
- `data/offers.json` – **dane demonstracyjne** ofert
- `.htaccess`, `robots.txt`, `sitemap.xml`

Pliki `README.md` i `ZDJECIA.md` nie są potrzebne na serwerze (są zablokowane w `.htaccess`).

## Wdrożenie na Hostido
1. W panelu hostingu dodaj domenę (dla domeny z „ó” użyj zapisu `xn--plantypropertykrakw-i5b.pl`). **Sprawdź u Hostido, czy obsługują domeny IDN** – to ważne, zanim kupisz domenę.
2. Wgraj całą zawartość folderu (bez plików `.md`) do katalogu domeny, zwykle `public_html` – przez menedżer plików lub FTP. `index.html` ma leżeć w katalogu głównym domeny.
3. Włącz darmowy certyfikat SSL (Let's Encrypt) w panelu. Gdy HTTPS działa, **odkomentuj blok przekierowania na HTTPS w `.htaccess`**.
4. Wymagany jest PHP (7.4 lub nowszy) z funkcją `mail()` – to standard na Hostido.
5. **Ustaw `api/config.php`:**
   - `mail_to` – adres, na który mają przychodzić zapytania (jest już wpisany ten, który podałeś; odwiedzający go nie widzą),
   - `mail_from` – najlepiej skrzynka w Twojej domenie (utwórz ją w panelu, np. `formularz@…`). Poprawia to dostarczalność i ogranicza trafianie do spamu.
6. Wyślij testowe zapytanie ze strony. Sprawdź też folder Spam.

## Formularz – jak działa
1. Strona wysyła zapytanie do `api/lead.php` na Twoim serwerze (bez ciasteczek i sesji).
2. Skrypt: jeśli w `api/config.php` podasz `imo_url` (i ewentualnie `imo_key`), najpierw przekazuje zapytanie do CRM IMO. Gdy IMO nie jest skonfigurowane lub nie odpowiada – wysyła e-mail na `mail_to`.
3. **Zapas:** gdyby skrypt na serwerze w ogóle nie odpowiadał, strona wyśle zapytanie przez FormSubmit (adres w `js/config.js`, ustawiony wcześniej). Jeśli nie chcesz zapasu, ustaw `LEAD_EMAIL_ENDPOINT: ""`.

Zabezpieczenia: ukryte pole pułapka na boty, limit 1 zapytania / 20 s z jednego IP, kontrola domeny źródłowej, czyszczenie danych, zapis zgody RODO z datą w treści maila.

## Integracja z CRM IMO
- **Zapytania → IMO:** zapytaj wsparcie IMO o adres/e-mail przyjmowania zapytań ze stron www i wpisz go w `api/config.php` (klucz API trzymaj tylko tam, nigdy w plikach `js/`).
- **Oferty z IMO → strona:** zapytaj IMO o format eksportu ofert na stronę www (JSON/XML/API). JSON wskaż w `OFFERS_URL` w `js/config.js` i dopasuj `FIELD_MAP`. XML można zamienić na JSON skryptem PHP po stronie serwera (zadanie cron na Hostido) – mogę to dla Ciebie przygotować, gdy poznasz format.
- Na Hostido nie jesteś już ograniczony do statycznej strony, więc obie integracje można zrobić bezpiecznie po stronie serwera.

## Do uzupełnienia (szukaj `[UZUPEŁNIĆ`)
Dane firmy (nazwa, adres, NIP/REGON, licencja/OC), telefon, e-mail kontaktowy, daty polityk, zdjęcia i teksty. Polityki to szablony – przejrzyj je z prawnikiem/IOD.

## Cookies
Baner ma równorzędne „Akceptuj wszystkie” i „Odrzuć opcjonalne”. Analityka (GA4) i piksel Meta ładują się dopiero po zgodzie, jeśli wpiszesz ich ID w `js/config.js` (wtedy zaktualizuj też tabelę w polityce cookies).

## Zdjęcia i placeholdery (wersja premium)
- Strona ma miejsca na zdjęcia w folderze `img/` (nazwy i proporcje w `ZDJECIA.md`). Do czasu ich dodania widać grafiki zastępcze w stylu rysunku architektonicznego.
- **Oferty w `data/offers.json` to dane przykładowe** (`"demo": true`) z widoczną etykietą „Oferta przykładowa”. Przed publikacją zastąp je prawdziwymi (eksport z IMO) albo usuń.
- **FAQ – wynagrodzenie** i **stopka** mają pola `[UZUPEŁNIĆ…]`.
- Wskaźniki w pasku zalet („0 zł za pierwszą konsultację”, „24 h na odpowiedź”, „100% jasne zasady”) to **przykładowe deklaracje** – potwierdź je lub zmień w `index.html`, zanim opublikujesz stronę.

## Czcionki
Strona używa czcionki Inter hostowanej lokalnie w `fonts/` (licencja SIL OFL 1.1, tekst w `fonts/LICENSE-Inter.txt`). Nie wysyła zapytań do Google Fonts ani innych zewnętrznych serwisów, więc nie wymaga zgody w banerze cookies.

## Podgląd lokalny
Otwarcie `index.html` dwuklikiem (adres `file://`) działa dzięki kopii ofert w `js/offers-local.js` – po zmianie `data/offers.json` zaktualizuj też ten plik. Formularz (PHP) działa dopiero na serwerze. Na serwerze `offers-local.js` jest ignorowany.

## Telefon i wyszukiwarka
- **Formularz „Zgłoś swoją nieruchomość”** (sekcja `#zglos`, domyślnie zwinięty) wysyła zgłoszenie tą samą drogą co kontakt (`api/lead.php`, zapas FormSubmit). W mailu temat zaczyna się od „Zgłoszenie nieruchomości”, a treść zawiera rodzaj, cel, lokalizację, metraż, pokoje, stan i rok budowy. Do CRM IMO idzie pole `kind: "zgloszenie"`.
- **Przycisk „Zadzwoń”** (menu, pływający przycisk na telefonie, kontakt): numer ustawiasz **w jednym miejscu** – `PHONE_TEL` (i opcjonalnie `PHONE_LABEL`) w `js/config.js`. Pamiętaj, żeby zmienić domyślne `+48000000000`.
- **Wyszukiwarka:** filtrowanie na żywo, filtry dodatkowe (cena od/do, metraż od/do, pokoje), wyszukiwanie lokalizacji bez polskich znaków („krakow” znajdzie Kraków), sortowanie i przycisk „Wyczyść filtry”.
