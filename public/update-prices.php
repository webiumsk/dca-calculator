<?php
// update-prices.php
// Append today's BTC price in EUR and USD to local CSV files (once per day).
// Usage: setup cron or run this file directly.

$files = [
    'eur' => __DIR__ . '/btc-history-eur.csv',
    'usd' => __DIR__ . '/btc-history-usd.csv',
];

// Polyfill for older PHP
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}

// Today's date in UTC in the required format
$todayUtc = gmdate('Y-m-d 00:00:00 \U\T\C');

// Fetch price from CoinGecko
$apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur,usd';
$json = @file_get_contents($apiUrl);

if ($json === false) {
    http_response_code(500);
    die("Failed to fetch prices.\n");
}

$data = json_decode($json, true);
if (!isset($data['bitcoin']['eur'], $data['bitcoin']['usd'])) {
    http_response_code(500);
    die("Invalid CoinGecko response.\n");
}

$prices = [
    'eur' => $data['bitcoin']['eur'],
    'usd' => $data['bitcoin']['usd'],
];

// Helper: create CSV with header if missing
function ensure_csv(string $path): void
{
    if (!file_exists($path)) {
        file_put_contents($path, "date,price\n");
    }
}

// Append today's line if missing
function append_today(string $path, string $todayUtc, float $price): string
{
    ensure_csv($path);

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $todayPrefix = $todayUtc . ',';

    foreach ($lines as $line) {
        if (str_starts_with($line, $todayPrefix)) {
            return "Already updated for $todayUtc\n";
        }
    }

    $line = $todayUtc . "," . $price . "\n";
    file_put_contents($path, $line, FILE_APPEND | LOCK_EX);

    return "Added: $line";
}

header('Content-Type: text/plain');

foreach ($files as $currency => $path) {
    $price = $prices[$currency];
    echo strtoupper($currency) . " -> " . append_today($path, $todayUtc, $price);
}
