<script lang="ts">
    import { translations } from "../i18n";
    import type { DataPoint } from "../types";

    export let dataPoints: DataPoint[];
    export let lang: "en" | "sk";

    let investedPath = "";
    let valuePath = "";

    $: {
        const paths = buildChartPaths(dataPoints);
        investedPath = paths.investedPath;
        valuePath = paths.valuePath;
    }

    function buildChartPaths(points: DataPoint[]) {
        if (!points || points.length === 0) {
            return { investedPath: "", valuePath: "" };
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
            "M " +
            points
                .map((p, i) => `${xScale(xs[i])} ${yScale(p.invested)}`)
                .join(" L ");

        const valuePath =
            "M " +
            points
                .map((p, i) => `${xScale(xs[i])} ${yScale(p.value)}`)
                .join(" L ");

        return { investedPath, valuePath };
    }
</script>

<div class="chart-wrapper">
    <h2>{translations[lang].graphTitle}</h2>
    <svg viewBox="0 0 800 320" preserveAspectRatio="none" class="chart">
        <path d={investedPath} fill="none" stroke-width="2" />
        <path
            d={valuePath}
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

<style>
    .chart-wrapper {
        width: 100%;
    }

    h2 {
        margin-top: 0.5rem;
        margin-bottom: 0.75rem;
        font-size: 1.1rem;
    }

    .chart {
        width: 100%;
        height: 260px;
        border-radius: 0.75rem;
        background: radial-gradient(
                circle at top,
                rgba(56, 189, 248, 0.08),
                transparent
            ),
            radial-gradient(
                circle at bottom,
                rgba(94, 234, 212, 0.08),
                transparent
            ),
            rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(148, 163, 184, 0.5);
    }

    :global(html:not(.dark)) .chart {
        background: #f9fafb;
    }

    .chart path:first-child {
        stroke: #38bdf8;
    }

    .chart path:last-child {
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
</style>
