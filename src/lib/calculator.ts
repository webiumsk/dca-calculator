import type { BtcPricePoint, DataPoint, Frequency } from '../types';

export interface CalculationResult {
    dataPoints: DataPoint[];
    totalInvested: number;
    totalBtc: number;
    lumpSumBtc: number;
}

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

export function calculateDCA(
    start: Date,
    end: Date,
    frequency: Frequency,
    amountPerPeriod: number,
    prices: BtcPricePoint[]
): CalculationResult {
    // Normalize times to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start >= end) {
        throw new Error('Start date must be before end date');
    }

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

    return {
        dataPoints: points,
        totalInvested: cumulativeInvested,
        totalBtc: cumulativeBtc,
        lumpSumBtc
    };
}
