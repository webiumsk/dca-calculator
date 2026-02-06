<script lang="ts">
    import { translations } from "../i18n";
    import type { Currency } from "../types";

    export let lang: "en" | "sk";
    export let currency: Currency;
    export let totalInvested: number;
    export let currentValue: number;
    export let totalBtc: number;
    export let profit: number;
    export let profitPercent: number;

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
</script>

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

<style>
    .stats-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-sm);
        margin-bottom: var(--space-sm);
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

    .stat span:first-child {
        font-size: 0.8rem;
    }
    .stat span:last-child {
        font-size: 1.05rem;
    }
</style>
