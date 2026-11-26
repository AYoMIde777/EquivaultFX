import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Mail,
  Star,
} from 'lucide-react';
import heroBg from '../assets/hero-bg.gif';
import BrandLogo from '../components/BrandLogo';
import TradingViewTicker from '../components/TradingViewTicker';
import TradingViewOverview from '../components/TradingViewOverview';

const PLANS = [
  {
    name: 'Core Liquidity',
    badge: 'Standard Access',
    roi: '1.8% Daily',
    duration: '14 Days',
    min: '$250',
    max: '$4,999',
    payout: '24/7 Instant Crypto',
    featured: false,
  },
  {
    name: 'Prime ECN',
    badge: 'Most Selected',
    roi: '2.6% Daily',
    duration: '21 Days',
    min: '$5,000',
    max: '$24,999',
    payout: 'Priority Automated',
    featured: true,
  },
  {
    name: 'Institutional Desk',
    badge: 'VIP Execution',
    roi: '3.5% Daily',
    duration: '30 Days',
    min: '$25,000',
    max: '$250,000',
    payout: 'Dedicated Liquidity',
    featured: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Daniel Franklin',
    role: 'FX & Gold Swing Trader • Texas',
    rating: 5,
    quote:
      'Execution on XAU/USD during New York session opens is tight and dependable, and my settlement tracking stays clear from entry to payout.',
    metric: '+18.4% Avg Monthly ROI',
  },
  {
    name: 'Elena Rostova',
    role: 'Quantitative Crypto Allocator • London',
    rating: 5,
    quote:
      'Having live multi-asset charts, clear 5% BTC/ETH deposit gas routing, and structured liquidity tiers in one terminal keeps my workflow streamlined.',
    metric: '$42,000 Managed Tier',
  },
  {
    name: 'Marcus Vance',
    role: 'Indices & Commodities Trader • Dubai',
    rating: 5,
    quote:
      'Switching between live candles, position management, and wallet transfers feels fast and uncluttered—even when checking trades on my phone.',
    metric: '0.0 Pip Raw Spread',
  },
  {
    name: 'Tunde Adeyemi',
    role: 'Multi-Asset Day Trader • Lagos',
    rating: 4.8,
    quote:
      'No mandatory KYC friction to get started, responsive support at info@equivaultfx.com, and straightforward fee visibility before I confirm any transfer.',
    metric: '24/7 Active Execution',
  },
];

const FAQS = [
  {
    q: 'How do deposits and the 5% deposit gas fee work on EquivaultFX?',
    a: 'When funding your account, you send your main deposit amount to the selected deposit wallet and send a separate 5% gas fee in BTC (bc1q3yh6qpja5p05jghul86myefmtgssxegp0e6424) or ETH (0x442649Bec5815563722154d5EEDE79cCCA98aF67) to the designated fee address.',
  },
  {
    q: 'Why is the 5% deposit gas fee sent separately in BTC or ETH?',
    a: 'Separating the 5% gas fee into dedicated BTC or ETH routing keeps your main deposit allocation clean while covering settlement and network fee handling.',
  },
  {
    q: 'How fast are crypto deposits and withdrawals processed?',
    a: 'Once your main deposit and separate 5% BTC/ETH gas transfer are submitted and confirmed, deposits credit to your balance upon verification. Approved withdrawals are dispatched to your receiving address within 15 to 60 minutes.',
  },
  {
    q: 'Is KYC required to trade, deposit, or withdraw?',
    a: 'No. KYC is optional on EquivaultFX—you can trade, deposit, and submit withdrawals without mandatory identity verification.',
  },
  {
    q: 'Which markets can I monitor and trade?',
    a: 'EquivaultFX provides live institutional feeds across major and minor Forex pairs, Cryptocurrencies, Global Stock Indices, and Spot Metals & Energy Commodities.',
  },
  {
    q: 'Does the trading dashboard work smoothly on mobile devices?',
    a: 'Yes. On mobile screens, the dashboard sidebar collapses into a clean slide-out drawer opened via the top hamburger button, keeping charts, order tickets, and wallet actions easy to reach.',
  },
  {
    q: 'How is my account and withdrawal activity secured?',
    a: 'Accounts use password strength validation, encrypted sessions, an optional 4-digit withdrawal security PIN, and role-isolated database access.',
  },
];

export default function PublicSite() {
  const [calcAmount, setCalcAmount] = useState(2500);
  const [calcPlanIdx, setCalcPlanIdx] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);

  const rates = [0.018, 0.026, 0.035];
  const days = [14, 21, 30];
  const dailyReturn = (Number(calcAmount) || 0) * rates[calcPlanIdx];
  const totalReturn = dailyReturn * days[calcPlanIdx];
  const depositGasPreview = (Number(calcAmount) || 0) * 0.05;

  return (
    <div className="public-wrapper">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-mark-link">
            <BrandLogo />
          </Link>

          <nav className="nav-links">
            <a href="#about">About</a>
            <a href="#markets">Live Markets</a>
            <a href="#plans">Liquidity Plans</a>
            <a href="#security">Security</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
            <a href="#support-legal">Support</a>
          </nav>

          <div className="nav-actions">
            <Link to="/auth" className="btn btn-outline btn-sm">
              Log In
            </Link>
            <Link to="/auth?mode=signup" className="btn btn-crimson btn-sm">
              Open Account
            </Link>
          </div>
        </div>
      </header>

      <TradingViewTicker />

      <section className="hero-section">
        <img
          src={heroBg}
          alt="EquivaultFX market backdrop"
          className="hero-gif-bg"
        />
        <div className="hero-overlay" />

        <div className="hero-container">
          <div>
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              <span>Direct Multi-Asset Liquidity &amp; Live Execution</span>
            </div>

            <h1 className="hero-title">
              Precision Execution Across Forex, Crypto &amp; Global Indices.
            </h1>

            <p className="hero-subtitle">
              EquivaultFX combines real-time institutional market feeds,
              managed liquidity allocations, and cold-storage crypto settlement
              inside a unified trading terminal.
            </p>

            <div className="hero-cta-row">
              <Link to="/auth?mode=signup" className="btn btn-crimson">
                Start Trading Now <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="btn btn-white">
                Launch Live Terminal
              </Link>
            </div>

            <div className="hero-stats tabular">
              <div>
                <div className="hero-stat-val">0.0 Pips</div>
                <div className="hero-stat-label">Raw ECN Spreads</div>
              </div>
              <div>
                <div className="hero-stat-val">5% Gas</div>
                <div className="hero-stat-label">Separate BTC / ETH Fee</div>
              </div>
              <div>
                <div className="hero-stat-val">24 / 7</div>
                <div className="hero-stat-label">USDT &amp; BTC Settlement</div>
              </div>
            </div>
          </div>

          <div className="hero-spotlight-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '15px' }}>
                Live Market Pulse
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.14)',
                  padding: '3px 9px',
                  borderRadius: '999px',
                }}
              >
                ● FEED ACTIVE
              </span>
            </div>
            <TradingViewOverview height={340} />
          </div>
        </div>
      </section>

      <section id="about" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">About EquivaultFX</div>
            <h2 className="section-title">
              Built for Structured Liquidity &amp; Direct Market Access
            </h2>
          </div>
          <Link to="/auth?mode=signup" className="btn btn-crimson btn-sm">
            Create Account <ArrowRight size={15} />
          </Link>
        </div>

        <div className="panel-card">
          <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            <strong>EquivaultFX</strong> is a multi-asset trading and capital
            allocation platform designed for traders who want real-time market
            visibility, structured liquidity tiers, and transparent crypto
            settlement in a single workspace.
          </p>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            From monitoring live Forex pairs, cryptocurrencies, global indices, and
            spot gold to managing open positions and tracking deposit or withdrawal
            gas fees, every workflow is organized for clarity and speed.
          </p>

          <div className="hero-stats tabular" style={{ marginTop: 0 }}>
            <div>
              <div className="hero-stat-val">4.9 / 5.0</div>
              <div className="hero-stat-label">Average Trader Rating</div>
            </div>
            <div>
              <div className="hero-stat-val">Multi-Asset</div>
              <div className="hero-stat-label">Forex, Crypto, Indices &amp; Gold</div>
            </div>
            <div>
              <div className="hero-stat-val">24 / 7</div>
              <div className="hero-stat-label">Terminal &amp; Support Access</div>
            </div>
          </div>
        </div>
      </section>

      <section id="markets" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Real-Time Data</div>
            <h2 className="section-title">
              Forex, Crypto, Indices &amp; Commodities
            </h2>
          </div>
          <Link to="/dashboard" className="btn btn-outline btn-sm">
            Open Full Candlestick Chart <ArrowRight size={15} />
          </Link>
        </div>

        <TradingViewOverview height={480} />
      </section>

      <section id="plans" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Capital Allocation</div>
            <h2 className="section-title">Managed Liquidity Tiers</h2>
          </div>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`plan-card ${plan.featured ? 'featured' : ''}`}
            >
              <div>
                <span className="plan-badge">{plan.badge}</span>
                <h3>{plan.name}</h3>
                <div className="plan-roi tabular">{plan.roi}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Cycle Duration: {plan.duration}
                </div>

                <ul className="plan-list tabular">
                  <li>
                    <span>Minimum Deposit</span>
                    <strong>{plan.min}</strong>
                  </li>
                  <li>
                    <span>Maximum Allocation</span>
                    <strong>{plan.max}</strong>
                  </li>
                  <li>
                    <span>Deposit Gas Fee</span>
                    <strong>5% (BTC / ETH)</strong>
                  </li>
                </ul>
              </div>

              <Link
                to="/auth?mode=signup"
                className={`btn ${plan.featured ? 'btn-crimson' : 'btn-white'}`}
                style={{ width: '100%' }}
              >
                Select {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="roi-box">
          <div>
            <label className="form-label">Select Liquidity Tier</label>
            <select
              className="form-control"
              value={calcPlanIdx}
              onChange={(e) => setCalcPlanIdx(Number(e.target.value))}
            >
              {PLANS.map((p, idx) => (
                <option key={p.name} value={idx}>
                  {p.name} ({p.roi})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Allocation Amount (USD)</label>
            <input
              type="number"
              className="form-control tabular"
              min="250"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
            />
          </div>

          <div
            style={{
              background: 'var(--bg-input)',
              padding: '16px 20px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Estimated Cycle Return ({days[calcPlanIdx]} Days)
            </div>
            <div
              className="tabular"
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--surface-white)',
                marginTop: '4px',
              }}
            >
              ${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--positive)' }}>
              +${dailyReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} / day
            </div>
            <div className="tabular" style={{ fontSize: '11.5px', color: '#fda4af', marginTop: '4px' }}>
              Separate 5% Deposit Gas: ${depositGasPreview.toFixed(2)} (BTC or ETH)
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Infrastructure</div>
            <h2 className="section-title">Custody &amp; Account Protection</h2>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Multi-Sig Cold Custody</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Client digital reserves are segregated in offline multi-signature
              vaults with automated hot-wallet sweeps.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Lock size={20} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>5% BTC / ETH Fee Routing</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Deposit gas fees (5%) are sent separately to dedicated BTC or ETH
              fee wallets so funding records stay clear and traceable.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={20} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Frictionless Access</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Trade, deposit, and request withdrawals without mandatory KYC
              bottlenecks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Globe size={20} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Direct Tier-1 Feeds</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Real-time market pricing streamed directly from institutional
              liquidity bridges without dealing-desk delays.
            </p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Verified Traders</div>
            <h2 className="section-title">Trader Ratings &amp; Testimonials</h2>
          </div>
          <div className="plan-badge tabular" style={{ marginBottom: 0 }}>
            ★ 4.9 / 5 Rating (148 Reviews)
          </div>
        </div>

        <div className="plans-grid">
          {TESTIMONIALS.map((item) => {
            const filledStars = Math.round(item.rating);
            return (
              <div key={item.name} className="plan-card">
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <span className="plan-badge" style={{ marginBottom: 0 }}>
                      {item.metric}
                    </span>
                    <span
                      className="tabular"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#FBBF24',
                      }}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < filledStars ? '#FBBF24' : 'transparent'}
                          color="#FBBF24"
                        />
                      ))}
                      <span>{item.rating.toFixed(1)}</span>
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      margin: '12px 0 18px',
                    }}
                  >
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      color: 'var(--surface-white)',
                    }}
                  >
                    {item.name}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {item.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="faq" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Support</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="faq-list">
          {FAQS.map((item, idx) => (
            <div
              key={item.q}
              className="faq-item"
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
            >
              <div className="faq-q">
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              {openFaq === idx && <p className="faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer id="support-legal" className="site-legal-footer">
        <div className="site-footer-inner">
          <div className="site-footer-top">
            <div>
              <strong style={{ color: 'var(--surface-white)' }}>
                EquivaultFX Client Support
              </strong>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                24/7 assistance for account onboarding, deposits, 5% BTC/ETH gas fee transfers, and withdrawals.
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <a
                href="mailto:info@equivaultfx.com"
                className="btn btn-outline btn-sm"
              >
                <Mail size={14} /> info@equivaultfx.com
              </a>
              <Link to="/auth" className="btn btn-crimson btn-sm">
                <LifeBuoy size={14} /> Client Portal
              </Link>
            </div>
          </div>

          <div className="site-footer-block">
            <strong>Deposit &amp; Gas Fee Notice:</strong> Deposits require a
            separate 5% gas fee sent in BTC (<span className="tabular">bc1q3yh6qpja5p05jghul86myefmtgssxegp0e6424</span>) or ETH (<span className="tabular">0x442649Bec5815563722154d5EEDE79cCCA98aF67</span>) alongside the selected deposit transfer. Always verify receiving addresses and networks before sending funds.
          </div>

          <div className="site-footer-block">
            <strong>Legal &amp; Terms:</strong> EquivaultFX provides market data,
            liquidity allocation interfaces, and account tools subject to our
            Client Agreement, Terms of Service, and Privacy Policy. By using this
            website, you agree to comply with applicable laws and platform terms.
          </div>

          <div className="site-footer-block">
            <strong>Risk Warning:</strong> Trading leveraged Forex, CFDs, indices,
            and digital assets carries a high level of risk to your capital and may
            not be suitable for all investors. Market volatility can result in rapid
            losses, and projected or historical figures do not guarantee future
            performance. Only trade with funds you can afford to lose.
          </div>

          <div className="site-footer-block">
            <strong>Jurisdiction Notice:</strong> Information and services on this
            site are not directed to residents of jurisdictions where trading or
            accessing such services would be contrary to local law or regulation.
          </div>

          <div className="site-footer-bottom">
            <span>Copyright © 2026 EquivaultFX — All Rights Reserved.</span>
            <div className="site-footer-links">
              <a href="#about" className="site-footer-link">About</a>
              <a href="#markets" className="site-footer-link">Markets</a>
              <a href="#plans" className="site-footer-link">Plans</a>
              <Link to="/auth" className="site-footer-link">Log In</Link>
              <Link to="/auth?mode=signup" className="site-footer-link">Open Account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}