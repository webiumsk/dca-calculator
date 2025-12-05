# 🟠 Bitcoin DCA Calculator  
A simple, privacy-friendly and fully client-side Bitcoin DCA (Dollar-Cost Averaging) calculator.  
No backend. No tracking. All price data is loaded from local CSV files or cached locally.

[DEMO](https://dca.dvadsatjeden.org)

---

## 🚀 Features

### 🔢 Core calculations
- Choose **time period** (last X years or custom date range)
- Choose **frequency**: daily, weekly, bi-weekly, monthly
- Set **amount per purchase** (EUR / USD)
- Automatic calculation of:
  - Total invested
  - Total accumulated BTC
  - Current value (based on last BTC price)
  - Profit / loss (absolute + %)

### 📈 Visualization
- SVG line chart (portfolio value vs invested)
- Responsive layout (desktop + mobile)

### 💡 DCA vs Lump Sum
- Optional comparison mode  
- Educational explanation of both strategies  
- Difference clearly displayed in fiat  
- Performance verdict: DCA better / Lump sum better / about equal  
- User preference is stored in **LocalStorage**

### 💾 Data handling
- BTC price history loaded from:
public/btc-history-eur.csv
public/btc-history-usd.csv
- CSV files can be updated manually or by a cron job
- Local caching of parsed CSV data

### 🌒 UI & UX
- Dark mode toggle  
- Multilanguage support (EN / SK)  
- Export results to CSV  
- Print / PDF export  
- Accessible and lightweight

---

## 🧱 Tech Stack

- **Svelte** (no SvelteKit)
- Plain **SVG** for charting (no charting libraries)
- Vanilla TypeScript
- No backend required  
- No external API calls by default

---

## 📦 Project Setup

### Install dependencies
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

---

### 📂 BTC Price Data

CSV format expected by the app:

date,price

2013-04-28 00:00:00 UTC,135.3

2013-04-29 00:00:00 UTC,141.96

### Columns:

    date — UTC date at midnight

    price — daily close price in EUR or USD

Files should be placed in:

public/btc-history-eur.csv

public/btc-history-usd.csv

If missing, the app will display an error when calculating.

---

### 🔐 Privacy

    100% client-side

    No analytics, no cookies

    No external network requests (unless user chooses to load updated CSV)

### 📜 License

MIT License

### 🤝 Contributing

Pull requests are welcome!
If you want to add features (e.g., more charts, additional currencies, languages), feel free to open an issue.

### 🧡 Acknowledgements

Project inspired by the idea of helping newcomers understand long-term Bitcoin saving strategies.
