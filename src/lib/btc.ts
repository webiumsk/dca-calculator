import type { BtcPricePoint, CacheEntry, Currency } from '../types';

const CACHE_KEY = 'btc_price_cache_v1';

function loadCache(): CacheEntry[] {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveCache(entries: CacheEntry[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    } catch {
        // Ignore quota errors etc.
    }
}

function getCachedPrices(currency: Currency): BtcPricePoint[] | null {
    const entries = loadCache();
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const entry = entries.find((e) => e.currency === currency);
    if (!entry) return null;
    if (now - entry.timestamp > ONE_DAY) {
        // Cache older than 24h -> ignore
        return null;
    }
    return entry.prices;
}

function setCachedPrices(currency: Currency, prices: BtcPricePoint[]) {
    const entries = loadCache().filter((e) => e.currency !== currency);
    entries.push({ currency, timestamp: Date.now(), prices });
    saveCache(entries);
}

// API: fetch BTC history from local CSV (no backend, no API key)
export async function fetchBtcHistory(currency: Currency): Promise<BtcPricePoint[]> {
    const cached = getCachedPrices(currency);
    if (cached) return cached;

    // Choose file based on currency
    const file =
        currency === 'eur'
            ? '/btc-history-eur.csv'
            : '/btc-history-usd.csv';

    let res: Response;
    try {
        res = await fetch(file);
    } catch (e) {
        console.error('Network error when loading local BTC CSV:', e);
        throw new Error('Network error while loading BTC prices');
    }

    if (!res.ok) {
        throw new Error(`Failed to load BTC CSV (${res.status})`);
    }

    const text = await res.text();

    // Parse CSV -> BtcPricePoint[]
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length <= 1) {
        throw new Error('BTC CSV file is empty or has only header');
    }

    // First line is header (date,price)
    const dataLines = lines.slice(1);

    const prices: BtcPricePoint[] = [];

    for (const line of dataLines) {
        // Split by comma / semicolon / tab (covers most CSV exports)
        const parts = line.split(/[,\t;]+/);
        if (parts.length < 2) continue;

        const dateStr = parts[0]; // "2013-04-28 00:00:00 UTC"
        const priceStr = parts[1];

        const price = Number(priceStr.replace(',', '.'));
        if (!isFinite(price)) continue;

        // Convert "2013-04-28 00:00:00 UTC" -> timestamp (ms)
        // We add "Z" to make sure it's parsed as UTC
        const iso = dateStr.replace(' UTC', '') + 'Z';
        const date = new Date(iso);
        const ts = date.getTime();
        if (isNaN(ts)) continue;

        prices.push({ timestamp: ts, price });
    }

    if (!prices.length) {
        throw new Error('No valid rows found in BTC CSV');
    }

    // Sort by timestamp ascending just in case
    prices.sort((a, b) => a.timestamp - b.timestamp);

    setCachedPrices(currency, prices);
    return prices;
}
