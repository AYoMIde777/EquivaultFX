import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CandlestickChart,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Settings,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import efxLogo from '../assets/EFX logo.jpg';
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

const DEFAULT_NETWORKS = [
  { id: 'TRC20', label: 'USDT (TRC20 — Tron)', gasFee: 1.5 },
  { id: 'BEP20', label: 'USDT (BEP20 — BNB Smart Chain)', gasFee: 0.8 },
  { id: 'ERC20', label: 'USDT (ERC20 — Ethereum)', gasFee: 12.0 },
  { id: 'BTC', label: 'Bitcoin (BTC Network)', gasFee: 4.5 },
];

const DEFAULT_TRC20_WALLET = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const userId = session.user.id;
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [depositWallet, setDepositWallet] = useState(DEFAULT_TRC20_WALLET);
  const [networks, setNetworks] = useState(DEFAULT_NETWORKS);

  const [allProfiles, setAllProfiles] = useState([]);
  const [balanceEdits, setBalanceEdits] = useState({});
  const [allTransactions, setAllTransactions] = useState([]);
  const [walletInput, setWalletInput] = useState(DEFAULT_TRC20_WALLET);
  const [gasEdits, setGasEdits] = useState({
    TRC20: '1.50',
    BEP20: '0.80',
    ERC20: '12.00',
    BTC: '4.50',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [orderAmount, setOrderAmount] = useState(500);
  const [leverage, setLeverage] = useState('1:50');

  const [depositNetworkId, setDepositNetworkId] = useState('TRC20');
  const [depositAmt, setDepositAmt] = useState(1000);
  const [depositTxHash, setDepositTxHash] = useState('');

  const [withdrawNetworkId, setWithdrawNetworkId] = useState('TRC20');
  const [withdrawAmt, setWithdrawAmt] = useState(500);
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [withdrawPinInput, setWithdrawPinInput] = useState('');

  const [docType, setDocType] = useState('International Passport');
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [notice, setNotice] = useState('');

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
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
      setPinInput(prof.withdrawal_pin || '');
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

    const { data: settingsRows } = await supabase
      .from('site_settings')
      .select('key, value');

    if (settingsRows?.length) {
      const map = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));
      if (map.usdt_trc20_wallet) {
        setDepositWallet(map.usdt_trc20_wallet);
        setWalletInput(map.usdt_trc20_wallet);
      }
      setGasEdits({
        TRC20: map.gas_fee_trc20 ?? '1.50',
        BEP20: map.gas_fee_bep20 ?? '0.80',
        ERC20: map.gas_fee_erc20 ?? '12.00',
        BTC: map.gas_fee_btc ?? '4.50',
      });
      setNetworks(
        DEFAULT_NETWORKS.map((net) => {
          const overrideKey = `gas_fee_${net.id.toLowerCase()}`;
          const parsed = Number(map[overrideKey]);
          return Number.isFinite(parsed) && map[overrideKey] !== undefined
            ? { ...net, gasFee: parsed }
            : net;
        })
      );
    }
  };

  const loadAdminData = async () => {
    const { data: profilesList } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profilesList) {
      setAllProfiles(profilesList);
      setBalanceEdits((prev) => {
        const next = { ...prev };
        for (const p of profilesList) {
          if (next[p.id] === undefined) {
            next[p.id] = String(Number(p.balance || 0));
          }
        }
        return next;
      });
    }

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
  const depositNetwork =
    networks.find((n) => n.id === depositNetworkId) || networks[0];
  const withdrawNetwork =
    networks.find((n) => n.id === withdrawNetworkId) || networks[0];

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
    selectTab('my-trades');
  };

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

    showNotice(`Position closed. $${settlement.toFixed(2)} settled to your wallet.`);
    await loadUserData();
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = Number(depositAmt);
    if (!amt || amt <= 0) return;

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: `Deposit (${depositNetwork.id})`,
      amount: amt,
      gas_fee: depositNetwork.gasFee,
      network: depositNetwork.id,
      wallet_address: depositTxHash.trim() || depositWallet,
      status: 'Pending',
    });

    if (error) {
      showNotice(error.message);
      return;
    }

    setDepositTxHash('');
    showNotice(
      `Deposit notice for $${amt.toLocaleString()} (${depositNetwork.id}) submitted.`
    );
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmt);
    const gas = withdrawNetwork.gasFee;
    const totalDebit = amt + gas;

    if (kycStatus !== 'verified') {
      showNotice('Complete KYC verification before requesting payouts.');
      selectTab('kyc');
      return;
    }
    if (!profile?.withdrawal_pin) {
      showNotice('Set your 4-digit withdrawal PIN in Account & PIN first.');
      selectTab('settings');
      return;
    }
    if (withdrawPinInput.trim() !== profile.withdrawal_pin) {
      showNotice('Invalid 4-digit withdrawal security PIN.');
      return;
    }
    if (!amt || amt <= 0 || !withdrawWallet.trim()) {
      showNotice('Enter a valid amount and destination wallet address.');
      return;
    }
    if (totalDebit > balance) {
      showNotice(
        `Insufficient balance to cover $${amt.toFixed(2)} + $${gas.toFixed(2)} ${withdrawNetwork.id} gas fee.`
      );
      return;
    }

    await supabase
      .from('profiles')
      .update({ balance: balance - totalDebit })
      .eq('id', userId);

    await supabase.from('transactions').insert({
      user_id: userId,
      type: `Withdrawal (${withdrawNetwork.id})`,
      amount: -amt,
      gas_fee: gas,
      network: withdrawNetwork.id,
      wallet_address: withdrawWallet.trim(),
      status: 'Pending',
    });

    setWithdrawWallet('');
    setWithdrawPinInput('');
    showNotice(
      `Withdrawal of $${amt.toLocaleString()} submitted ($${gas.toFixed(2)} ${withdrawNetwork.id} gas fee applied).`
    );
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  const handleSaveSettings = async () => {
    const cleanPin = pinInput.trim();
    if (cleanPin && !/^\d{4}$/.test(cleanPin)) {
      showNotice('Withdrawal PIN must be exactly 4 digits (0-9).');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileNameInput.trim(),
        withdrawal_pin: cleanPin || null,
      })
      .eq('id', userId);

    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice('Profile and withdrawal security PIN saved.');
    await loadUserData();
  };

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

  const handleSavePlatformSettings = async (e) => {
    e.preventDefault();
    if (!walletInput.trim()) {
      showNotice('Deposit wallet address cannot be empty.');
      return;
    }

    setSavingSettings(true);
    const now = new Date().toISOString();
    const rows = [
      { key: 'usdt_trc20_wallet', value: walletInput.trim(), updated_at: now },
      { key: 'gas_fee_trc20', value: String(Number(gasEdits.TRC20 || 0).toFixed(2)), updated_at: now },
      { key: 'gas_fee_bep20', value: String(Number(gasEdits.BEP20 || 0).toFixed(2)), updated_at: now },
      { key: 'gas_fee_erc20', value: String(Number(gasEdits.ERC20 || 0).toFixed(2)), updated_at: now },
      { key: 'gas_fee_btc', value: String(Number(gasEdits.BTC || 0).toFixed(2)), updated_at: now },
    ];

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    setSavingSettings(false);
    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice('Custody wallet and network gas fees updated live.');
    await loadUserData();
  };

  const handleAdminBalanceSave = async (targetUserId, emailLabel) => {
    const nextVal = Number(balanceEdits[targetUserId]);
    if (!Number.isFinite(nextVal) || nextVal < 0) {
      showNotice('Enter a valid non-negative balance.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ balance: nextVal })
      .eq('id', targetUserId);

    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice(`Updated ${emailLabel || 'user'} balance to $${nextVal.toFixed(2)}.`);
    await loadAdminData();
    await loadUserData();
  };

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
    const gas = Number(tx.gas_fee || 0);

    if (decision === 'Completed' && txAmt > 0) {
      await supabase
        .from('profiles')
        .update({ balance: currentBal + txAmt })
        .eq('id', tx.user_id);
    } else if (decision === 'Rejected' && txAmt < 0) {
      await supabase
        .from('profiles')
        .update({ balance: currentBal + Math.abs(txAmt) + gas })
        .eq('id', tx.user_id);
    }

    showNotice(`Transaction marked ${decision}.`);
    await loadAdminData();
    await loadUserData();
  };

  const openTrades = trades.filter((t) => t.status === 'OPEN');
  const activeCapital = openTrades.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0);
  const netWithdrawTotal = Math.max(0, Number(withdrawAmt || 0) + withdrawNetwork.gasFee);

  return (
    <div className="dash-shell">
      {mobileMenuOpen && (
        <div
          className="dash-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`dash-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="dash-nav">
            <button
              className={`dash-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => selectTab('overview')}
            >
              <LayoutDashboard size={17} /> Market Overview
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'trade' ? 'active' : ''}`}
              onClick={() => selectTab('trade')}
            >
              <CandlestickChart size={17} /> ECN Live Terminal
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'my-trades' ? 'active' : ''}`}
              onClick={() => selectTab('my-trades')}
            >
              <History size={17} /> Positions ({openTrades.length})
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => selectTab('deposit')}
            >
              <ArrowDownToLine size={17} /> Deposit Funds
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => selectTab('withdraw')}
            >
              <ArrowUpFromLine size={17} /> Withdraw Funds
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'kyc' ? 'active' : ''}`}
              onClick={() => selectTab('kyc')}
            >
              <ShieldCheck size={17} /> KYC Verification
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => selectTab('settings')}
            >
              <Settings size={17} /> Account &amp; PIN
            </button>

            {isAdmin && (
              <button
                className={`dash-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => selectTab('admin')}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <strong style={{ fontSize: '15px' }}>
                {profile?.full_name || session.user.email}
              </strong>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {profile?.account_currency || 'USD'} Account • {session.user.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => selectTab('deposit')}
            >
              Deposit
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => selectTab('withdraw')}
            >
              Withdraw
            </button>
            <button
              className="btn btn-crimson btn-sm"
              onClick={() => selectTab('trade')}
            >
              Trade
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

          <div className="kpi-grid tabular">
            <div className="kpi-card">
              <div className="kpi-label">Available Equity</div>
              <div className="kpi-value">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Allocated Margin</div>
              <div className="kpi-value">
                ${activeCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Net Session PnL</div>
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
              <div className="kpi-label">Execution Tier</div>
              <div className="kpi-value">
                {isAdmin ? 'Admin / ECN' : 'Prime ECN'}
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="terminal-grid" style={{ marginBottom: '20px' }}>
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <div className="panel-header">
                    <h3>Live Market Feed ({selectedSymbol.label})</h3>
                    <button
                      className="btn btn-crimson btn-sm"
                      onClick={() => selectTab('trade')}
                    >
                      Execute Order
                    </button>
                  </div>
                  <TradingViewChart symbol={selectedSymbol.value} height={390} />
                </div>

                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <div className="panel-header">
                    <h3>Watchlist &amp; Quick Switch</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SYMBOLS.map((sym) => (
                      <button
                        key={sym.value}
                        type="button"
                        onClick={() => setSelectedSymbol(sym)}
                        className="dash-nav-btn"
                        style={{
                          justifyContent: 'space-between',
                          background:
                            selectedSymbol.value === sym.value
                              ? 'rgba(225, 29, 72, 0.16)'
                              : 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span>{sym.label}</span>
                        <strong className="tabular">${sym.refPrice.toLocaleString()}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Wallet &amp; Gas Fee Ledger</h3>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Gas Fee</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ color: 'var(--text-muted)' }}>
                            No wallet transactions yet.
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
                            <td>${Number(tx.gas_fee || 0).toFixed(2)}</td>
                            <td>{tx.status}</td>
                            <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'trade' && (
            <div className="terminal-grid">
              <TradingViewChart symbol={selectedSymbol.value} height={540} />

              <div className="order-ticket">
                <h3 style={{ marginBottom: '14px' }}>ECN Order Ticket</h3>

                <div className="form-group">
                  <label className="form-label">Select Market / Pair</label>
                  <select
                    className="form-control"
                    value={selectedSymbol.value}
                    onChange={(e) => {
                      const found = SYMBOLS.find((s) => s.value === e.target.value);
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

          {activeTab === 'my-trades' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Open Positions &amp; History</h3>
              </div>
              <div className="data-table-wrap">
                <table className="data-table tabular">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Side</th>
                      <th>Margin</th>
                      <th>Entry</th>
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
                          <td><strong>{tr.pair}</strong></td>
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
                            {Number(tr.pnl) >= 0 ? '+' : ''}${Number(tr.pnl).toFixed(2)}
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
                              <span style={{ color: 'var(--text-muted)' }}>Settled</span>
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

          {activeTab === 'deposit' && (
            <div className="panel-card" style={{ maxWidth: '640px' }}>
              <div className="panel-header">
                <h3>Fund Trading Wallet (Deposit)</h3>
                <span className="plan-badge" style={{ marginBottom: 0 }}>
                  Est. Gas: ${depositNetwork.gasFee.toFixed(2)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Select Blockchain Network</label>
                <select
                  className="form-control"
                  value={depositNetwork.id}
                  onChange={(e) => setDepositNetworkId(e.target.value)}
                >
                  {networks.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} — Network Gas: ${n.gasFee.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px',
                  wordBreak: 'break-all',
                }}
              >
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Official EquivaultFX Custody Address ({depositNetwork.id}):
                </div>
                <strong>{depositWallet}</strong>
              </div>

              <form onSubmit={handleDeposit}>
                <div className="form-group">
                  <label className="form-label">Deposit Amount (USD)</label>
                  <input
                    type="number"
                    className="form-control tabular"
                    min="50"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Hash / TXID (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Paste blockchain TXID for faster credit..."
                    value={depositTxHash}
                    onChange={(e) => setDepositTxHash(e.target.value)}
                  />
                </div>

                <div className="gas-summary-box tabular">
                  <div>
                    <span>Credit Amount:</span>
                    <strong>${Number(depositAmt || 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Sender Network Gas ({depositNetwork.id}):</span>
                    <span>~${depositNetwork.gasFee.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-crimson" style={{ width: '100%' }}>
                  Confirm &amp; Log Deposit Notice
                </button>
              </form>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="panel-card" style={{ maxWidth: '640px' }}>
              <div className="panel-header">
                <h3>Outbound Crypto Withdrawal</h3>
                <span className={`kyc-pill ${kycStatus}`} style={{ marginBottom: 0 }}>
                  KYC: {kycStatus.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleWithdraw}>
                <div className="form-group">
                  <label className="form-label">Payout Network</label>
                  <select
                    className="form-control"
                    value={withdrawNetwork.id}
                    onChange={(e) => setWithdrawNetworkId(e.target.value)}
                  >
                    {networks.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} — Gas Fee: ${n.gasFee.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Withdrawal Amount (USD)</label>
                  <input
                    type="number"
                    className="form-control tabular"
                    min="20"
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Destination {withdrawNetwork.id} Wallet Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your external wallet address"
                    value={withdrawWallet}
                    onChange={(e) => setWithdrawWallet(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">4-Digit Withdrawal Security PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    className="form-control tabular"
                    placeholder="••••"
                    value={withdrawPinInput}
                    onChange={(e) =>
                      setWithdrawPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    required
                  />
                </div>

                <div className="gas-summary-box tabular">
                  <div>
                    <span>Net Payout Sent to Wallet:</span>
                    <strong>${Number(withdrawAmt || 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Blockchain Gas Fee ({withdrawNetwork.id}):</span>
                    <span style={{ color: '#fda4af' }}>+${withdrawNetwork.gasFee.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <span>Total Deducted from Balance:</span>
                    <strong>${netWithdrawTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <button type="submit" className="btn btn-white" style={{ width: '100%' }}>
                  Verify PIN &amp; Submit Withdrawal
                </button>
              </form>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="panel-card" style={{ maxWidth: '680px' }}>
              <div className="panel-header">
                <h3>Identity Verification (KYC)</h3>
                <span className={`kyc-pill ${kycStatus}`}>{kycStatus.toUpperCase()}</span>
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

                <button type="submit" className="btn btn-crimson" style={{ marginTop: '12px' }}>
                  Upload Encrypted KYC Files
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="panel-card" style={{ maxWidth: '540px' }}>
              <h3 style={{ marginBottom: '14px' }}>Account Profile &amp; Withdrawal PIN</h3>
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
              <div className="form-group">
                <label className="form-label">4-Digit Withdrawal Security PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className="form-control tabular"
                  placeholder="Enter 4 digits (e.g. 4829)"
                  value={pinInput}
                  onChange={(e) =>
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                />
              </div>
              <button
                type="button"
                className="btn btn-crimson"
                onClick={handleSaveSettings}
              >
                Save Profile &amp; PIN
              </button>
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <>
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Admin Desk: Custody Wallet &amp; Gas Fees</h3>
                </div>

                <form onSubmit={handleSavePlatformSettings}>
                  <div className="form-group">
                    <label className="form-label">Official Deposit Custody Wallet Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="kpi-grid tabular" style={{ marginBottom: '16px' }}>
                    {['TRC20', 'BEP20', 'ERC20', 'BTC'].map((netId) => (
                      <div key={netId} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{netId} Gas Fee (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control tabular"
                          value={gasEdits[netId]}
                          onChange={(e) =>
                            setGasEdits((prev) => ({
                              ...prev,
                              [netId]: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={savingSettings} className="btn btn-crimson">
                    {savingSettings ? 'Saving Settings...' : 'Save Wallet & Gas Fees'}
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Admin Desk: Client Balances, KYC &amp; Controls</h3>
                  <button className="btn btn-outline btn-sm" onClick={loadAdminData}>
                    Refresh
                  </button>
                </div>

                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Edit Balance (USD)</th>
                        <th>KYC Status</th>
                        <th>Documents</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProfiles.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.full_name || 'Trader'}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {p.email}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control tabular"
                                style={{ width: '115px', marginTop: 0, padding: '6px 8px' }}
                                value={balanceEdits[p.id] ?? String(Number(p.balance || 0))}
                                onChange={(e) =>
                                  setBalanceEdits((prev) => ({
                                    ...prev,
                                    [p.id]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleAdminBalanceSave(p.id, p.email)}
                              >
                                Save
                              </button>
                            </div>
                          </td>
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
                                  onClick={() => handleOpenKycDoc(p.kyc_selfie_path)}
                                >
                                  Selfie <ExternalLink size={12} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>None</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-white btn-sm"
                                onClick={() => handleAdminKycAction(p.id, 'verified')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-crimson btn-sm"
                                onClick={() => handleAdminKycAction(p.id, 'unverified')}
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
                        <th>Gas Fee</th>
                        <th>Wallet / TXID</th>
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
                          <td>${Number(tx.gas_fee || 0).toFixed(2)}</td>
                          <td style={{ fontSize: '12px' }}>{tx.wallet_address || '—'}</td>
                          <td>{tx.status}</td>
                          <td>
                            {tx.status === 'Pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-white btn-sm"
                                  onClick={() => handleAdminTxAction(tx, 'Completed')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-crimson btn-sm"
                                  onClick={() => handleAdminTxAction(tx, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Processed</span>
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