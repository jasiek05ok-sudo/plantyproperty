<?php
/**
 * Konfiguracja formularza kontaktowego.
 * Plik wykonuje się po stronie serwera – odwiedzający NIE widzą jego zawartości,
 * więc można tu bezpiecznie trzymać adres e-mail i klucze.
 */
return [
    // Na ten adres trafiają zapytania z formularza.
    'mail_to'   => 'jasiek05ok@gmail.com',

    // Nadawca wiadomości. Najlepiej skrzynka w Twojej domenie (utwórz ją w panelu hostingu),
    // np. 'formularz@xn--plantypropertykrakw-i5b.pl'. Puste = formularz@<domena serwera>.
    'mail_from' => '',

    // CRM IMO (opcjonalnie). Gdy podasz adres, zapytanie jest najpierw wysyłane do IMO,
    // a e-mail służy jako zapas, jeśli IMO nie odpowie. Dane uzyskasz od wsparcia IMO.
    'imo_url'   => '',
    'imo_key'   => '',
];
