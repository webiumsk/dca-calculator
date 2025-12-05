#!/usr/bin/env python3
import os
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf

# Paths to your CSV files (adjust paths as needed)
WEB_ROOT = "/var/www/dca.dvadsatjeden.org/public"  # <-- uprav podľa seba
USD_CSV = os.path.join(WEB_ROOT, "btc-history-usd.csv")
EUR_CSV = os.path.join(WEB_ROOT, "btc-history-eur.csv")


def load_last_date(csv_path: str) -> datetime | None:
    """Return the last date in snapped_at column as datetime.date, or None if file doesn't exist."""
    if not os.path.exists(csv_path):
        return None

    df = pd.read_csv(csv_path)
    if df.empty:
        return None

    # snapped_at format: "YYYY-MM-DD 00:00:00 UTC"
    df["date"] = pd.to_datetime(df["snapped_at"].str.replace(" UTC", ""), utc=True)
    last_ts = df["date"].max()
    return last_ts.date()


def download_new_prices(symbol: str, start_date: datetime.date) -> pd.DataFrame:
    """
    Download daily prices from Yahoo Finance from start_date to today (inclusive).
    Returns DataFrame with columns snapped_at, price.
    """
    # yfinance uses end as *exclusive*, so add 1 day
    today = datetime.utcnow().date()
    if start_date > today:
        # Nothing to download
        return pd.DataFrame(columns=["snapped_at", "price"])

    # yfinance Date -> index, with columns: Open, High, Low, Close, Adj Close, Volume
    df = yf.download(
        symbol,
        start=start_date.strftime("%Y-%m-%d"),
        end=(today + timedelta(days=1)).strftime("%Y-%m-%d"),
        interval="1d",
    )

    if df.empty:
        return pd.DataFrame(columns=["snapped_at", "price"])

    df = df[["Close"]].reset_index()  # keep Date + Close

    # Ensure Date is datetime
    df["Date"] = pd.to_datetime(df["Date"])

    # Build snapped_at in required format
    df["snapped_at"] = df["Date"].dt.strftime("%Y-%m-%d 00:00:00 UTC")

    out = df[["snapped_at", "Close"]].rename(columns={"Close": "price"})
    return out


def update_csv(symbol: str, csv_path: str):
    """Update one CSV (USD or EUR) with new data from Yahoo Finance."""
    print(f"Updating {symbol} -> {csv_path}")

    last_date = load_last_date(csv_path)
    today = datetime.utcnow().date()

    if last_date is None:
        # If CSV doesn't exist, download from 2013-01-01
        start_date = datetime(2013, 1, 1).date()
    else:
        # Start from next day after last_date
        start_date = last_date + timedelta(days=1)

    if start_date > today:
        print("  No new days to fetch.")
        return

    new_data = download_new_prices(symbol, start_date)
    if new_data.empty:
        print("  No new data returned from Yahoo.")
        return

    # Append to existing CSV or create new
    if os.path.exists(csv_path):
        old = pd.read_csv(csv_path)
        combined = pd.concat([old, new_data], ignore_index=True)
    else:
        combined = new_data

    # Drop potential duplicates by snapped_at (in case of overlap)
    combined = combined.drop_duplicates(subset=["snapped_at"]).sort_values("snapped_at")

    combined.to_csv(csv_path, index=False)
    print(f"  Added {len(new_data)} new rows. Total rows: {len(combined)}")


def main():
    # BTC-USD
    update_csv("BTC-USD", USD_CSV)
    # BTC-EUR
    update_csv("BTC-EUR", EUR_CSV)


if __name__ == "__main__":
    main()
