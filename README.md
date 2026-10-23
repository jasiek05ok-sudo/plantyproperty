# Planty Property – plantypropertykraków.pl

Statyczna strona (HTML/CSS/JS), gotowa do hostingu na **GitHub Pages**. Bez frameworków, bez zewnętrznych czcionek, bez PHP.

Domena z polskim znakiem jest w DNS zapisywana jako **`xn--plantypropertykrakw-i5b.pl`** (punycode) – tak jest wpisana w pliku `CNAME`. Przeglądarki pokazują ją użytkownikom jako plantypropertykraków.pl.

## Struktura
- `index.html` – strona główna, `polityka-prywatnosci.html`, `polityka-cookies.html`, `404.html`
- `js/config.js` – **jedyne miejsce konfiguracji** (CRM IMO, adres formularza, analityka)
- `js/cookies.js` – baner zgód (skrypty analityczne/marketingowe tylko po zgodzie)
- `js/app.js` – oferty, wyszukiwarka, formularz, animacje; `js/tree.js` – drzewo (liście spadają po najechaniu kursorem, na telefonie po dotknięciu)
- `data/offers.json` – **dane demonstracyjne** ofert
- `CNAME`, `.nojekyll`, `robots.txt`, `sitemap.xml` – pliki pod GitHub Pages i SEO

## Formularz kontaktowy
1. Jeśli w `js/config.js` ustawisz `LEAD_IMO_URL` (publiczny adres przyjmujący zapytania w IMO), strona wyśle zapytanie tam.
2. Jeśli IMO jest niedostępne, nieskonfigurowane lub odpowie błędem (limit 8 s), zapytanie trafia **e-mailem** na adres skonfigurowany w `LEAD_EMAIL_ENDPOINT` (usługa FormSubmit).

**Pierwsze uruchomienie FormSubmit:** po pierwszym wysłaniu formularza (z działającej domeny, nie z pliku na dysku) FormSubmit wyśle na skrzynkę mail z prośbą o aktywację – kliknij w link, od tej chwili zapytania będą przychodzić. Sprawdź też folder Spam.

**Ukrycie adresu e-mail:** adres w `config.js` jest widoczny w kodzie strony (a repozytorium Pages na darmowym koncie musi być publiczne). Po aktywacji FormSubmit podaje w mailu **losowy alias** formularza – podmień nim adres w `LEAD_EMAIL_ENDPOINT`, a boty nie zbiorą skrzynki.

Limit i niezawodność darmowej usługi są ograniczone – przy większym ruchu rozważ płatną alternatywę lub bezpośrednią integrację z IMO.

## Integracja z CRM IMO
Strona jest statyczna, więc **nie umieszczaj w niej tajnych kluczy API** (byłyby widoczne dla każdego).
- **Oferty z IMO → strona:** zapytaj IMO o format eksportu ofert na stronę www (JSON/XML/API). JSON wskaż w `OFFERS_URL` i dopasuj nazwy pól w `FIELD_MAP`. XML wymaga konwersji (np. GitHub Action pobierająca eksport co kilka godzin i zapisująca `data/offers.json`).
- **Zapytania → IMO:** zapytaj IMO o publiczny adres/e-mail importu zapytań ze stron www i wpisz go w `LEAD_IMO_URL`. Do tego czasu działa wysyłka e-mailem.
- Alternatywa: IMO oferuje własne strony zintegrowane z CRM na firmowej domenie.

## Do uzupełnienia (szukaj `[UZUPEŁNIĆ`)
Dane firmy (nazwa, adres, NIP/REGON, licencja/OC pośrednika), telefon, e-mail kontaktowy, daty polityk, zdjęcia i teksty. Polityki to szablony – przejrzyj je z prawnikiem/IOD.

## Wdrożenie na GitHub Pages
1. Utwórz repozytorium (np. `plantyproperty`) i wgraj zawartość tego folderu do gałęzi `main` (plik `index.html` w katalogu głównym).
2. **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
3. W **Custom domain** wpisz `xn--plantypropertykrakw-i5b.pl` (powinno już być ustawione z pliku `CNAME`).
4. U rejestratora domeny ustaw DNS:
   - rekordy **A** dla `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - rekordy **AAAA** dla `@` (opcjonalnie): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - rekord **CNAME** dla `www` → `TWOJ-LOGIN.github.io`
5. Po propagacji DNS (od kilku minut do kilku godzin) zaznacz w Pages **Enforce HTTPS**.
6. Przetestuj formularz i aktywuj FormSubmit (patrz wyżej).

Uwaga: zanim zrobisz DNS, upewnij się, że rejestrator pozwala ustawiać własne rekordy A/CNAME (ręczna edycja DNS) dla domeny IDN.
# plantyproperty
