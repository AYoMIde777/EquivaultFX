import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="site-legal-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div>
            <strong>Client Support</strong>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              24/7 assistance for account setup, deposits, withdrawals, and platform access.
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
          <strong>Legal &amp; Terms:</strong> EquivaultFX provides online trading tools, market data, and account services subject to our Client Agreement, Terms of Service, and Privacy Policy. By accessing this website or opening an account, you agree to comply with applicable laws and platform rules.
        </div>

        <div className="site-footer-block">
          <strong>Risk Warning:</strong> Trading leveraged Forex, CFDs, indices, and digital assets carries a high level of risk to your capital and may not be suitable for all investors. Prices can move rapidly, and losses can exceed deposits on leveraged positions. Only trade with funds you can afford to lose and seek independent advice if needed.
        </div>

        <div className="site-footer-block">
          <strong>Jurisdiction Notice:</strong> Services and financial instruments displayed on this site are not intended for distribution to, or use by, any person or entity in any jurisdiction where such distribution or use would be contrary to local law or regulation.
        </div>

        <div className="site-footer-bottom">
          <span>Copyright © 2026 EquivaultFX — All Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" className="site-footer-link">Home</Link>
            <Link to="/auth" className="site-footer-link">Sign In</Link>
            <Link to="/auth?mode=signup" className="site-footer-link">Open Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}