export type Frequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
export type Currency = 'eur' | 'usd';

export interface DataPoint {
  date: string;          // ISO string for display
  invested: number;      // cumulative invested fiat
  value: number;         // portfolio value in fiat at that time
}

export interface BtcPricePoint {
  timestamp: number; // ms since epoch
  price: number;
}

export interface CacheEntry {
  currency: Currency;
  timestamp: number;        // ms since epoch when stored
  prices: BtcPricePoint[];  // full price history for that currency
}
