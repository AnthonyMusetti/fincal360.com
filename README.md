# FinLit360.com

**A 360° View of Your Finances**

A comprehensive personal finance suite built as a fully static web app. No backend, no accounts, no data collection. Everything runs in your browser and stays there.

Live at [finlit360.com](https://finlit360.com)

---

## What's Inside

| Tool | Description |
|---|---|
| **Income** | Paycheck calculator with federal/state taxes, benefits, 1099/SE, pay schedule, and raise simulator |
| **Budget** | Bill tracker with paycheck assignment, E&S feeder accounts, and per-paycheck breakdown |
| **Debt & DTI** | Installment and revolving debt tracking, DTI analysis, avalanche/snowball/minimums payoff strategies |
| **Savings** | Multi-account tracker with projection table and growth charts |
| **Retirement** | Multi-phase 401k planner with inheritance injection, sequence risk toggle, and year-by-year table |
| **Mortgage** | Full amortization with PMI, property tax, insurance, HOA, extra payments, and donut/bar charts |
| **Auto Loan** | Total price and monthly payment modes with trade-in, tax, fees, and negative equity handling |
| **Loan Calculator** | Generic loan with origination fees, extra payments, and effective APR |
| **Rental Property** | Cap rate, CoC, IRR, MIRR, MOIC, DSCR, depreciation, passive loss tax modeling, IRR sensitivity table |

---

## Architecture

- **100% static** — HTML, CSS, vanilla JavaScript. No frameworks, no build step.
- **localStorage** — all user data lives in the browser. Nothing is ever sent anywhere.
- **Flat file structure** — all files in root, deployed directly via Cloudflare Pages.
- **Shared infrastructure** — `shared.js` handles nav, net worth widget, theme toggle, and formatters. `shared.css` handles all styling including full mobile responsive layout.

### File Map

```
shared.js          — nav, net worth widget, theme, storage utilities, footer
shared.css         — all styles, dark/light themes, mobile responsive
index.html         — home dashboard, net worth overview, data backup/restore
paycheck.html      — income calculator
budget.html        — budget planner
debt.html          — debt & DTI
savings.html       — savings tracker
retirement.html    — retirement planner
mortgage.html      — mortgage calculator
car.html           — auto loan calculator
loan.html          — loan calculator
rental.html        — rental property analyzer
about.html         — about, disclaimer
logo.png           — dark mode logo
logo2.png          — light mode logo
headshot.jpg       — about page photo
```

### localStorage Keys

```
fin_retirement_v1    fin_mortgage_v1    fin_car_v1
fin_budget_v1        fin_debt_v1        fin_savings_v1
fin_networth_v1      fin_theme_v1       fin_paycheck_v1
fin_loan_v1          fin_rental_v1      fin_mortgage_export
fin_income_export
```

---

## Cross-Tool Data Flow

- **Income → Budget:** Fill out earnings in the Income tab, click "Send to Budget" from the Pay Schedule tab. Then click "Import from Income" in Budget. Writes to `fin_income_export`.
- **Income → Debt & DTI:** Same — click "Import from Income" in the Debt & DTI income panel.
- **Mortgage → Debt & DTI:** Click "Send to Debt Tab" in the Mortgage calculator, then "Import Mortgage" in Debt & DTI. Writes to `fin_mortgage_export`.
- **All calculators → Net Worth widget:** Each calculator calls `updateNetWorth()` on save, feeding the persistent top-right widget.
- **Master export:** The home page exports all calculator data to a single `.xlsx` and restores from the same file.

---

## Features

- Dark and light themes (persisted, toggled from nav)
- Fully mobile responsive with slide-out drawer nav
- PDF export on all calculators
- XLS template download and upload on Budget and Debt
- Master data export/restore (SheetJS) on the home page
- Net worth breakdown widget in every page header
- No ads, no tracking, no sign-up

---

## Local Development

No build step required. Just serve the files from a local server to avoid CORS issues with localStorage across file:// paths:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

---

## Deployment

Deployed via [Cloudflare Pages](https://pages.cloudflare.com) with direct GitHub integration. Pushes to `main` deploy automatically.

---

## Disclaimer

FinLit360 is for educational and informational purposes only. Nothing on this site constitutes financial, legal, or tax advice. Always consult a qualified professional before making financial decisions. [Full disclaimer](https://finlit360.com/about.html#disclaimer).

---

Built by [Tony Musetti](https://finlit360.com/about.html) · [Musetti Consulting](mailto:tony@musetti.tech)
