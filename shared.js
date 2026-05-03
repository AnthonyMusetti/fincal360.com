// ============================================================
// SHARED.JS — nav, net worth widget, theme toggle, utilities
// ============================================================

// ── STORAGE ───────────────────────────────────────────────
const KEYS = {
  retirement: 'fin_retirement_v1',
  mortgage:   'fin_mortgage_v1',
  car:        'fin_car_v1',
  budget:     'fin_budget_v1',
  debt:       'fin_debt_v1',
  savings:    'fin_savings_v1',
  networth:   'fin_networth_v1',
  theme:      'fin_theme_v1',
};

function storeSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; }
  catch(e) { return false; }
}
function storeLoad(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
}

// ── THEME ─────────────────────────────────────────────────
function applyTheme(theme) {
  document.body.classList.toggle('theme-light', theme === 'light');

  function swapLogos() {
    var logoImgs = document.querySelectorAll('.site-logo, .footer-logo, .hero-logo, .mobile-drawer-logo');
    logoImgs.forEach(function(img) {
      if (theme === 'light') {
        img.src = img.src.indexOf('logo2') === -1 ? img.src.replace('logo.png', 'logo2.png') : img.src;
      } else {
        img.src = img.src.replace('logo2.png', 'logo.png');
      }
    });
  }

  // Run immediately for header logo (already in DOM)
  swapLogos();
  // Run again after footer and hero logos render
  setTimeout(swapLogos, 50);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'light'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light`;
  }
}

function toggleTheme() {
  const isLight = document.body.classList.contains('theme-light');
  const newTheme = isLight ? 'dark' : 'light';
  storeSave(KEYS.theme, newTheme);
  applyTheme(newTheme);
}

function loadTheme() {
  const saved = storeLoad(KEYS.theme);
  if (saved) applyTheme(saved);
}

// ── NET WORTH ─────────────────────────────────────────────
function updateNetWorth(updates) {
  const current = storeLoad(KEYS.networth) || {};
  storeSave(KEYS.networth, Object.assign({}, current, updates));
  renderNetWorthWidget();
}

function getNetWorthData() {
  return storeLoad(KEYS.networth) || {};
}

function renderNetWorthWidget() {
  const nw         = getNetWorthData();
  const homeEquity = Math.max(0, (nw.home_value||0) - (nw.home_mortgage_balance||0));
  const retPort    = nw.retirement_portfolio || 0;
  const savings    = nw.savings_total || 0;
  const totalAssets = homeEquity + retPort + savings;
  const totalLiab  = (nw.home_mortgage_balance||0) + (nw.car_balances_total||0) + (nw.other_debts_total||0) + (nw.revolving_total||0);
  const netWorth   = totalAssets - totalLiab;
  const isPos      = netWorth >= 0;

  const wv = document.getElementById('nw-widget-val');
  if (wv) {
    const hasData = totalAssets > 0 || totalLiab > 0;
    wv.textContent = hasData ? fS(netWorth) : '—';
    wv.className   = 'nw-value ' + (isPos ? 'pos' : 'neg');
  }

  const bd = document.getElementById('nw-breakdown');
  if (bd) {
    bd.innerHTML = `
      <div style="font-size:0.6rem;font-family:'DM Mono',monospace;color:var(--mut);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.75rem">Net Worth Breakdown</div>
      <div class="nw-row"><span class="nw-row-lbl">Home Equity</span><span class="nw-row-val pos">${fL(homeEquity)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl">Retirement Portfolio</span><span class="nw-row-val pos">${fL(retPort)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl">Savings</span><span class="nw-row-val pos">${fL(savings)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl" style="color:var(--red)">Mortgage</span><span class="nw-row-val neg">−${fL(nw.home_mortgage_balance||0)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl" style="color:var(--red)">Car Loans</span><span class="nw-row-val neg">−${fL(nw.car_balances_total||0)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl" style="color:var(--red)">Other Debt</span><span class="nw-row-val neg">−${fL((nw.other_debts_total||0)+(nw.revolving_total||0))}</span></div>
      <div class="nw-row"><span class="nw-row-lbl">Total Assets</span><span class="nw-row-val pos">${fL(totalAssets)}</span></div>
      <div class="nw-row"><span class="nw-row-lbl">Total Liabilities</span><span class="nw-row-val neg">−${fL(totalLiab)}</span></div>
      <div class="nw-row" style="border-top:1px solid var(--bdr2);margin-top:0.3rem">
        <span class="nw-row-lbl" style="color:var(--txt)">Net Worth</span>
        <span class="nw-row-val ${isPos?'pos':'neg'}">${fL(netWorth)}</span>
      </div>`;
  }
}

// ── SITE HEADER ───────────────────────────────────────────
function renderSiteHeader(activePage) {
  const mainTabs = [
    { id:'index',      label:'Home',       href:'index.html'      },
    { id:'paycheck',   label:'Income',     href:'paycheck.html'   },
    { id:'budget',     label:'Budget',     href:'budget.html'     },
    { id:'debt',       label:'Debt & DTI', href:'debt.html'       },
    { id:'savings',    label:'Savings',    href:'savings.html'    },
    { id:'retirement', label:'Retirement', href:'retirement.html' },
  ];

  const calcDropdown = [
    { id:'mortgage', label:'Mortgage',         href:'mortgage.html' },
    { id:'car',      label:'Auto Loan',         href:'car.html'      },
    { id:'loan',     label:'Loan Calculator',   href:'loan.html'     },
    { id:'rental',   label:'Rental Property',   href:'rental.html'   },

  ];

  const isCalcActive = calcDropdown.some(c => c.id === activePage);

  const nav = mainTabs.map(t =>
    `<a href="${t.href}" class="nav-tab ${t.id===activePage?'active':''}">${t.label}</a>`
  ).join('') + `
    <div class="nav-dropdown" id="nav-calc-dd">
      <button class="nav-tab nav-dd-btn ${isCalcActive?'active':''}" onclick="toggleNavDD(event)">
        Calculators
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:3px"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="nav-dd-menu" id="nav-dd-menu">
        ${calcDropdown.map(c => `<a href="${c.href}" class="nav-dd-item ${c.id===activePage?'active':''}">${c.label}</a>`).join('')}
      </div>
    </div>
    <a href="about.html" class="nav-tab ${activePage==='about'?'active':''}">About</a>`;

  document.body.insertAdjacentHTML('afterbegin', `
    <!-- Mobile drawer overlay -->
    <div class="mobile-drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
    <!-- Mobile drawer -->
    <div class="mobile-drawer" id="mobile-drawer">
      <div class="mobile-drawer-header">
        <img src="logo.png" alt="FinLit360" class="mobile-drawer-logo" id="drawer-logo">
        <button class="mobile-drawer-close" onclick="closeDrawer()">✕</button>
      </div>
      <nav class="mobile-drawer-nav">
        <div class="mobile-nav-section">Main</div>
        <a href="index.html" class="mobile-nav-link ${activePage==='index'?'active':''}">Home</a>
        <a href="paycheck.html" class="mobile-nav-link ${activePage==='paycheck'?'active':''}">Income</a>
        <a href="budget.html" class="mobile-nav-link ${activePage==='budget'?'active':''}">Budget</a>
        <a href="debt.html" class="mobile-nav-link ${activePage==='debt'?'active':''}">Debt & DTI</a>
        <a href="savings.html" class="mobile-nav-link ${activePage==='savings'?'active':''}">Savings</a>
        <a href="retirement.html" class="mobile-nav-link ${activePage==='retirement'?'active':''}">Retirement</a>
        <div class="mobile-nav-section" style="margin-top:0.5rem">Calculators</div>
        <a href="mortgage.html" class="mobile-nav-link ${activePage==='mortgage'?'active':''}">Mortgage</a>
        <a href="car.html" class="mobile-nav-link ${activePage==='car'?'active':''}">Auto Loan</a>
        <a href="loan.html" class="mobile-nav-link ${activePage==='loan'?'active':''}">Loan Calculator</a>
        <a href="rental.html" class="mobile-nav-link ${activePage==='rental'?'active':''}">Rental Property</a>
        <div class="mobile-nav-section" style="margin-top:0.5rem">More</div>
        <a href="about.html" class="mobile-nav-link ${activePage==='about'?'active':''}">About</a>
      </nav>
    </div>
    <div class="site-header">
      <div class="site-header-inner">
        <button class="nav-hamburger" id="nav-hamburger" onclick="toggleDrawer()" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <a href="index.html" class="site-logo-wrap">
          <img src="logo.png" alt="FinLit360" class="site-logo" id="site-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
          <span class="site-logo-fallback" style="display:none">FinLit360</span>
        </a>
        <nav class="site-nav">${nav}</nav>
        <div style="display:flex;align-items:center;gap:0.75rem">
          <button class="theme-toggle" id="theme-toggle-btn" onclick="toggleTheme()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            Light
          </button>
          <div style="position:relative">
            <div class="nw-widget" id="nw-widget" onclick="toggleNWBreakdown()">
              <div>
                <div class="nw-label">Net Worth</div>
                <div class="nw-value pos" id="nw-widget-val">—</div>
              </div>
            </div>
            <div class="nw-breakdown" id="nw-breakdown"></div>
          </div>
        </div>
      </div>
    </div>
  `);

  loadTheme();
  renderNetWorthWidget();

  // Inject footer after DOM content is loaded so it appears at page bottom
  function injectFooter() {
    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="site-footer-inner">
        <div class="footer-left">
          <img src="logo.png" alt="FinLit360" class="footer-logo" onerror="this.style.display='none'">
          <div class="footer-copy">
            &copy; ${new Date().getFullYear()} Musetti Consulting &mdash; All Rights Reserved<br>
            <a href="about.html" class="footer-link">About</a>
            &nbsp;&middot;&nbsp;
            <a href="about.html#disclaimer" class="footer-link">Disclaimer</a>
          </div>
        </div>
        <div class="footer-disclaimer">
          <strong>Not Financial Advice.</strong> FinLit360 is a free educational tool for informational purposes only.
          All calculations are illustrative. Nothing on this site constitutes financial, legal, or tax advice.
          Always consult a qualified professional before making financial decisions.
          <a href="about.html#disclaimer" class="footer-link">Full disclaimer &rarr;</a>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    // DOM already ready — defer slightly so page content renders first
    setTimeout(injectFooter, 0);
  }
}

function toggleDrawer() {
  const drawer  = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const burger  = document.getElementById('nav-hamburger');
  if (!drawer) return;
  const isOpen = drawer.classList.contains('open');
  drawer.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
  burger.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function closeDrawer() {
  const drawer  = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const burger  = document.getElementById('nav-hamburger');
  if (!drawer) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  burger.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleNavDD(e) {
  e.stopPropagation();
  const menu = document.getElementById('nav-dd-menu');
  if (menu) menu.classList.toggle('open');
}

function toggleNWBreakdown() {
  const bd = document.getElementById('nw-breakdown');
  if (bd) bd.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const bd   = document.getElementById('nw-breakdown');
  const wg   = document.getElementById('nw-widget');
  const menu = document.getElementById('nav-dd-menu');
  const dd   = document.getElementById('nav-calc-dd');
  if (bd && wg && !wg.contains(e.target)) bd.classList.remove('open');
  if (menu && dd && !dd.contains(e.target)) menu.classList.remove('open');
});

// ── SAVE BUTTON CONFIRM ───────────────────────────────────
function showSaveConfirm() {
  const btn = document.getElementById('save-btn');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved';
  btn.style.color = 'var(--grn)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
}

// ── FORMATTERS ────────────────────────────────────────────
function fS(n) {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e6) return s+'$'+(a/1e6).toFixed(1)+'M';
  if (a >= 1e3) return s+'$'+Math.round(a/1e3)+'K';
  return s+'$'+Math.round(a);
}
function fL(n) {
  return (n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString();
}
function fL2(n) {
  if (isNaN(n) || n === null || n === undefined) return '$0.00';
  return (n<0?'-':'')+'$'+Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
}
