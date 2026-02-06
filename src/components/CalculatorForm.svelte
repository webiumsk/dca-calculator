<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { translations } from "../i18n";
    import type { Frequency, Currency, DataPoint } from "../types";

    export let lang: "en" | "sk";
    export let periodMode: "years" | "custom";
    export let yearsBack: number;
    export let startDate: string;
    export let endDate: string;
    export let frequency: Frequency;
    export let amountPerPeriod: number;
    export let currency: Currency;
    export let isLoading: boolean;
    export let errorMessage: string | null;
    export let hasData: boolean;

    const dispatch = createEventDispatcher();

    function onCalculate() {
        dispatch("calculate");
    }
</script>

<section class="card sidebar">
    <div class="switcher">
        <button
            class:active={periodMode === "years"}
            on:click={() => (periodMode = "years")}
        >
            {translations[lang].lastYears}
        </button>

        <button
            class:active={periodMode === "custom"}
            on:click={() => (periodMode = "custom")}
        >
            {translations[lang].customRange}
        </button>
    </div>

    {#if periodMode === "years"}
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
        <button class="button" on:click|preventDefault={onCalculate}>
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
    {:else if !hasData}
        <p class="info">{translations[lang].noData}</p>
    {/if}
</section>

<style>
    /* Sidebar/card specific overrides if needed, but mostly global .card .switcher .field */

    .switcher.calculate {
        margin-top: 1rem;
    }

    .switcher.calculate .button {
        width: 100%;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff;
        padding: 0.6rem 0;
    }
</style>
