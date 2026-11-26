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
    quote:
      'Execution on XAU/USD during New York session opens is remarkably tight, and my USDT TRC20 withdrawals clear within 25 minutes.',
    metric: '+18.4% Avg Monthly ROI',
  },
  {
    name: 'Elena Rostova',
    role: 'Quantitative Crypto Allocator • London',
    quote:
      'Having live multi-asset feeds, clear network gas fee breakdowns, and segregated cold custody in one dark terminal saves me switching across three platforms.',
    metric: '$42,000 Managed Tier',
  },
  {
    name: 'Marcus Vance',
    role: 'Indices & Commodities Trader • Dubai',
    quote:
      'The Prime ECN liquidity plan and instant position settlement make portfolio tracking effortless even on mobile.',
    metric: '0.0 Pip Raw Spread',
  },
];

const FAQS = [
  {
    q: 'How fast are crypto deposits and withdrawals processed on EquivaultFX?',
    a: 'USDT (TRC20/ERC20/BEP20), BTC, and ETH deposits credit automatically upon network confirmation. Approved withdrawal requests are dispatched to your whitelisted wallet address within 15 to 60 minutes.',
  },
  {
    q: 'How are blockchain network gas fees handled on deposits and withdrawals?',
    a: 'EquivaultFX displays the exact network gas fee upfront before you confirm a transaction (such as $1.50 for TRC20, $0.80 for BEP20, $4.50 for BTC, and $12.00 for ERC20) with transparent ledger tracking.',
  },
  {
    q: 'How is EquivaultFX different from standard retail trading platforms?',
    a: 'EquivaultFX pairs institutional multi-asset market feeds and managed liquidity tiers with dedicated separate deposit and withdrawal flows, 4-digit withdrawal PIN protection, and cold-storage reserve custody.',
  },
  {
    q: 'Is KYC verification required before trading or withdrawing?',
    a: 'You can explore live charts and fund your account immediately after registration. Completing our 3-step KYC identity verification unlocks full daily withdrawal limits and institutional liquidity tiers.',
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
    a: 'Accounts use password strength validation, encrypted sessions, a 4-digit withdrawal security PIN, role-isolated database access, and an encrypted KYC document vault.',
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

  return (
    <div className="public-wrapper">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-mark-link">
            <BrandLogo />
          </Link>

          <nav className="nav-links">
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
              4-digit withdrawal security PIN verification and address checks
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

      <section id="testimonials" className="section-block">
        <div className="section-header">
          <div>
            <div className="section-kicker">Verified Traders</div>
            <h2 className="section-title">Client Execution Reports</h2>
          </div>
        </div>

        <div className="plans-grid">
          {TESTIMONIALS.map((item) => (
            <div key={item.name} className="plan-card">
              <div>
                <span className="plan-badge">{item.metric}</span>
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
          ))}
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
                24/7 assistance for account onboarding, deposits, withdrawals, and platform navigation.
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <a
                href="mailto:support@equivaultfx.com"
                className="btn btn-outline btn-sm"
              >
                <Mail size={14} /> support@equivaultfx.com
              </a>
              <Link to="/auth" className="btn btn-crimson btn-sm">
                <LifeBuoy size={14} /> Client Portal
              </Link>
            </div>
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
            <div style={{ display: 'flex', gap: '16px' }}>
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