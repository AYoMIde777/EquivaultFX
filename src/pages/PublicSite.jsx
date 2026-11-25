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
} from 'lucide-react';
import efxLogo from '../assets/EFX logo.jpg';
import heroBg from '../assets/hero-bg.gif';
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

const FAQS = [
  {
    q: 'How fast are crypto deposits and withdrawals processed on EquivaultFX?',
    a: 'USDT (TRC20/ERC20), BTC, and ETH deposits credit automatically upon network confirmation. Approved withdrawal requests are dispatched to your whitelisted wallet address within 15 to 60 minutes.',
  },
  {
    q: 'Is KYC verification required before trading or withdrawing?',
    a: 'You can explore live charts and fund your account immediately after registration. Completing our 3-step KYC identity check unlocks full daily withdrawal limits and institutional liquidity tiers.',
  },
  {
    q: 'Which markets can I monitor and trade?',
    a: 'EquivaultFX provides live institutional feeds across major and minor Forex pairs, Cryptocurrencies, Global Stock Indices, and Spot Metals & Energy Commodities.',
  },
];

export default function PublicSite() {
  const [logoError, setLogoError] = useState(false);
  const [calcAmount, setCalcAmount] = useState(2500);
  const [calcPlanIdx, setCalcPlanIdx] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);

  const rates = [0.018, 0.026, 0.035];
  const days = [14, 21, 30];
  const dailyReturn = (Number(calcAmount) || 0) * rates[calcPlanIdx];
  const totalReturn = dailyReturn * days[calcPlanIdx];

  return (
    <div className="public-wrapper">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-mark">
            {!logoError ? (
              <img
                src={efxLogo}
                alt="EquivaultFX"
                className="brand-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="brand-logo-fallback">EF</span>
            )}
            <span>
              Equivault<span className="brand-accent">FX</span>
            </span>
          </Link>

          <nav className="nav-links">
            <a href="#markets">Live Markets</a>
            <a href="#plans">Liquidity Plans</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
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
          alt=""
          className="hero-gif-bg"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
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
                <div className="hero-stat-val">&lt; 25 ms</div>
                <div className="hero-stat-label">Order Routing Latency</div>
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
                    <span>Settlement Speed</span>
                    <strong>{plan.payout}</strong>
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
            <h4 style={{ marginBottom: '8px' }}>Mandatory 2FA &amp; PIN</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Hardware/authenticator 2FA and withdrawal address whitelisting
              protect every outbound transfer.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={20} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Encrypted KYC Vault</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Identity verification records are encrypted at rest with strict
              role-isolated compliance access.
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

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <strong style={{ color: 'var(--surface-white)' }}>
              EquivaultFX
            </strong>{' '}
            — Multi-Asset Liquidity &amp; Trading Infrastructure.
          </div>
          <div>
            Risk Warning: Trading leveraged Forex, Cryptocurrencies, and CFDs
            carries a high level of risk and may not be suitable for all
            investors.
          </div>
        </div>
      </footer>
    </div>
  );
}