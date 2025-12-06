<script lang="ts">
  import { onMount } from 'svelte';
  import Footer from "./components/Footer.svelte";
  
  // --- Types ---
  type Frequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  type Currency = 'eur' | 'usd';

  interface DataPoint {
    date: string;          // ISO string for display
    invested: number;      // cumulative invested fiat
    value: number;         // portfolio value in fiat at that time
  }

  interface BtcPricePoint {
    timestamp: number; // ms since epoch
    price: number;
  }

  // Simple i18n dictionary (EN/SK)
  const translations = {
    en: {
      title: 'BTC DCA Calculator',
      description:'Simulate how much Bitcoin you would have today if you had stacked sats regularly over time with ',
      dcaTooltip: 'Dollar Cost Averaging - An investment strategy that uses a fixed amount of dollars (or other currencies) to purchase an asset at regular intervals. For Bitcoin investing, this means buying BTC with a fixed amount of fiat currency at regular intervals, regardless of what the BTC price happens to be at any given moment.',
      language: 'Language',
      frequency: 'Frequency',
      freqDaily: 'Daily',
      freqWeekly: 'Weekly',
      freqBiWeekly: 'Bi-weekly',
      freqMonthly: 'Monthly',
      amountPerPeriod: 'Amount per period',
      currency: 'Currency',
      period: 'Time period',
      lastYears: 'Last X years',
      customRange: 'Custom range',
      yearsLabel: 'Years',
      startDate: 'Start date',
      endDate: 'End date',
      calculate: 'Calculate',
      totalInvested: 'Total invested',
      btcAccumulated: 'BTC accumulated',
      currentValue: 'Current value',
      profitLoss: 'Profit / loss',
      vsInvested: 'vs invested',
      lumpSumLabel: 'Compare with a one-time investment',
      lumpSumIntro: 'Here we compare DCA (regular purchases over time) with a one-time lump sum invested at the start of the period.',
      lumpSumHow: 'Lump sum means you invest the whole amount on the first day and then just hold. DCA means you split the same total amount into regular purchases of the same size.',
      lumpSumValue: 'Value of one-time investment today',
      lumpSumDcaValue: 'Value of your DCA strategy today',
      lumpSumDifference: 'Difference (lump sum − DCA)',
      lumpSumWins: 'In this scenario a one-time investment would have performed better than DCA.',
      dcaWins: 'In this scenario DCA would have performed better than a one-time investment.',
      equalPerf: 'In this scenario DCA and a one-time investment end up almost the same.',
      graphTitle: 'Portfolio value vs invested over time',
      investedSeries: 'Invested',
      valueSeries: 'Value',
      exportCsv: 'Export CSV',
      exportPdf: 'Print / Save as PDF',
      loading: 'Calculating DCA and loading BTC prices...',
      error: 'Something went wrong while loading data. Please try again.',
      noData: 'Fill the form and hit Calculate to see results.',
      apiNote: 'Prices loaded from public Bitcoin price API.',
      otherTools: 'Other tools',
      more: 'More',
      supportMe: 'Support me',
      sendLightning: 'Send Lightning',
      copied: 'Copied!',
      madeWith: 'Made with 🧡 for',
      and: 'and',
    },
    sk: {
      title: 'BTC DCA kalkulačka',
      description: 'Pozri sa, koľko BTC by si mal dnes, keby si pravidelne nakupoval za rovnakú sumu metódou',
      dcaTooltip: 'DCA = Dollar Cost Averaging - Investičná stratégia využívajúca fixnú sumu dolárov (alebo iných mien) na nákup aktíva v pravidelných intervaloch. Pre bitcoinové investovanie to znamená nakupovanie BTC s fixným množstvom fiat meny v pravidelných intervaloch bez ohľadu na to, aká je cena BTC v akomkoľvek danom intervale.',
      language: 'Jazyk',
      frequency: 'Frekvencia',
      freqDaily: 'Denne',
      freqWeekly: 'Týždenne',
      freqBiWeekly: 'Každé 2 týždne',
      freqMonthly: 'Mesačne',
      amountPerPeriod: 'Suma na nákup',
      currency: 'Mena',
      period: 'Časové obdobie',
      lastYears: 'Posledných X rokov',
      customRange: 'Vlastný rozsah',
      yearsLabel: 'Roky',
      startDate: 'Začiatočný dátum',
      endDate: 'Koncový dátum',
      calculate: 'Vypočítať',
      totalInvested: 'Celková investícia',
      btcAccumulated: 'Nakúpené BTC',
      currentValue: 'Aktuálna hodnota',
      profitLoss: 'Zisk / strata',
      vsInvested: 'oproti investícii',
      lumpSumLabel: 'Porovnanie s jednorazovou investíciou',
      lumpSumIntro: 'Tu porovnávame DCA (pravidelné nákupy v čase) s jednorazovou investíciou na začiatku obdobia.',
      lumpSumHow: 'Jednorazová investícia znamená, že celú sumu vložíš v prvý deň a potom len držíš. DCA znamená, že tú istú celkovú sumu rozdelíš na pravidelné nákupy rovnakej výšky.',
      lumpSumValue: 'Hodnota jednorazovej investície dnes',
      lumpSumDcaValue: 'Hodnota tvojej DCA stratégie dnes',
      lumpSumDifference: 'Rozdiel (jednorazová − DCA)',
      lumpSumWins: 'V tomto scenári by jednorazová investícia dopadla lepšie ako DCA.',
      dcaWins: 'V tomto scenári by DCA dopadlo lepšie ako jednorazová investícia.',
      equalPerf: 'V tomto scenári dopadnú DCA aj jednorazová investícia takmer rovnako.',
      graphTitle: 'Vývoj hodnoty portfólia vs investovaná suma',
      investedSeries: 'Investované',
      valueSeries: 'Hodnota',
      exportCsv: 'Exportovať CSV',
      exportPdf: 'Tlač / Uložiť ako PDF',
      loading: 'Počítam DCA a sťahujem ceny BTC...',
      error: 'Počas načítavania nastala chyba. Skús to znova.',
      noData: 'Vyplň formulár a klikni na Vypočítať.',
      apiNote: 'Ceny sú načítané z verejného Bitcoin API.',
      otherTools: 'Ďalšie nástroje',
      more: 'Viac',
      supportMe: 'Podpor ma',
      sendLightning: 'Poslať Lightning',
      copied: 'Skopírované!',
      madeWith: 'Vyrobené s 🧡 pre',
      and: 'a',
    },
  } as const;

  const SHOW_LUMP_SUM_KEY = 'dca_show_lump_sum';

  // State
  let lang: 'en' | 'sk' = 'en';
  let showTooltip = false;

  let frequency: Frequency = 'monthly';
  let amountPerPeriod = 100;
  let currency: Currency = 'eur';

  let periodMode: 'years' | 'custom' = 'years';
  let yearsBack = 5;

  let startDate: string = '';
  let endDate: string = new Date().toISOString().slice(0, 10); // today

  let isLoading = false;
  let errorMessage: string | null = null;

  let totalInvested = 0;
  let totalBtc = 0;
  let currentValue = 0;
  let profit = 0;
  let profitPercent = 0;

  let showLumpSum = false;
  let lumpSumDifference = 0;
  let lumpSumMessage = '';
  let lumpSumValue = 0;  

  let dataPoints: DataPoint[] = [];

  let chartPaths = {
    investedPath: '',
    valuePath: '',
  };

  let settingsLoaded = false;

  // Share panel state
  let showSharePanel = false;
  let shareCopied = false;

  // LocalStorage helpers for caching API responses 
  const CACHE_KEY = 'btc_price_cache_v1';

  interface CacheEntry {
    currency: Currency;
    timestamp: number;        // ms since epoch when stored
    prices: BtcPricePoint[];  // full price history for that currency
  }

  onMount(() => {
    try {
      // load language
      const savedLang = localStorage.getItem('DCA_LANG');
      if (savedLang === 'en' || savedLang === 'sk') {
        lang = savedLang;
      }

      // load lump sum toggle
      const savedLump = localStorage.getItem(SHOW_LUMP_SUM_KEY);
      if (savedLump !== null) {
        showLumpSum = savedLump === 'true';
      }
    } catch {
      // ignore
    }

    // mark settings as loaded, so we can start saving
    settingsLoaded = true;
  });


  $: if (settingsLoaded) {
    try {
      localStorage.setItem('DCA_LANG', lang);
      localStorage.setItem(SHOW_LUMP_SUM_KEY, String(showLumpSum));
    } catch {
      // ignore
    }
  }

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
async function fetchBtcHistory(currency: Currency): Promise<BtcPricePoint[]> {
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


  // Helper: generate DCA dates
  function generateDates(
    start: Date,
    end: Date,
    frequency: Frequency
  ): Date[] {
    const dates: Date[] = [];
    const d = new Date(start.getTime());

    while (d <= end) {
      dates.push(new Date(d.getTime()));

      if (frequency === 'daily') {
        d.setDate(d.getDate() + 1);
      } else if (frequency === 'weekly') {
        d.setDate(d.getDate() + 7);
      } else if (frequency === 'bi-weekly') {
        d.setDate(d.getDate() + 14);
      } else {
        // monthly
        const month = d.getMonth();
        d.setMonth(month + 1);
      }
    }

    return dates;
  }

  // Helper: find closest price at or before given date
  function findPriceForDate(
    prices: BtcPricePoint[],
    date: Date
  ): number | null {
    const target = date.getTime();

    // Binary search for last price <= target
    let lo = 0;
    let hi = prices.length - 1;
    let bestIndex = -1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const t = prices[mid].timestamp;
      if (t <= target) {
        bestIndex = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (bestIndex === -1) return null;
    return prices[bestIndex].price;
  }

  // Helper: format currency nicely
  function formatFiat(value: number): string {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const prefix = currency === 'usd' ? '$ ' : '';
    const suffix = currency === 'eur' ? ' €' : '';

    return (value < 0 ? '-' : '') + prefix + formatted + suffix;
  }


  function formatBtc(value: number): string {
    return value.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
  }

  // CSV export
  function exportCsv() {
    if (!dataPoints.length) return;

    const header = ['date', 'invested', 'value'];
    const rows = dataPoints.map((p) => [
      p.date,
      p.invested.toFixed(2),
      p.value.toFixed(2),
    ]);

    const csv =
      [header, ...rows].map((r) => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dca-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Main calculate function
  async function calculate() {
    errorMessage = null;
    isLoading = true;
    dataPoints = [];
    totalInvested = 0;
    totalBtc = 0;
    currentValue = 0;
    profit = 0;
    profitPercent = 0;
    lumpSumValue = 0;

    try {
      // Determine start/end dates
      const end = new Date(endDate || new Date().toISOString().slice(0, 10));
      let start: Date;

      if (periodMode === 'years') {
        const s = new Date(end.getTime());
        s.setFullYear(s.getFullYear() - yearsBack);
        start = s;
      } else {
        if (!startDate) {
          throw new Error('Start date is required for custom range');
        }
        start = new Date(startDate);
      }

      // Normalize times to midnight to avoid timezone issues
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (start >= end) {
        throw new Error('Start date must be before end date');
      }

      const prices = await fetchBtcHistory(currency);
      const dates = generateDates(start, end, frequency);

      let cumulativeInvested = 0;
      let cumulativeBtc = 0;

      const points: DataPoint[] = [];

      // Lump sum: invest all at start date
      const startPrice = findPriceForDate(prices, start);
      let lumpSumBtc = 0;
      if (startPrice) {
        lumpSumBtc = amountPerPeriod * dates.length / startPrice;
      }

      for (const d of dates) {
        const price = findPriceForDate(prices, d);
        if (!price) continue; // skip if no price available

        const btcBought = amountPerPeriod / price;
        cumulativeInvested += amountPerPeriod;
        cumulativeBtc += btcBought;

        const valueAtDate = cumulativeBtc * price;

        points.push({
          date: d.toISOString().slice(0, 10),
          invested: cumulativeInvested,
          value: valueAtDate,
        });
      }

      if (!points.length) {
        throw new Error('No data available for selected range/frequency');
      }

      dataPoints = points;
      chartPaths = buildChartPaths(points);

      totalInvested = points[points.length - 1].invested;
      totalBtc = cumulativeBtc;

      const lastPrice = prices[prices.length - 1].price;
      currentValue = totalBtc * lastPrice;
      profit = currentValue - totalInvested;
      profitPercent =
        totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      // Lump sum current value
      lumpSumValue = lumpSumBtc * lastPrice;

      // Comparison: lump sum vs DCA
      lumpSumDifference = lumpSumValue - currentValue;

      if (Math.abs(lumpSumDifference) < currentValue * 0.01) {
        lumpSumMessage = translations[lang].equalPerf;
      } else if (lumpSumDifference > 0) {
        lumpSumMessage = translations[lang].lumpSumWins;
      } else {
        lumpSumMessage = translations[lang].dcaWins;
      }

      /*console.log('DCA points:', dataPoints.length);
        if (dataPoints.length) {
          console.log('First point:', dataPoints[0]);
          console.log('Last point:', dataPoints[dataPoints.length - 1]);
        }*/
    } catch (err: any) {
      console.error(err);
      errorMessage = err?.message || 'Unknown error';

      
      
    } finally {
      isLoading = false;
    }
  }

  // Build chart paths from provided points (no Svelte magic here)
  function buildChartPaths(points: DataPoint[]) {
    if (!points || points.length === 0) {
      return { investedPath: '', valuePath: '' };
    }

    const w = 800;
    const h = 320;
    const padding = 20;

    const xs = points.map((_, i) => i);
    const investedValues = points.map((p) => p.invested);
    const valueValues = points.map((p) => p.value);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...investedValues, ...valueValues);
    const maxY = Math.max(...investedValues, ...valueValues);

    const xScale = (x: number) =>
      padding +
      (maxX === minX
        ? (w - 2 * padding) / 2
        : ((x - minX) / (maxX - minX)) * (w - 2 * padding));

    const yScale = (y: number) =>
      h -
      padding -
      (maxY === minY
        ? (h - 2 * padding) / 2
        : ((y - minY) / (maxY - minY)) * (h - 2 * padding));

    const investedPath =
      'M ' +
      points
        .map((p, i) => `${xScale(xs[i])} ${yScale(p.invested)}`)
        .join(' L ');

    const valuePath =
      'M ' +
      points
        .map((p, i) => `${xScale(xs[i])} ${yScale(p.value)}`)
        .join(' L ');

    console.log('chart investedPath:', investedPath.slice(0, 80) + '...');
    console.log('chart valuePath   :', valuePath.slice(0, 80) + '...');

    return { investedPath, valuePath };
  }

  // Helper: describe period for share text
  function getPeriodText(): string {
    if (periodMode === 'years') {
      if (lang === 'sk') {
        return `za posledných ${yearsBack} rokov`;
      } else {
        return `for the last ${yearsBack} years`;
      }
    } else {
      const from = startDate || '?';
      const to = endDate || '?';
      if (lang === 'sk') {
        return `od ${from} do ${to}`;
      } else {
        return `from ${from} to ${to}`;
      }
    }
  }

  // Helper: describe frequency for share text
  function getFrequencyText(): string {
    if (lang === 'sk') {
      if (frequency === 'daily') return 'každý deň';
      if (frequency === 'weekly') return 'každý týždeň';
      if (frequency === 'bi-weekly') return 'každé 2 týždne';
      return 'každý mesiac';
    } else {
      if (frequency === 'daily') return 'every day';
      if (frequency === 'weekly') return 'every week';
      if (frequency === 'bi-weekly') return 'every 2 weeks';
      return 'every month';
    }
  }

  // Build share text based on current state
  function getShareText(): string {
    if (!dataPoints.length) return '';

    const periodText = getPeriodText();
    const freqText = getFrequencyText();
    const amountText = `${amountPerPeriod} ${currency === 'eur' ? 'EUR' : 'USD'}`;
    const profitText = formatFiat(profit);
    const profitPct = profitPercent.toFixed(1);

    if (lang === 'sk') {
      const direction = profit >= 0 ? 'v pluse' : 'v mínuse';
      return `Ak by som ${periodText} sporil ${freqText} ${amountText} do Bitcoinu, dnes by som bol ${direction} ${profitText} (${profitPct} %).`;
    } else {
      const direction = profit >= 0 ? 'up' : 'down';
      return `If I had stacked ${amountText} into Bitcoin ${freqText} ${periodText}, today I would be ${direction} ${profitText} (${profitPct} %).`;
    }
  }

  function getCurrentUrl(): string {
    if (typeof window === 'undefined') return 'https://dca.dvadsatjeden.org';
    return window.location.href;
  }

  // Open X / Twitter
  function shareToX() {
    const text = getShareText();
    if (!text) return;
    const url = encodeURIComponent(getCurrentUrl());
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  // Open Facebook
  function shareToFacebook() {
    const text = getShareText();
    if (!text) return;
    const url = encodeURIComponent(getCurrentUrl());
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  // Copy to clipboard
  async function copyShareText() {
    const text = getShareText();
    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) return;

    const full = `${text} ${getCurrentUrl()}`;
    try {
      await navigator.clipboard.writeText(full);
      shareCopied = true;
      setTimeout(() => (shareCopied = false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  function toggleSharePanel() {
    showSharePanel = !showSharePanel;
    if (!showSharePanel) {
      shareCopied = false;
    }
  }

</script>

<svelte:head>
  <title>{translations[lang].title}</title>
  <meta name="description" content={translations[lang].description} />
</svelte:head>

<div class="app" >
  <main class="container">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1>{translations[lang].title}</h1>
          <p class="subtitle">{translations[lang].description} <button class="hover-term"
            on:mouseenter={() => showTooltip = true}
            on:mouseleave={() => showTooltip = false}
            on:click={() => (showTooltip = !showTooltip)}
          >DCA <span class="info-icon">ⓘ</span></button></p>
          {#if showTooltip}
            <div class="tooltip">
              {translations[lang].dcaTooltip}
            </div>
          {/if}
        </div>
        
        <div class="header-right">          
          <div class="switcher" role="tablist">
            <button 
              class:active={lang === 'sk'}
              on:click={() => lang = 'sk'}
              aria-label="Slovenčina"
              role="tab"
              aria-selected={lang === 'sk'}
            >
              SK
            </button>
            <button 
              class:active={lang === 'en'}
              on:click={() => lang = 'en'}
              aria-label="English"
              role="tab"
              aria-selected={lang === 'en'}
            >
              EN
            </button>
          </div>   
        </div>
      </div>
    </header>

    <div class="layout">
      <!-- LEFT 1/4 - sidebar with form -->
      <section class="card sidebar">
          <div class="switcher">
            <button
              class:active={periodMode === 'years'}
              on:click={() => (periodMode = 'years')}
            >
              {translations[lang].lastYears}
            </button>

            <button
              class:active={periodMode === 'custom'}
              on:click={() => (periodMode = 'custom')}
            >
              {translations[lang].customRange}
            </button>
          </div>

          {#if periodMode === 'years'}
            <label class="field">              
                <span>{translations[lang].yearsLabel}</span>
                <input type="number" min="1" max="13" bind:value={yearsBack} />              
            </label>
          {:else}
            <label class="field">
              <span>{translations[lang].startDate}</span>
                <input type="date" bind:value={startDate} />              
            </label>
            <label class="field">
              <span>{translations[lang].endDate}</span>
                <input type="date" bind:value={endDate} />              
            </label>
          {/if}

          <label class="field">
            <span>{translations[lang].frequency}</span>
            <select bind:value={frequency}>
              <option value="daily">{translations[lang].freqDaily}</option>
              <option value="weekly">{translations[lang].freqWeekly}</option>
              <option value="bi-weekly">{translations[lang].freqBiWeekly}</option>
              <option value="monthly">{translations[lang].freqMonthly}</option>
            </select>
          </label>        

          <label class="field">
            <span>{translations[lang].amountPerPeriod}</span>
            <input type="number" min="0" step="10" bind:value={amountPerPeriod} />
          </label>

          <label class="field">
            <span>{translations[lang].currency}</span>
            <select bind:value={currency}>
              <option value="eur">EUR</option>
              <option value="usd">USD</option>
            </select>
          </label>        

        <div class="switcher calculate">
          <button class="button" on:click|preventDefault={calculate}>
            {translations[lang].calculate}
          </button>
        </div>

        {#if isLoading}
          <p class="info loading">{translations[lang].loading}</p>
        {:else if errorMessage}
          <p class="info error">
            {translations[lang].error}<br />
            <small>{errorMessage}</small>
          </p>
        {:else if dataPoints.length === 0}
          <p class="info">{translations[lang].noData}</p>
        {/if}  
      </section>

      <!-- RIGHT 3/4 – results -->
      
        <section class="card main-panel">
          <!-- TOP HALF: 2x2 stats -->
          <div class="flex flex-col gap-sm">
            <div class="stats-row">
              <div class="stat">
                <span class="label">{translations[lang].totalInvested}</span>
                <span class="value">{formatFiat(totalInvested)}</span>
              </div>
              <div class="stat">
                <span class="label">{translations[lang].currentValue}</span>
                <span class="value">{formatFiat(currentValue)}</span>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat">
                <span class="label">{translations[lang].btcAccumulated}</span>
                <span class="value">{formatBtc(totalBtc)} BTC</span>
              </div>
              <div class="stat">
                <span class="label">
                  {translations[lang].profitLoss}
                  <small>({translations[lang].vsInvested})</small>
                </span>
                <span
                  class="value"
                  class:text-positive={profit > 0}
                  class:text-negative={profit < 0}
                >
                  {formatFiat(profit)} ({profitPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <!-- BOTTOM FULL-WIDTH: everything else (lump sum, chart, exports) -->            
            <div class="chart-wrapper">
              <h2>{translations[lang].graphTitle}</h2>
              <svg
                viewBox="0 0 800 320"
                preserveAspectRatio="none"
                class="chart"
              >
                <path
                  d={chartPaths.investedPath}
                  fill="none"
                  stroke-width="2"
                />
                <path
                  d={chartPaths.valuePath}
                  fill="none"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
              </svg>
              <div class="legend">
                <span class="legend-item">
                  <span class="swatch solid"></span>
                  {translations[lang].investedSeries}
                </span>
                <span class="legend-item">
                  <span class="swatch dashed"></span>
                  {translations[lang].valueSeries}
                </span>
              </div>
            </div>
            
            <div class="lumpsum">
              <label class="checkbox-line">
                <input type="checkbox" bind:checked={showLumpSum} />
                <span>{translations[lang].lumpSumLabel}</span>
              </label>

              {#if showLumpSum}
                <div class="lumpsum-content">
                  <p class="lump-text">
                    {translations[lang].lumpSumIntro}
                  </p>
                  <p class="lump-text">
                    {translations[lang].lumpSumHow}
                  </p>

                  <div class="lump-grid">
                    <div class="lump-row">
                      <span>{translations[lang].lumpSumValue}</span>
                      <strong>{formatFiat(lumpSumValue)}</strong>
                    </div>
                    <div class="lump-row">
                      <span>{translations[lang].lumpSumDcaValue}</span>
                      <strong>{formatFiat(currentValue)}</strong>
                    </div>
                    <div class="lump-row">
                      <span>{translations[lang].lumpSumDifference}</span>
                      <strong
                        class:text-positive={lumpSumDifference > 0}
                        class:text-negative={lumpSumDifference < 0}
                      >
                        {formatFiat(lumpSumDifference)}
                      </strong>
                    </div>
                  </div>

                  <p class="lump-message">
                    {lumpSumMessage}
                  </p>
                </div>
              {/if}            
            </div>
              {#if !isLoading && !errorMessage && dataPoints.length}
                <div class="export">
                  <button class="btn" on:click={exportCsv}>
                    {translations[lang].exportCsv}
                  </button>

                  <button class="btn" on:click={toggleSharePanel}>
                    {lang === 'sk' ? 'Zdieľať' : 'Share'}
                  </button>
                </div>

                {#if showSharePanel}
                  <div class="share-panel">
                    <p class="share-title">
                      {lang === 'sk' ? 'Zdieľaj svoj výsledok' : 'Share your result'}
                    </p>

                    <div class="share-input-wrapper">
                      <input
                        class="share-input"
                        type="text"
                        readonly
                        value={getShareText()}
                      />
                    </div>

                    <div class="share-buttons">
                      <button class="btn share-x" type="button" on:click={shareToX}>
                        X / Twitter
                      </button>
                      <button class="btn share-fb" type="button" on:click={shareToFacebook}>
                        Facebook
                      </button>
                      <button class="btn" type="button" on:click={copyShareText}>
                        {#if shareCopied}
                          {lang === 'sk' ? 'Skopírované ✅' : 'Copied ✅'}
                        {:else}
                          {lang === 'sk' ? 'Kopírovať text' : 'Copy text'}
                        {/if}
                      </button>
                      <button class="btn" type="button" on:click={toggleSharePanel}>
                        {lang === 'sk' ? 'Zavrieť' : 'Close'}
                      </button>
                    </div>
                  </div>
                {/if}
              {/if}

        </section>      
    </div>
    <Footer {translations} {lang} />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      sans-serif;
    background-color: #0b1020;
    color: #e5e7eb;
  }

  .app {
    min-height: 100vh;
    padding: var(--space-lg);
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  /* Main 1/4 + 3/4 layout */
  .layout {
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
  }

  /* Left column = 1/4, right = 3/4 */
  .sidebar {
    flex: 1;
  }

  .main-panel {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* 2x2 stats at top of right column */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .stat {
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    background: var(--color-card-dark);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .stat span:first-child {
    font-size: 0.8rem;
  }

  .stat span:last-child {
    font-size: 1.05rem;
  }

  .container {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .header {
    margin-bottom: 2rem;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  
  .header-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  } 

  h1 {
    font-size: 1.8rem;
    margin: 0;
  }

  .subtitle {
    margin: 0.25rem 0 0;
    opacity: 0.8;
    max-width: 32rem;
  }

  .card {
    background: var(--color-card-dark);
    color: inherit;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border-color);
  }

  :global(html:not(.dark)) .card {
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    border-color: rgba(148, 163, 184, 0.3);
  }

  h2 {
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  .field span {
    opacity: 0.8;
  }

  input[type='number'],
  input[type='date'],
  select {
    padding: 0.45rem 0.6rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: transparent;
    color: inherit;
    font: inherit;
  }

  input[type='number']:focus,
  input[type='date']:focus,
  select:focus {
    outline: 2px solid #4f46e5;
    outline-offset: 1px;
    border-color: transparent;
  }

  .btn {
    border-radius: 8px;
    padding: 0.55rem 1.2rem;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: transparent;
    color: inherit;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .btn:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .info {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .info.loading {
    color: #38bdf8;
  }

  .info.error {
    color: #f97373;
  }

  .stat {
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.4);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  :global(html:not(.dark)) .stat {
    background: #f9fafb;
  }

  .stat .label {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .stat .value {
    font-size: 1.05rem;
    font-weight: 600;
  }

  .lumpsum {    
    padding-top: 1rem;
    border-top: 1px dashed rgba(148, 163, 184, 0.5);
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .lumpsum label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .checkbox-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .lumpsum-content {
    margin-top: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .lump-text {
    opacity: 0.85;
  }

  .lump-grid {
    margin-top: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .lump-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .lump-row span {
    opacity: 0.8;
  }

  .lump-row strong {
    font-weight: 600;
  }

  .lump-message {
    margin-top: 0.4rem;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .chart {
    width: 100%;
    height: 260px;
    border-radius: 0.75rem;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.08), transparent),
      radial-gradient(circle at bottom, rgba(94, 234, 212, 0.08), transparent),
      rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.5);
  }

  :global(html:not(.dark)) .chart {
    background: #f9fafb;
  }

  .chart path:first-child {
    /* invested line */
    stroke: #38bdf8;
  }

  .chart path:last-child {
    /* value line */
    stroke: #a855f7;
  }

  .legend {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .swatch {
    width: 16px;
    height: 3px;
    border-radius: 999px;
    display: inline-block;
  }

  .swatch.solid {
    background: #38bdf8;
  }

  .swatch.dashed {
    background: repeating-linear-gradient(
      to right,
      #a855f7,
      #a855f7 4px,
      transparent 4px,
      transparent 8px
    );
  }

  .export {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }  

  /* Period toggle switcher */
  .switcher {
    display: flex;  
    padding: 4px;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
  }

  .switcher button {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: none;
    background: rgba(148, 163, 184, 0.1);
    color: var(--text-color, #ffffffcc);
    cursor: pointer;
    font-size: 0.9rem;
    border-radius: 6px;
    transition: all 0.15s ease;

  }

  .switcher button:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .switcher button.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    font-weight: 600;
  }

  .switcher.calculate {
    margin-top: 1rem;
  }
  .switcher.calculate .button {
    width: 100%;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    padding: 0.6rem 0;
  }

  .share-panel {
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(15, 23, 42, 0.9);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  :global(html:not(.dark)) .share-panel {
    background: #f9fafb;
  }

  .share-title {
    margin: 0;
    font-weight: 600;
  }

  .share-input-wrapper {
    display: flex;
  }

  .share-input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 0.85rem;
  }

  .share-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .share-x {
    border-color: rgba(59, 130, 246, 0.7);
  }

  .share-fb {
    border-color: rgba(37, 99, 235, 0.7);
  }

  .hover-term {
    font-weight: 800;
    cursor: help;
    position: relative;
    background: transparent;
    padding: 2px;
    color: #fff;
  }

  .tooltip {
    position: absolute;
    background: #1f2937;
    padding: .75rem;
    border-radius: .5rem;
    max-width: 600px;
    font-size: .85rem;
    line-height: 1.4rem;
    border: 1px solid rgba(255,255,255,.15);
    z-index: 100;
  }

  /* Responsive: on small screens stack sidebar and main under each other */
  @media (max-width: 900px) {
    .layout {
      flex-direction: column;
    }

    .sidebar,
    .main-panel {
      flex: none;
      width: 90%;
    }
  }

  @media (max-width: 640px) {
    .app {
      padding: 1rem;
    }
    .card {
      padding: 1rem 1rem 1.1rem;
    }
    .header {
      flex-direction: column;
      margin-bottom: 0;
    }
    .tooltip {
      max-width: 260px;
    }
  }

</style>
