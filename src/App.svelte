<script lang="ts">
  import { onMount } from "svelte";
  import Footer from "./components/Footer.svelte";

  import { translations } from "./i18n";
  import type {
    Frequency,
    Currency,
    DataPoint,
    BtcPricePoint,
    CacheEntry,
  } from "./types";
  import { fetchBtcHistory } from "./lib/btc";
  import { calculateDCA } from "./lib/calculator";

  import CalculatorForm from "./components/CalculatorForm.svelte";
  import Summary from "./components/Summary.svelte";
  import Chart from "./components/Chart.svelte";

  const SHOW_LUMP_SUM_KEY = "dca_show_lump_sum";

  // State
  let lang: "en" | "sk" = "en";
  let showTooltip = false;

  let frequency: Frequency = "monthly";
  let amountPerPeriod = 100;
  let currency: Currency = "eur";

  let periodMode: "years" | "custom" = "years";
  let yearsBack = 5;

  let startDate: string = "";
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
  let lumpSumMessage = "";
  let lumpSumValue = 0;

  let dataPoints: DataPoint[] = [];

  let settingsLoaded = false;

  // Share panel state
  let showSharePanel = false;
  let shareCopied = false;

  // Helper: format currency nicely
  function formatFiat(value: number): string {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString(
      lang === "sk" ? "sk-SK" : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );

    const prefix = currency === "usd" ? "$ " : "";
    const suffix = currency === "eur" ? " €" : "";

    return (value < 0 ? "-" : "") + prefix + formatted + suffix;
  }

  function formatBtc(value: number): string {
    return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  }

  // CSV export
  function exportCsv() {
    if (!dataPoints.length) return;

    const header = ["date", "invested", "value"];
    const rows = dataPoints.map((p) => [
      p.date,
      p.invested.toFixed(2),
      p.value.toFixed(2),
    ]);

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dca-results.csv";
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
      // 1. Fetch prices
      const prices = await fetchBtcHistory(currency);

      // 2. Determine dates
      const end = new Date(endDate || new Date().toISOString().slice(0, 10));
      let start: Date;

      if (periodMode === "years") {
        const s = new Date(end.getTime());
        s.setFullYear(s.getFullYear() - yearsBack);
        start = s;
      } else {
        if (!startDate) {
          throw new Error("Start date is required for custom range");
        }
        start = new Date(startDate);
      }

      // 3. Calculate
      const result = calculateDCA(
        start,
        end,
        frequency,
        amountPerPeriod,
        prices,
      );

      // 4. Update state variables
      totalInvested = result.totalInvested;
      totalBtc = result.totalBtc;
      dataPoints = result.dataPoints;

      const lastPrice = prices[prices.length - 1].price;
      currentValue = totalBtc * lastPrice;
      profit = currentValue - totalInvested;
      profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      // Lump sum
      const lumpSumBtc = result.lumpSumBtc;
      lumpSumValue = lumpSumBtc * lastPrice;
      lumpSumDifference = lumpSumValue - currentValue;

      if (Math.abs(lumpSumDifference) < currentValue * 0.01) {
        lumpSumMessage = translations[lang].equalPerf;
      } else if (lumpSumDifference > 0) {
        lumpSumMessage = translations[lang].lumpSumWins;
      } else {
        lumpSumMessage = translations[lang].dcaWins;
      }
    } catch (err: any) {
      console.error(err);
      errorMessage = err?.message || "Unknown error";
    } finally {
      isLoading = false;
    }
  }

  // Helper: describe period for share text
  function getPeriodText(): string {
    if (periodMode === "years") {
      if (lang === "sk") {
        return `za posledných ${yearsBack} rokov`;
      } else {
        return `for the last ${yearsBack} years`;
      }
    } else {
      const from = startDate || "?";
      const to = endDate || "?";
      if (lang === "sk") {
        return `od ${from} do ${to}`;
      } else {
        return `from ${from} to ${to}`;
      }
    }
  }

  // Helper: describe frequency for share text
  function getFrequencyText(): string {
    if (lang === "sk") {
      if (frequency === "daily") return "každý deň";
      if (frequency === "weekly") return "každý týždeň";
      if (frequency === "bi-weekly") return "každé 2 týždne";
      return "každý mesiac";
    } else {
      if (frequency === "daily") return "every day";
      if (frequency === "weekly") return "every week";
      if (frequency === "bi-weekly") return "every 2 weeks";
      return "every month";
    }
  }

  // Build share text based on current state
  function getShareText(): string {
    if (!dataPoints.length) return "";

    const periodText = getPeriodText();
    const freqText = getFrequencyText();
    const amountText = `${amountPerPeriod} ${currency === "eur" ? "EUR" : "USD"}`;
    const profitText = formatFiat(profit);
    const profitPct = profitPercent.toFixed(1);

    if (lang === "sk") {
      const direction = profit >= 0 ? "v pluse" : "v mínuse";
      return `Ak by som ${periodText} sporil ${freqText} ${amountText} do Bitcoinu, dnes by som bol ${direction} ${profitText} (${profitPct} %).`;
    } else {
      const direction = profit >= 0 ? "up" : "down";
      return `If I had stacked ${amountText} into Bitcoin ${freqText} ${periodText}, today I would be ${direction} ${profitText} (${profitPct} %).`;
    }
  }

  function getCurrentUrl(): string {
    if (typeof window === "undefined") return "https://dca.dvadsatjeden.org";
    return window.location.href;
  }

  // Open X / Twitter
  function shareToX() {
    const text = getShareText();
    if (!text) return;
    const url = encodeURIComponent(getCurrentUrl());
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  // Open Facebook
  function shareToFacebook() {
    const text = getShareText();
    if (!text) return;
    const url = encodeURIComponent(getCurrentUrl());
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  // Copy to clipboard
  async function copyShareText() {
    const text = getShareText();
    if (!text || typeof navigator === "undefined" || !navigator.clipboard)
      return;

    const full = `${text} ${getCurrentUrl()}`;
    try {
      await navigator.clipboard.writeText(full);
      shareCopied = true;
      setTimeout(() => (shareCopied = false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
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

<div class="app">
  <main class="container">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1>{translations[lang].title}</h1>
          <p class="subtitle">
            {translations[lang].description}
            <button
              class="hover-term"
              on:mouseenter={() => (showTooltip = true)}
              on:mouseleave={() => (showTooltip = false)}
              on:click={() => (showTooltip = !showTooltip)}
              >DCA <span class="info-icon">ⓘ</span></button
            >
          </p>
          {#if showTooltip}
            <div class="tooltip">
              {translations[lang].dcaTooltip}
            </div>
          {/if}
        </div>

        <div class="header-right">
          <div class="switcher" role="tablist">
            <button
              class:active={lang === "sk"}
              on:click={() => (lang = "sk")}
              aria-label="Slovenčina"
              role="tab"
              aria-selected={lang === "sk"}
            >
              SK
            </button>
            <button
              class:active={lang === "en"}
              on:click={() => (lang = "en")}
              aria-label="English"
              role="tab"
              aria-selected={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="layout">
      <!-- LEFT 1/4 - sidebar with form -->
      <div class="sidebar-wrapper">
        <CalculatorForm
          {lang}
          bind:periodMode
          bind:yearsBack
          bind:startDate
          bind:endDate
          bind:frequency
          bind:amountPerPeriod
          bind:currency
          {isLoading}
          {errorMessage}
          hasData={dataPoints.length > 0}
          on:calculate={calculate}
        />
      </div>

      <!-- RIGHT 3/4 – results -->

      <section class="card main-panel">
        <!-- TOP HALF: 2x2 stats -->
        <Summary
          {lang}
          {currency}
          {totalInvested}
          {currentValue}
          {totalBtc}
          {profit}
          {profitPercent}
        />

        <!-- BOTTOM FULL-WIDTH: everything else (lump sum, chart, exports) -->
        <Chart {dataPoints} {lang} />

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
              {lang === "sk" ? "Zdieľať" : "Share"}
            </button>
          </div>

          {#if showSharePanel}
            <div class="share-panel">
              <p class="share-title">
                {lang === "sk" ? "Zdieľaj svoj výsledok" : "Share your result"}
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
                <button
                  class="btn share-fb"
                  type="button"
                  on:click={shareToFacebook}
                >
                  Facebook
                </button>
                <button class="btn" type="button" on:click={copyShareText}>
                  {#if shareCopied}
                    {lang === "sk" ? "Skopírované ✅" : "Copied ✅"}
                  {:else}
                    {lang === "sk" ? "Kopírovať text" : "Copy text"}
                  {/if}
                </button>
                <button class="btn" type="button" on:click={toggleSharePanel}>
                  {lang === "sk" ? "Zavrieť" : "Close"}
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
  /* Layout */
  .layout {
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .sidebar-wrapper {
    flex: 1;
  }

  .main-panel {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .container {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* Header */
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

  /* Lump Sum */
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

  /* Export / Share */
  .export {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
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

  /* Tooltip */
  .hover-term {
    font-weight: 800;
    cursor: help;
    position: relative;
    background: transparent;
    padding: 2px;
    color: #fff;
    border: none;
  }

  .tooltip {
    position: absolute;
    background: #1f2937;
    padding: 0.75rem;
    border-radius: 0.5rem;
    max-width: 600px;
    font-size: 0.85rem;
    line-height: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 100;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .layout {
      flex-direction: column;
    }

    .sidebar-wrapper,
    .main-panel {
      flex: none;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .header {
      flex-direction: column;
      margin-bottom: 0;
    }
    .tooltip {
      max-width: 260px;
    }
  }
</style>
