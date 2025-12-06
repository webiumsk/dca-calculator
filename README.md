# 🟠 Bitcoin DCA Calculator  
A simple, privacy-friendly and fully client-side Bitcoin DCA (Dollar-Cost Averaging) calculator.  
No backend. No tracking. All price data is loaded from local CSV files or cached locally.

[DEMO](https://dca.dvadsatjeden.org)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Svelte](https://img.shields.io/badge/svelte-5.43.8-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-7.2.4-646cff.svg)

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
- Multilanguage support (EN / SK)  
- Export results to CSV  
- Share results to X, FB or copy the text  
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

### Updating the data

Setup a cron (once a day) to fetch the prices from Coingecko
```bash
wget -q -O /dev/null "https://YOUR_DOMAIN/update-prices.php
```
or
```bash
curl -fsS "https://YOUR_DOMAIN/update-prices.php" > /dev/null

```
Or run the script from your browser

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


## 👤 Author

**SiriusBig**
- GitHub: [@webiumsk](https://github.com/webiumsk)
- Website: [webium.sk](https://www.webium.sk)

---

### 🧡 Acknowledgements

Project inspired by the idea of helping newcomers understand long-term Bitcoin saving strategies.
- [CoinGecko API](https://www.coingecko.com/en/api) for BTC prices history
- [Dvadsatjeden](https://www.dvadsatjeden.org/) Bitcoin community for inspiration

## ⭐ Support

If you find this project useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔀 Contributing code
- ⚡ Donating to [sirius@dvadsatjeden.org](lightning:sirius@dvadsatjeden.org)

---

## 📄 Changelog

### v1.0.1 (6. Dec 2025)
- Removed Dark Mode theme toggle
- Added Sharing options
- Added PHP script for daily price updates via cron
- Added footer
- Small visual fixes

### v1.0.0 (5. Dec 2025)
- Brought to life 