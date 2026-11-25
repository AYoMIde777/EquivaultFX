import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CandlestickChart,
  History,
  Wallet,
  ShieldCheck,
  Settings,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import TradingViewChart from '../components/TradingViewChart';
import TradingViewTicker from '../components/TradingViewTicker';

const SYMBOLS = [
  { label: 'EUR/USD (Forex)', value: 'FX:EURUSD', refPrice: 1.0842 },
  { label: 'GBP/USD (Forex)', value: 'FX:GBPUSD', refPrice: 1.2695 },
  { label: 'BTC/USDT (Crypto)', value: 'BINANCE:BTCUSDT', refPrice: 91450.0 },
  { label: 'ETH/USDT (Crypto)', value: 'BINANCE:ETHUSDT', refPrice: 3120.5 },
  { label: 'Gold XAU/USD', value: 'OANDA:XAUUSD', refPrice: 2648.4 },
  { label: 'S&P 500 Index', value: 'FOREXCOM:SPXUSD', refPrice: 5985.2 },
];

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const userId = session.user.id;
  const [logoError, setLogoError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Database-backed state
  const [profile, setProfile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Admin state
  const [allProfiles, setAllProfiles] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  // Forms
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [orderAmount, setOrderAmount] = useState(500);
  const [leverage, setLeverage] = useState('1:50');
  const [depositAmt, setDepositAmt] = useState(1000);
  const [withdrawAmt, setWithdrawAmt] = useState(500);
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [docType, setDocType] = useState('International Passport');
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [notice, setNotice] = useState('');

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const isAdmin =
    Boolean(profile?.is_admin) ||
    session.user.email === import.meta.env.VITE_ADMIN_EMAIL;

  const loadUserData = async () => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (prof) {
      setProfile(prof);
      setProfileNameInput(prof.full_name || '');
    }

    const { data: userTrades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (userTrades) setTrades(userTrades);

    const { data: userTxs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (userTxs) setTransactions(userTxs);
  };

  const loadAdminData = async () => {
    const { data: profilesList } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profilesList) setAllProfiles(profilesList);

    const { data: txList } = await supabase
      .from('transactions')
      .select('*, profiles(email, full_name, balance)')
      .order('created_at', { ascending: false });
    if (txList) setAllTransactions(txList);
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const balance = Number(profile?.balance || 0);
  const kycStatus = profile?.kyc_status || 'unverified';

  // Execute Trade
  const handlePlaceOrder = async (side) => {
    const amt = Number(orderAmount);
    if (!amt || amt <= 0 || amt > balance) {
      showNotice('Enter a valid margin amount within your available balance.');
      return;
    }

    const simulatedPnl = Number(((Math.random() - 0.35) * amt * 0.08).toFixed(2));
    const newBalance = balance - amt;

    const { error: balErr } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balErr) {
      showNotice(balErr.message);
      return;
    }

    const { error: tradeErr } = await supabase.from('trades').insert({
      user_id: userId,
      pair: selectedSymbol.label.split(' ')[0],
      side,
      amount: amt,
      entry_price: selectedSymbol.refPrice.toLocaleString(),
      pnl: simulatedPnl,
      status: 'OPEN',
    });

    if (tradeErr) {
      showNotice(tradeErr.message);
      return;
    }

    showNotice(`${side} order executed for $${amt.toLocaleString()}.`);
    await loadUserData();
    setActiveTab('my-trades');
  };

  // Close Trade
  const handleCloseTrade = async (trade) => {
    if (trade.status !== 'OPEN') return;
    const settlement = Number(trade.amount) + Number(trade.pnl);
    const updatedBalance = balance + settlement;

    await supabase
      .from('profiles')
      .update({ balance: updatedBalance })
      .eq('id', userId);

    await supabase
      .from('trades')
      .update({ status: 'CLOSED' })
      .eq('id', trade.id);

    showNotice(
      `Position closed. $${settlement.toFixed(2)} settled to your wallet.`
    );
    await loadUserData();
  };

  // Request Deposit (Pending Admin Confirmation)
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = Number(depositAmt);
    if (!amt || amt <= 0) return;

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'Deposit (USDT TRC20)',
      amount: amt,
      status: 'Pending',
    });

    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice(
      `Deposit notice for $${amt.toLocaleString()} logged. Balance credits once confirmed.`
    );
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  // Request Withdrawal
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmt);
    if (kycStatus !== 'verified') {
      showNotice('Complete KYC verification before requesting payouts.');
      setActiveTab('kyc');
      return;
    }
    if (!amt || amt <= 0 || amt > balance || !withdrawWallet.trim()) {
      showNotice('Enter a valid amount and destination USDT wallet.');
      return;
    }

    await supabase
      .from('profiles')
      .update({ balance: balance - amt })
      .eq('id', userId);

    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'Withdrawal (USDT TRC20)',
      amount: -amt,
      wallet_address: withdrawWallet.trim(),
      status: 'Pending',
    });

    setWithdrawWallet('');
    showNotice(`Withdrawal request for $${amt.toLocaleString()} submitted.`);
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  // Upload KYC Documents to Private Supabase Storage
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      showNotice('Please attach both your Government ID and Selfie.');
      return;
    }

    const idPath = `${userId}/id-${Date.now()}-${idFile.name}`;
    const selfiePath = `${userId}/selfie-${Date.now()}-${selfieFile.name}`;

    const { error: up1 } = await supabase.storage
      .from('kyc-documents')
      .upload(idPath, idFile);
    const { error: up2 } = await supabase.storage
      .from('kyc-documents')
      .upload(selfiePath, selfieFile);

    if (up1 || up2) {
      showNotice((up1 || up2).message);
      return;
    }

    await supabase
      .from('profiles')
      .update({
        kyc_status: 'pending',
        kyc_doc_type: docType,
        kyc_id_path: idPath,
        kyc_selfie_path: selfiePath,
      })
      .eq('id', userId);

    showNotice('KYC documents encrypted and submitted for review.');
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  // Admin Actions
  const handleAdminKycAction = async (targetUserId, decision) => {
    await supabase
      .from('profiles')
      .update({ kyc_status: decision })
      .eq('id', targetUserId);
    showNotice(`User KYC updated to ${decision.toUpperCase()}.`);
    await loadAdminData();
    await loadUserData();
  };

  const handleOpenKycDoc = async (path) => {
    if (!path) return;
    const { data } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(path, 120);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAdminTxAction = async (tx, decision) => {
    if (tx.status !== 'Pending') return;

    await supabase
      .from('transactions')
      .update({ status: decision })
      .eq('id', tx.id);

    const currentBal = Number(tx.profiles?.balance || 0);
    const txAmt = Number(tx.amount);

    // If approving a deposit, add funds; if rejecting a withdrawal, refund funds
    if (decision === 'Completed' && txAmt > 0) {
      await supabase
        .from('profiles')
        .update({ balance: currentBal + txAmt })
        .eq('id', tx.user_id);
    } else if (decision === 'Rejected' && txAmt < 0) {
      await supabase
        .from('profiles')
        .update({ balance: currentBal + Math.abs(txAmt) })
        .eq('id', tx.user_id);
    }

    showNotice(`Transaction marked ${decision}.`);
    await loadAdminData();
    await loadUserData();
  };

  const openTrades = trades.filter((t) => t.status === 'OPEN');
  const activeCapital = openTrades.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div>
          <Link to="/" className="brand-mark">
            {!logoError ? (
              <img
                src="/assets/logo.png"
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

          <nav className="dash-nav">
            <button
              className={`dash-nav-btn ${
                activeTab === 'overview' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={17} /> Overview
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'trade' ? 'active' : ''}`}
              onClick={() => setActiveTab('trade')}
            >
              <CandlestickChart size={17} /> Live Trade
            </button>
            <button
              className={`dash-nav-btn ${
                activeTab === 'my-trades' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('my-trades')}
            >
              <History size={17} /> My Trades ({openTrades.length})
            </button>
            <button
              className={`dash-nav-btn ${
                activeTab === 'wallet' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('wallet')}
            >
              <Wallet size={17} /> Deposit &amp; Withdraw
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'kyc' ? 'active' : ''}`}
              onClick={() => setActiveTab('kyc')}
            >
              <ShieldCheck size={17} /> KYC Verification
            </button>
            <button
              className={`dash-nav-btn ${
                activeTab === 'settings' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={17} /> Settings
            </button>

            {isAdmin && (
              <button
                className={`dash-nav-btn ${
                  activeTab === 'admin' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldAlert size={17} /> Admin Desk
              </button>
            )}
          </nav>
        </div>

        <div>
          <div className={`kyc-pill ${kycStatus}`}>
            {kycStatus === 'verified' && <CheckCircle2 size={14} />}
            {kycStatus === 'pending' && <Clock size={14} />}
            {kycStatus === 'unverified' && <AlertCircle size={14} />}
            <span>KYC: {kycStatus.toUpperCase()}</span>
          </div>

          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
            }}
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      <div className="dash-content-area">
        <TradingViewTicker />

        <div className="dash-topbar">
          <div>
            <strong style={{ fontSize: '16px' }}>
              Welcome, {profile?.full_name || session.user.email}
            </strong>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {session.user.email}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('wallet')}
            >
              Deposit Funds
            </button>
            <button
              className="btn btn-crimson btn-sm"
              onClick={() => setActiveTab('trade')}
            >
              New Trade
            </button>
          </div>
        </div>

        <main className="dash-main">
          {notice && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-crimson)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '13px',
              }}
            >
              {notice}
            </div>
          )}

          {/* KPI Cards */}
          <div className="kpi-grid tabular">
            <div className="kpi-card">
              <div className="kpi-label">Available Balance</div>
              <div className="kpi-value">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Active Margin</div>
              <div className="kpi-value">
                ${activeCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Floating / Realized PnL</div>
              <div
                className="kpi-value"
                style={{
                  color: totalPnl >= 0 ? 'var(--positive)' : 'var(--negative)',
                }}
              >
                {totalPnl >= 0 ? '+' : ''}$
                {totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Account Status</div>
              <div className="kpi-value">
                {isAdmin ? 'Admin / ECN' : 'Prime ECN'}
              </div>
            </div>
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Live Market Chart ({selectedSymbol.label})</h3>
                  <button
                    className="btn btn-crimson btn-sm"
                    onClick={() => setActiveTab('trade')}
                  >
                    Open Execution Ticket
                  </button>
                </div>
                <TradingViewChart symbol={selectedSymbol.value} height={420} />
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Wallet Ledger</h3>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ color: 'var(--text-muted)' }}>
                            No wallet transactions yet. Deposit funds to begin.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.type}</td>
                            <td
                              style={{
                                color:
                                  Number(tx.amount) >= 0
                                    ? 'var(--positive)'
                                    : 'var(--text-primary)',
                              }}
                            >
                              {Number(tx.amount) >= 0 ? '+' : ''}$
                              {Math.abs(Number(tx.amount)).toLocaleString()}
                            </td>
                            <td>{tx.status}</td>
                            <td>
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* LIVE TRADE */}
          {activeTab === 'trade' && (
            <div className="terminal-grid">
              <TradingViewChart symbol={selectedSymbol.value} height={540} />

              <div className="order-ticket">
                <h3 style={{ marginBottom: '14px' }}>Order Execution</h3>

                <div className="form-group">
                  <label className="form-label">Select Market / Pair</label>
                  <select
                    className="form-control"
                    value={selectedSymbol.value}
                    onChange={(e) => {
                      const found = SYMBOLS.find(
                        (s) => s.value === e.target.value
                      );
                      if (found) setSelectedSymbol(found);
                    }}
                  >
                    {SYMBOLS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Margin Amount (USD)</label>
                  <input
                    type="number"
                    className="form-control tabular"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Leverage</label>
                  <select
                    className="form-control"
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                  >
                    <option>1:20</option>
                    <option>1:50</option>
                    <option>1:100</option>
                  </select>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                  }}
                >
                  <span>Available Margin:</span>
                  <strong className="tabular">${balance.toLocaleString()}</strong>
                </div>

                <div className="order-btn-row">
                  <button
                    type="button"
                    className="btn btn-white"
                    onClick={() => handlePlaceOrder('BUY')}
                  >
                    Buy / Long
                  </button>
                  <button
                    type="button"
                    className="btn btn-crimson"
                    onClick={() => handlePlaceOrder('SELL')}
                  >
                    Sell / Short
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY TRADES */}
          {activeTab === 'my-trades' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Positions &amp; Trade History</h3>
              </div>
              <div className="data-table-wrap">
                <table className="data-table tabular">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Direction</th>
                      <th>Margin</th>
                      <th>Entry Price</th>
                      <th>PnL</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ color: 'var(--text-muted)' }}>
                          No trades placed yet.
                        </td>
                      </tr>
                    ) : (
                      trades.map((tr) => (
                        <tr key={tr.id}>
                          <td>
                            <strong>{tr.pair}</strong>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                tr.side === 'BUY' ? 'badge-long' : 'badge-short'
                              }`}
                            >
                              {tr.side}
                            </span>
                          </td>
                          <td>${Number(tr.amount).toLocaleString()}</td>
                          <td>{tr.entry_price}</td>
                          <td
                            style={{
                              color:
                                Number(tr.pnl) >= 0
                                  ? 'var(--positive)'
                                  : 'var(--negative)',
                            }}
                          >
                            {Number(tr.pnl) >= 0 ? '+' : ''}$
                            {Number(tr.pnl).toFixed(2)}
                          </td>
                          <td>{tr.status}</td>
                          <td>
                            {tr.status === 'OPEN' ? (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleCloseTrade(tr)}
                              >
                                Close Position
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>
                                Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WALLET */}
          {activeTab === 'wallet' && (
            <div className="two-col-grid">
              <div className="panel-card">
                <h3 style={{ marginBottom: '12px' }}>Crypto Deposit (USDT)</h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                  }}
                >
                  Transfer USDT (TRC20) to your custody wallet below, then
                  submit the deposit notice for confirmation.
                </p>

                <div
                  style={{
                    background: 'var(--bg-input)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '16px',
                    wordBreak: 'break-all',
                  }}
                >
                  TRC20 Address:{' '}
                  <strong>TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE</strong>
                </div>

                <form onSubmit={handleDeposit}>
                  <div className="form-group">
                    <label className="form-label">Deposit Amount (USD)</label>
                    <input
                      type="number"
                      className="form-control tabular"
                      value={depositAmt}
                      onChange={(e) => setDepositAmt(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-crimson">
                    Submit Deposit Notice
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <h3 style={{ marginBottom: '12px' }}>Request Withdrawal</h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                  }}
                >
                  Outbound crypto withdrawals require Verified KYC status.
                </p>

                <form onSubmit={handleWithdraw}>
                  <div className="form-group">
                    <label className="form-label">Amount (USD)</label>
                    <input
                      type="number"
                      className="form-control tabular"
                      value={withdrawAmt}
                      onChange={(e) => setWithdrawAmt(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Destination USDT (TRC20) Wallet
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="T..."
                      value={withdrawWallet}
                      onChange={(e) => setWithdrawWallet(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-white">
                    Submit Withdrawal Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* KYC */}
          {activeTab === 'kyc' && (
            <div className="panel-card" style={{ maxWidth: '680px' }}>
              <div className="panel-header">
                <h3>Identity Verification (KYC)</h3>
                <span className={`kyc-pill ${kycStatus}`}>
                  {kycStatus.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleKycSubmit}>
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select
                    className="form-control"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option>International Passport</option>
                    <option>National Identity Card</option>
                    <option>Driver&apos;s License</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Government ID Image</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="form-control"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Selfie Holding ID</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-crimson"
                  style={{ marginTop: '12px' }}
                >
                  Upload Encrypted KYC Files
                </button>
              </form>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="panel-card" style={{ maxWidth: '540px' }}>
              <h3 style={{ marginBottom: '14px' }}>Account Profile</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={session.user.email}
                  disabled
                />
              </div>
              <button
                type="button"
                className="btn btn-crimson"
                onClick={async () => {
                  await supabase
                    .from('profiles')
                    .update({ full_name: profileNameInput })
                    .eq('id', userId);
                  showNotice('Profile updated.');
                  await loadUserData();
                }}
              >
                Save Changes
              </button>
            </div>
          )}

          {/* ADMIN COMPLIANCE DESK */}
          {activeTab === 'admin' && isAdmin && (
            <>
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Admin Desk: Client KYC &amp; Balances</h3>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={loadAdminData}
                  >
                    Refresh
                  </button>
                </div>

                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Balance</th>
                        <th>KYC Status</th>
                        <th>Documents</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProfiles.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.full_name}</strong>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {p.email}
                            </div>
                          </td>
                          <td>${Number(p.balance || 0).toLocaleString()}</td>
                          <td>
                            <span className={`kyc-pill ${p.kyc_status}`}>
                              {p.kyc_status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {p.kyc_id_path ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleOpenKycDoc(p.kyc_id_path)}
                                >
                                  ID <ExternalLink size={12} />
                                </button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() =>
                                    handleOpenKycDoc(p.kyc_selfie_path)
                                  }
                                >
                                  Selfie <ExternalLink size={12} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>
                                None
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-white btn-sm"
                                onClick={() =>
                                  handleAdminKycAction(p.id, 'verified')
                                }
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-crimson btn-sm"
                                onClick={() =>
                                  handleAdminKycAction(p.id, 'unverified')
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Admin Desk: Deposits &amp; Withdrawals Queue</h3>
                </div>

                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Wallet Address</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.profiles?.email || tx.user_id}</td>
                          <td>{tx.type}</td>
                          <td>
                            {Number(tx.amount) >= 0 ? '+' : ''}$
                            {Math.abs(Number(tx.amount)).toLocaleString()}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {tx.wallet_address || '—'}
                          </td>
                          <td>{tx.status}</td>
                          <td>
                            {tx.status === 'Pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-white btn-sm"
                                  onClick={() =>
                                    handleAdminTxAction(tx, 'Completed')
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-crimson btn-sm"
                                  onClick={() =>
                                    handleAdminTxAction(tx, 'Rejected')
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>
                                Processed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}