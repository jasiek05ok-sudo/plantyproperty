<?php
/**
 * Odbiór zapytań z formularza (plantypropertykraków.pl).
 *  1) walidacja i ochrona antyspamowa (honeypot, limit czasu, kontrola źródła),
 *  2) jeśli skonfigurowano IMO – próba przekazania zapytania do CRM,
 *  3) gdy IMO nie jest skonfigurowane lub nie odpowiada – wysyłka e-mailem (api/config.php).
 * Skrypt nie używa ciasteczek ani sesji.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$cfg = @include __DIR__ . '/config.php';
$cfg = is_array($cfg) ? $cfg + ['mail_to' => '', 'mail_from' => '', 'imo_url' => '', 'imo_key' => ''] : ['mail_to' => '', 'mail_from' => '', 'imo_url' => '', 'imo_key' => ''];

function out(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// zapytanie musi pochodzić z tej samej domeny
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if ($origin && strtolower($origin) !== $host) out(403, ['ok' => false, 'error' => 'origin']);

$d = json_decode(file_get_contents('php://input', false, null, 0, 20000), true);
if (!is_array($d)) out(400, ['ok' => false, 'error' => 'bad_json']);

// honeypot – boty wypełniają ukryte pole; udajemy sukces
if (!empty($d['website'])) out(200, ['ok' => true]);

$clean = function ($v, int $max): string {
    $v = strip_tags((string)($v ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $v);
    return mb_substr(trim($v), 0, $max);
};
$name    = $clean($d['name'] ?? '', 120);
$email   = $clean($d['email'] ?? '', 160);
$phone   = $clean($d['phone'] ?? '', 40);
$message = $clean($d['message'] ?? '', 4000);
$offer   = $clean($d['offer_id'] ?? '', 60);
$kind    = in_array(($d['kind'] ?? ''), ['zgloszenie', 'szukam'], true) ? $d['kind'] : 'zapytanie';
$source  = $clean($d['source_url'] ?? '', 300);

if ($name === '' || $message === '') out(422, ['ok' => false, 'error' => 'missing']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'email']);
if (empty($d['consent'])) out(422, ['ok' => false, 'error' => 'consent']);

// limit: 1 zapytanie / 20 s z jednego adresu IP (plik tymczasowy, bez cookies)
$rl = sys_get_temp_dir() . '/pp_rl_' . md5($_SERVER['REMOTE_ADDR'] ?? 'x');
if (is_file($rl) && time() - filemtime($rl) < 20) out(429, ['ok' => false, 'error' => 'rate']);
@touch($rl);

$when = gmdate('c');

// --- 1) CRM IMO ---------------------------------------------------------
$sent = false;
if ($cfg['imo_url'] !== '' && function_exists('curl_init')) {
    $ch = curl_init($cfg['imo_url']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'name' => $name, 'email' => $email, 'phone' => $phone, 'message' => $message,
            'offer_id' => $offer, 'kind' => $kind, 'consent' => true, 'consent_at' => $when, 'source' => $host,
        ]),
        CURLOPT_HTTPHEADER => array_values(array_filter([
            'Content-Type: application/json',
            $cfg['imo_key'] !== '' ? 'Authorization: Bearer ' . $cfg['imo_key'] : null,
        ])),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $sent = $code >= 200 && $code < 300;
}

// --- 2) e-mail (gdy IMO niedostępne lub nieskonfigurowane) ----------------
if (!$sent && $cfg['mail_to'] !== '') {
    $from = $cfg['mail_from'] !== '' ? $cfg['mail_from'] : 'formularz@' . preg_replace('/^www\./', '', $host);
    $subject = '=?UTF-8?B?' . base64_encode(($kind === 'zgloszenie' ? 'Zgłoszenie nieruchomości – ' : ($kind === 'szukam' ? 'Szukam nieruchomości – ' : 'Zapytanie ze strony www – ')) . $name) . '?=';
    $body = ($kind === 'zgloszenie' ? "Nowe ZGŁOSZENIE NIERUCHOMOŚCI ze strony {$host}\n\n" : ($kind === 'szukam' ? "Nowe zgłoszenie POSZUKIWANIA NIERUCHOMOŚCI ze strony {$host}\n\n" : "Nowe zapytanie ze strony {$host}\n\n"))
          . "Imię i nazwisko: $name\nE-mail: $email\nTelefon: " . ($phone ?: '-') . "\n"
          . 'Oferta (ID z CRM): ' . ($offer ?: '-') . "\n\n$message\n\n"
          . "Zgoda na przetwarzanie danych (polityka prywatności): TAK, $when UTC\nStrona: $source\n";
    $headers = [
        'From' => $from, 'Reply-To' => $email, 'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8', 'X-Mailer' => 'PlantyProperty',
    ];
    $sent = @mail($cfg['mail_to'], $subject, $body, $headers, '-f' . $from)
         || @mail($cfg['mail_to'], $subject, $body, $headers);
}

if (!$sent) out(500, ['ok' => false, 'error' => 'delivery']);
out(200, ['ok' => true]);
