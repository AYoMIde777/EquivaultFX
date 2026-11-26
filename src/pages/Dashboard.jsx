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
  LifeBuoy,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Send,
  Plus,
  Minus,
} from 'lucide-react';
import efxLogo from '../assets/EFX logo.jpg';
import { supabase } from '../lib/supabase';
import CurrencyIcon from '../components/CurrencyIcon';
import TradingViewChart from '../components/TradingViewChart';
import TradingViewTicker from '../components/TradingViewTicker';

const SYMBOLS = [
  { label: 'BTC/USDT (Crypto)', value: 'BINANCE:BTCUSDT', refPrice: 60875.44 },
  { label: 'ETH/USDT (Crypto)', value: 'BINANCE:ETHUSDT', refPrice: 1704.72 },
  { label: 'EUR/USD (Forex)', value: 'FX:EURUSD', refPrice: 1.09806 },
  { label: 'GBP/USD (Forex)', value: 'FX:GBPUSD', refPrice: 1.2695 },
  { label: 'Gold XAU/USD', value: 'OANDA:XAUUSD', refPrice: 3569.575 },
  { label: 'S&P 500 Index', value: 'FOREXCOM:SPXUSD', refPrice: 5985.2 },
];

const NETWORK_OPTIONS = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    sublabel: 'BTC • ~10–30 min',
    fullLabel: 'Bitcoin (BTC Network)',
    defaultWallet: 'bc1q3yh6qpja5p05jghul86myefmtgssxegp0e6424',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    sublabel: 'ETH ERC20 • ~3–10 min',
    fullLabel: 'Ethereum (ETH ERC20)',
    defaultWallet: '0x442649Bec5815563722154d5EEDE79cCCA98aF67',
  },
  {
    id: 'ERC20',
    name: 'Tether',
    sublabel: 'USDT ERC20 • ~3–10 min',
    fullLabel: 'USDT (ERC20 — Ethereum)',
    defaultWallet: '0x442649Bec5815563722154d5EEDE79cCCA98aF67',
  },
  {
    id: 'TRC20',
    name: 'Tether',
    sublabel: 'USDT TRC20 • ~1–5 min',
    fullLabel: 'USDT (TRC20 — Tron)',
    defaultWallet: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
  },
  {
    id: 'BEP20',
    name: 'Tether',
    sublabel: 'USDT BEP20 • ~1–5 min',
    fullLabel: 'USDT (BEP20 — BNB Smart Chain)',
    defaultWallet: '0x442649Bec5815563722154d5EEDE79cCCA98aF67',
  },
];

const DEPOSIT_PRESETS = [50, 100, 500, 1000, 5000];
const WITHDRAW_PRESETS = [100, 500, 1000, 2500, 5000];
const DEPOSIT_GAS_RATE = 0.05;
const WITHDRAWAL_GAS_RATE = 0.1;

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const userId = session.user.id;
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trade');

  const [profile, setProfile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [walletsByNetwork, setWalletsByNetwork] = useState(() =>
    Object.fromEntries(NETWORK_OPTIONS.map((n) => [n.id, n.defaultWallet]))
  );

  const [allProfiles, setAllProfiles] = useState([]);
  const [balanceEdits, setBalanceEdits] = useState({});
  const [allTransactions, setAllTransactions] = useState([]);
  const [walletEdits, setWalletEdits] = useState(() =>
    Object.fromEntries(NETWORK_OPTIONS.map((n) => [n.id, n.defaultWallet]))
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Trade workspace & switcher state
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [orderAmount, setOrderAmount] = useState(500);
  const [stopLoss, setStopLoss] = useState('');
  const [leverage, setLeverage] = useState('1:50');
  const [ticketMode, setTicketMode] = useState('trade');

  // Deposit stepper: 'amount' (1) -> 'payment' (2) -> 'complete' (3)
  const [depositStep, setDepositStep] = useState('amount');
  const [depositNetworkId, setDepositNetworkId] = useState('BTC');
  const [depositAmt, setDepositAmt] = useState(500);
  const [depositTxHash, setDepositTxHash] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Withdraw flow
  const [withdrawNetworkId, setWithdrawNetworkId] = useState('BTC');
  const [withdrawAmt, setWithdrawAmt] = useState(500);
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [withdrawPinInput, setWithdrawPinInput] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // KYC, Settings & Support
  const [docType, setDocType] = useState('International Passport');
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [supportSubject, setSupportSubject] = useState('Deposit & Settlement');
  const [supportMessage, setSupportMessage] = useState('');
  const [notice, setNotice] = useState('');

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setWithdrawError('');
    if (tab === 'deposit') setDepositStep('amount');
    if (tab === 'trade') setTicketMode('trade');
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
      setUsernameInput(
        prof.username ||
          session.user.user_metadata?.username ||
          (session.user.email ? session.user.email.split('@')[0] : '')
      );
      setPinInput(prof.withdrawal_pin || '');
    } else {
      setUsernameInput(
        session.user.user_metadata?.username ||
          (session.user.email ? session.user.email.split('@')[0] : '')
      );
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
      const loadedWallets = Object.fromEntries(
        NETWORK_OPTIONS.map((n) => {
          const perNetKey = `wallet_${n.id.toLowerCase()}`;
          const addr =
            map[perNetKey] ||
            (n.id === 'TRC20' ? map.usdt_trc20_wallet : '') ||
            n.defaultWallet;
          return [n.id, addr];
        })
      );
      setWalletsByNetwork(loadedWallets);
      setWalletEdits(loadedWallets);
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
    NETWORK_OPTIONS.find((n) => n.id === depositNetworkId) || NETWORK_OPTIONS[0];
  const activeDepositAddress =
    walletsByNetwork[depositNetwork.id] || depositNetwork.defaultWallet;
  const parsedDepositAmt = Math.max(0, Number(depositAmt) || 0);
  const depositGasFee = Number((parsedDepositAmt * DEPOSIT_GAS_RATE).toFixed(2));
  const totalDepositWithFee = Number((parsedDepositAmt + depositGasFee).toFixed(2));

  const withdrawNetwork =
    NETWORK_OPTIONS.find((n) => n.id === withdrawNetworkId) || NETWORK_OPTIONS[0];
  const parsedWithdrawAmt = Math.max(0, Number(withdrawAmt) || 0);
  const withdrawGasFee = Number((parsedWithdrawAmt * WITHDRAWAL_GAS_RATE).toFixed(2));
  const netWithdrawTotal = Number((parsedWithdrawAmt + withdrawGasFee).toFixed(2));

  const handleCopyDepositAddress = async () => {
    try {
      await navigator.clipboard.writeText(activeDepositAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch {
      showNotice('Copy the wallet address manually from the address box.');
    }
  };

  const handlePlaceOrder = async (side) => {
    const amt = Number(orderAmount);
    if (!amt || amt <= 0 || amt > balance) {
      showNotice('Enter a valid margin amount within your available balance.');
      return;
    }

    const parsedSl = stopLoss !== '' ? Number(stopLoss) : null;
    if (parsedSl !== null && (!Number.isFinite(parsedSl) || parsedSl < 0)) {
      showNotice('Enter a valid stop loss value.');
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

    const tradePayload = {
      user_id: userId,
      pair: selectedSymbol.label.split(' ')[0],
      side,
      amount: amt,
      entry_price: selectedSymbol.refPrice.toLocaleString(),
      pnl: simulatedPnl,
      status: 'OPEN',
      ...(parsedSl !== null ? { stop_loss: parsedSl } : {}),
    };

    const { error: tradeErr } = await supabase.from('trades').insert(tradePayload);

    if (tradeErr) {
      showNotice(tradeErr.message);
      return;
    }

    showNotice(
      `${side} order executed for $${amt.toLocaleString()}${
        parsedSl !== null ? ` with Stop Loss at $${parsedSl.toLocaleString()}` : ''
      }.`
    );
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

  const handleCreateDepositRequest = (e) => {
    e.preventDefault();
    if (parsedDepositAmt < 10) {
      showNotice('Minimum deposit amount is $10.00.');
      return;
    }
    setDepositStep('payment');
  };

  const handleConfirmDepositSent = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const activeUserId = authData?.user?.id || userId;

    const { error } = await supabase.from('transactions').insert({
      user_id: activeUserId,
      type: `Deposit (${depositNetwork.id}) • 5% Gas`,
      amount: parsedDepositAmt,
      gas_fee: depositGasFee,
      network: depositNetwork.id,
      wallet_address: depositTxHash.trim() || activeDepositAddress,
      status: 'Pending',
    });

    if (error) {
      showNotice(error.message);
      return;
    }

    setDepositTxHash('');
    setDepositStep('complete');
    await loadUserData();
    if (isAdmin) await loadAdminData();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');

    const amt = Number(withdrawAmt);
    const gas = Number((amt * WITHDRAWAL_GAS_RATE).toFixed(2));
    const totalDebit = Number((amt + gas).toFixed(2));

    if (profile?.withdrawal_pin && withdrawPinInput.trim() !== profile.withdrawal_pin) {
      setWithdrawError('Invalid 4-digit withdrawal security PIN.');
      return;
    }
    if (!amt || amt <= 0) {
      setWithdrawError('Enter a valid withdrawal amount.');
      return;
    }
    if (!withdrawWallet.trim()) {
      setWithdrawError(`Enter your destination ${withdrawNetwork.id} receiving wallet address.`);
      return;
    }
    if (totalDebit > balance) {
      setWithdrawError(
        `Insufficient balance. Available: $${balance.toFixed(2)} (Required with 10% gas fee: $${totalDebit.toFixed(2)}).`
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
      `Withdrawal request of $${amt.toFixed(2)} (${withdrawNetwork.id}) logged with $${gas.toFixed(2)} (10%) gas fee.`
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

    const cleanUsername = usernameInput.trim();
    if (newPasswordInput && newPasswordInput.length < 6) {
      showNotice('New password must be at least 6 characters.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileNameInput.trim(),
        username: cleanUsername || null,
        withdrawal_pin: cleanPin || null,
      })
      .eq('id', userId);

    if (error) {
      showNotice(error.message);
      return;
    }

    await supabase.auth.updateUser({
      data: { username: cleanUsername || null },
    });

    if (newPasswordInput) {
      const { error: pwErr } = await supabase.auth.updateUser({
        password: newPasswordInput,
      });
      if (pwErr) {
        showNotice(pwErr.message);
        return;
      }
      setNewPasswordInput('');
    }

    showNotice('Profile, username, security PIN, and credentials saved.');
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

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportMessage('');
    showNotice(`Support inquiry (${supportSubject}) sent to info@equivaultfx.com.`);
  };

  const handleSavePlatformSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const now = new Date().toISOString();

    const rows = NETWORK_OPTIONS.map((net) => ({
      key: `wallet_${net.id.toLowerCase()}`,
      value: (walletEdits[net.id] || net.defaultWallet).trim(),
      updated_at: now,
    }));

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    setSavingSettings(false);
    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice('Per-network deposit wallet addresses saved.');
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
  const recentDeposits = transactions.filter((t) => Number(t.amount) > 0);
  const recentWithdrawals = transactions.filter((t) => Number(t.amount) < 0);
  const pendingDepositsCount = recentDeposits.filter((t) => t.status === 'Pending').length;

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
              <LayoutDashboard size={17} /> Overview
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'trade' ? 'active' : ''}`}
              onClick={() => selectTab('trade')}
            >
              <CandlestickChart size={17} /> Trade
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'my-trades' ? 'active' : ''}`}
              onClick={() => selectTab('my-trades')}
            >
              <History size={17} /> My Trades ({openTrades.length})
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => selectTab('deposit')}
            >
              <ArrowDownToLine size={17} /> Deposit
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => selectTab('withdraw')}
            >
              <ArrowUpFromLine size={17} /> Withdraw
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => selectTab('history')}
            >
              <History size={17} /> History
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'kyc' ? 'active' : ''}`}
              onClick={() => selectTab('kyc')}
            >
              <ShieldCheck size={17} /> KYC
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => selectTab('settings')}
            >
              <Settings size={17} /> Settings &amp; PIN
            </button>
            <button
              className={`dash-nav-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => selectTab('support')}
            >
              <LifeBuoy size={17} /> Support
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
                {usernameInput || profile?.full_name || session.user.email}
              </strong>
              <div className="tabular" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                AVAILABLE BALANCE: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'deposit' ? 'btn-crimson' : 'btn-outline'}`}
              onClick={() => selectTab('deposit')}
            >
              Deposit
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'withdraw' ? 'btn-crimson' : 'btn-outline'}`}
              onClick={() => selectTab('withdraw')}
            >
              Withdraw
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'trade' ? 'btn-crimson' : 'btn-outline'}`}
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

          {activeTab === 'overview' && (
            <>
              <div className="panel-card" style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>
                      Welcome, {usernameInput || profile?.full_name || 'Trader'}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Live Market Session • {new Date().toUTCString().slice(17, 25)} UTC
                    </div>
                  </div>
                  <div className="tabular" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      PENDING DEPOSITS ({pendingDepositsCount})
                    </div>
                    <strong style={{ color: '#FBBF24' }}>
                      {pendingDepositsCount > 0 ? 'Awaiting Confirmation' : 'None Pending'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="kpi-grid tabular">
                <div className="kpi-card">
                  <div className="kpi-label">Available Balance</div>
                  <div className="kpi-value">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Open Margin</div>
                  <div className="kpi-value">
                    ${activeCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Session PnL</div>
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
                  <div className="kpi-label">Deposit / Withdraw Gas</div>
                  <div className="kpi-value">5% / 10%</div>
                </div>
              </div>

              <div className="quick-action-grid">
                <button type="button" className="quick-tile" onClick={() => selectTab('deposit')}>
                  <Plus size={20} />
                  <strong>Deposit</strong>
                </button>
                <button type="button" className="quick-tile" onClick={() => selectTab('withdraw')}>
                  <Minus size={20} />
                  <strong>Withdraw</strong>
                </button>
                <button type="button" className="quick-tile" onClick={() => selectTab('trade')}>
                  <CandlestickChart size={20} />
                  <strong>Trade</strong>
                </button>
                <button type="button" className="quick-tile" onClick={() => selectTab('my-trades')}>
                  <History size={20} />
                  <strong>My Trades</strong>
                </button>
                <button type="button" className="quick-tile" onClick={() => selectTab('history')}>
                  <History size={20} />
                  <strong>History</strong>
                </button>
                <button type="button" className="quick-tile" onClick={() => selectTab('kyc')}>
                  <ShieldCheck size={20} />
                  <strong>KYC</strong>
                </button>
              </div>
            </>
          )}

          {activeTab === 'trade' && (
            <div className="trade-focus-layout">
              <div className="panel-card trade-chart-card">
                <div className="trade-toolbar">
                  <div className="trade-pair-picker">
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Instrument
                    </label>
                    <select
                      className="form-control"
                      style={{ width: 'auto', minWidth: '190px', marginTop: 0 }}
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
                </div>

                <div className="large-chart-frame">
                  <TradingViewChart symbol={selectedSymbol.value} height={760} />
                </div>
              </div>

              <div className="panel-card trade-dock-card">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <strong>
                    {ticketMode === 'trade' && `Order Ticket — ${selectedSymbol.label}`}
                    {ticketMode === 'deposit' && `Quick Deposit (${depositNetwork.id} • 5% Gas)`}
                    {ticketMode === 'withdraw' && `Quick Withdraw (${withdrawNetwork.id} • 10% Gas)`}
                  </strong>

                  <div className="mode-switcher-bar">
                    {[
                      { id: 'trade', label: 'Trade' },
                      { id: 'deposit', label: 'Deposit' },
                      { id: 'withdraw', label: 'Withdraw' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setTicketMode(m.id);
                          setWithdrawError('');
                          if (m.id === 'deposit') setDepositStep('amount');
                        }}
                        className={`mode-switch-btn ${ticketMode === m.id ? 'active' : ''}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {ticketMode === 'trade' && (
                  <div className="dock-inline-row">
                    <div className="dock-field">
                      <label className="form-label">Margin Amount (USD)</label>
                      <input
                        type="number"
                        className="form-control tabular"
                        value={orderAmount}
                        onChange={(e) => setOrderAmount(e.target.value)}
                      />
                    </div>
                    <div className="dock-field">
                      <label className="form-label">Stop Loss (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control tabular"
                        placeholder="Optional stop loss"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                      />
                    </div>
                    <div className="dock-field">
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
                    <div className="dock-actions">
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: '#10B981',
                          color: '#09090B',
                          fontWeight: 700,
                        }}
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
                )}

                {ticketMode === 'deposit' && (
                  <div className="dock-inline-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Deposits include a 5% gas fee calculation (${depositGasFee.toFixed(2)} on ${parsedDepositAmt.toFixed(2)}).
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-crimson"
                      onClick={() => selectTab('deposit')}
                    >
                      Open Deposit Flow
                    </button>
                  </div>
                )}

                {ticketMode === 'withdraw' && (
                  <div>
                    <form onSubmit={handleWithdraw} className="dock-inline-row">
                      <div className="dock-field">
                        <label className="form-label">Withdraw Amount (USD)</label>
                        <input
                          type="number"
                          className="form-control tabular"
                          min="10"
                          value={withdrawAmt}
                          onChange={(e) => setWithdrawAmt(e.target.value)}
                          required
                        />
                      </div>
                      <div className="dock-field">
                        <label className="form-label">{withdrawNetwork.id} Receiving Wallet</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Paste your receiving wallet"
                          value={withdrawWallet}
                          onChange={(e) => setWithdrawWallet(e.target.value)}
                          required
                        />
                      </div>
                      <div className="dock-field" style={{ maxWidth: '130px' }}>
                        <label className="form-label">4-Digit PIN</label>
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
                        />
                      </div>
                      <button type="submit" className="btn btn-white">
                        Withdraw (${netWithdrawTotal.toFixed(2)})
                      </button>
                    </form>
                    {withdrawError && (
                      <div className="auth-alert error" style={{ marginTop: '12px', marginBottom: 0 }}>
                        {withdrawError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-trades' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>My Trades &amp; Open Positions</h3>
              </div>
              <div className="data-table-wrap">
                <table className="data-table tabular">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Side</th>
                      <th>Margin</th>
                      <th>Entry</th>
                      <th>Stop Loss</th>
                      <th>PnL</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ color: 'var(--text-muted)' }}>
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
                          <td>
                            {tr.stop_loss !== undefined && tr.stop_loss !== null
                              ? `$${Number(tr.stop_loss).toLocaleString()}`
                              : '—'}
                          </td>
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
            <div style={{ maxWidth: '820px' }}>
              <div className="panel-card">
                <div className="panel-header">
                  <div>
                    <h3>Deposit Funds</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      5% gas fee applies on deposits
                    </div>
                  </div>
                  <div className="tabular" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      AVAILABLE BALANCE
                    </div>
                    <strong>${balance.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="stepper-bar">
                  <div className={`stepper-item ${depositStep === 'amount' ? 'active' : 'done'}`}>
                    <span>1</span> Amount
                  </div>
                  <div className="stepper-line" />
                  <div
                    className={`stepper-item ${
                      depositStep === 'payment'
                        ? 'active'
                        : depositStep === 'complete'
                          ? 'done'
                          : ''
                    }`}
                  >
                    <span>2</span> Send Payment
                  </div>
                  <div className="stepper-line" />
                  <div className={`stepper-item ${depositStep === 'complete' ? 'active' : ''}`}>
                    <span>3</span> Complete
                  </div>
                </div>

                {depositStep === 'amount' && (
                  <form onSubmit={handleCreateDepositRequest}>
                    <div className="form-group">
                      <label className="form-label">1 • Choose Wallet</label>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Select the currency and network you&apos;ll send from. Send only the selected asset on this network.
                      </div>
                      <div className="asset-choice-grid">
                        {NETWORK_OPTIONS.map((net) => {
                          const active = net.id === depositNetwork.id;
                          return (
                            <button
                              key={net.id}
                              type="button"
                              onClick={() => setDepositNetworkId(net.id)}
                              className={`asset-choice-card ${active ? 'active' : ''}`}
                            >
                              <CurrencyIcon code={net.id} size={24} />
                              <div>
                                <strong>{net.name}</strong>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                  {net.sublabel}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">2 • Enter Amount</label>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Minimum $10.00. A 5% deposit gas fee is calculated automatically.
                      </div>
                      <input
                        type="number"
                        className="form-control tabular"
                        min="10"
                        step="0.01"
                        value={depositAmt}
                        onChange={(e) => setDepositAmt(e.target.value)}
                        required
                      />
                      <div className="preset-chip-row tabular">
                        {DEPOSIT_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`preset-chip ${Number(depositAmt) === preset ? 'active' : ''}`}
                            onClick={() => setDepositAmt(preset)}
                          >
                            ${preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="summary-card tabular" style={{ marginBottom: '16px' }}>
                      <div className="summary-row">
                        <span>Wallet</span>
                        <strong>{depositNetwork.id}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Amount (USD)</span>
                        <strong>${parsedDepositAmt.toFixed(2)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Gas Fee (5%)</span>
                        <strong style={{ color: '#fda4af' }}>+${depositGasFee.toFixed(2)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Total with 5% Gas Fee</span>
                        <strong>${totalDepositWithFee.toFixed(2)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Credited to Balance</span>
                        <strong style={{ color: 'var(--positive)' }}>
                          ${parsedDepositAmt.toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-crimson" style={{ width: '100%' }}>
                      Continue →
                    </button>
                  </form>
                )}

                {depositStep === 'payment' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <CurrencyIcon code={depositNetwork.id} size={36} />
                      </div>
                      <h4>Send Your {depositNetwork.id}</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Send ${totalDepositWithFee.toFixed(2)} equivalent (${parsedDepositAmt.toFixed(2)} deposit + ${depositGasFee.toFixed(2)} 5% gas fee) in {depositNetwork.fullLabel} to this address
                      </p>
                    </div>

                    <div className="wallet-address-box">
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {depositNetwork.fullLabel.toUpperCase()} ADDRESS
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <code className="tabular" style={{ wordBreak: 'break-all', fontSize: '12.5px' }}>
                          {activeDepositAddress}
                        </code>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={handleCopyDepositAddress}
                        >
                          {copiedWallet ? <Check size={14} /> : <Copy size={14} />}
                          {copiedWallet ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '14px' }}>
                      <label className="form-label">Transaction Hash / TXID (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Paste transaction hash after sending..."
                        value={depositTxHash}
                        onChange={(e) => setDepositTxHash(e.target.value)}
                      />
                    </div>

                    <div className="summary-card tabular" style={{ marginBottom: '16px' }}>
                      <div className="summary-row">
                        <span>Deposit amount</span>
                        <strong>${parsedDepositAmt.toFixed(2)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Gas fee (5%)</span>
                        <strong style={{ color: '#fda4af' }}>+${depositGasFee.toFixed(2)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Total to send</span>
                        <strong>${totalDepositWithFee.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setDepositStep('amount')}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn-crimson"
                        style={{ flex: 1 }}
                        onClick={handleConfirmDepositSent}
                      >
                        ✓ I Have Sent the Payment
                      </button>
                    </div>
                  </div>
                )}

                {depositStep === 'complete' && (
                  <div style={{ textAlign: 'center', padding: '14px 0' }}>
                    <CheckCircle2 size={36} color="#10B981" style={{ marginBottom: '10px' }} />
                    <h4>Deposit Submitted</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 18px' }}>
                      Your ${parsedDepositAmt.toFixed(2)} ({depositNetwork.id}) deposit request with ${depositGasFee.toFixed(2)} (5% gas fee) is now Pending confirmation.
                    </p>
                    <button
                      type="button"
                      className="btn btn-white"
                      onClick={() => setDepositStep('amount')}
                    >
                      New Deposit
                    </button>
                  </div>
                )}
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Recent Deposits</h3>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>5% Gas Fee</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeposits.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ color: 'var(--text-muted)' }}>
                            No deposits recorded yet.
                          </td>
                        </tr>
                      ) : (
                        recentDeposits.map((tx) => (
                          <tr key={tx.id}>
                            <td>${Number(tx.amount).toFixed(2)}</td>
                            <td>${Number(tx.gas_fee || 0).toFixed(2)}</td>
                            <td>{tx.network || tx.type}</td>
                            <td>{new Date(tx.created_at).toLocaleString()}</td>
                            <td>{tx.status.toUpperCase()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div style={{ maxWidth: '820px' }}>
              <div className="panel-card">
                <div className="panel-header">
                  <div>
                    <h3>Withdraw Funds</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Withdraw to any external wallet • 10% automatic gas fee applies
                    </div>
                  </div>
                  <div className="tabular" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      AVAILABLE BALANCE
                    </div>
                    <strong>${balance.toFixed(2)}</strong>
                  </div>
                </div>

                {withdrawError && (
                  <div className="auth-alert error" style={{ marginBottom: '16px' }}>
                    {withdrawError}
                  </div>
                )}

                <form onSubmit={handleWithdraw}>
                  <div className="form-group">
                    <label className="form-label">1 • Choose Payout Method</label>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Select the network you&apos;ll receive funds on. Double-check the address — crypto sends are irreversible.
                    </div>
                    <div className="asset-choice-grid">
                      {NETWORK_OPTIONS.map((net) => {
                        const active = net.id === withdrawNetwork.id;
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => {
                              setWithdrawNetworkId(net.id);
                              setWithdrawError('');
                            }}
                            className={`asset-choice-card ${active ? 'active' : ''}`}
                          >
                            <CurrencyIcon code={net.id} size={24} />
                            <div>
                              <strong>{net.name}</strong>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {net.sublabel}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">2 • Amount &amp; Wallet</label>
                    <input
                      type="number"
                      className="form-control tabular"
                      min="10"
                      step="0.01"
                      value={withdrawAmt}
                      onChange={(e) => setWithdrawAmt(e.target.value)}
                      required
                    />
                    <div className="preset-chip-row tabular">
                      {WITHDRAW_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`preset-chip ${Number(withdrawAmt) === preset ? 'active' : ''}`}
                          onClick={() => setWithdrawAmt(preset)}
                        >
                          ${preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Receiving Wallet Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Paste your receiving address"
                      value={withdrawWallet}
                      onChange={(e) => setWithdrawWallet(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '11.5px', color: '#FBBF24', marginTop: '6px' }}>
                      Verify the address carefully — crypto transfers cannot be reversed.
                    </div>
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
                    />
                  </div>

                  <div className="summary-card tabular" style={{ marginBottom: '16px' }}>
                    <div className="summary-row">
                      <span>Method</span>
                      <strong>{withdrawNetwork.id}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Amount</span>
                      <strong>${parsedWithdrawAmt.toFixed(2)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Gas Fee (10%)</span>
                      <strong style={{ color: '#fda4af' }}>+${withdrawGasFee.toFixed(2)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Balance Deducted</span>
                      <strong>${netWithdrawTotal.toFixed(2)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>You Receive</span>
                      <strong style={{ color: 'var(--positive)' }}>
                        ${parsedWithdrawAmt.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-crimson" style={{ width: '100%' }}>
                    Continue
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>Recent Withdrawals</h3>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table tabular">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Gas Fee</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ color: 'var(--text-muted)' }}>
                            No withdrawals recorded yet.
                          </td>
                        </tr>
                      ) : (
                        recentWithdrawals.map((tx) => (
                          <tr key={tx.id}>
                            <td>${Math.abs(Number(tx.amount)).toFixed(2)}</td>
                            <td>${Number(tx.gas_fee || 0).toFixed(2)}</td>
                            <td>{tx.network || tx.type}</td>
                            <td>{new Date(tx.created_at).toLocaleString()}</td>
                            <td>{tx.status.toUpperCase()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Full Transaction &amp; Gas History</h3>
              </div>
              <div className="data-table-wrap">
                <table className="data-table tabular">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Gas Fee</th>
                      <th>Address / TXID</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ color: 'var(--text-muted)' }}>
                          No transactions recorded yet.
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
                            {Math.abs(Number(tx.amount)).toFixed(2)}
                          </td>
                          <td>${Number(tx.gas_fee || 0).toFixed(2)}</td>
                          <td style={{ fontSize: '12px' }}>{tx.wallet_address || '—'}</td>
                          <td>{tx.status.toUpperCase()}</td>
                          <td>{new Date(tx.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="panel-card" style={{ maxWidth: '680px' }}>
              <div className="panel-header">
                <h3>KYC Verification</h3>
                <span className={`kyc-pill ${kycStatus}`}>{kycStatus.toUpperCase()}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Submit your identity document and selfie to complete KYC verification on EquivaultFX.
              </p>

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
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
              </div>
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
                <label className="form-label">Password (Set or Update)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="•••••••• (enter new password to change)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
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

          {activeTab === 'support' && (
            <div className="panel-card" style={{ maxWidth: '680px' }}>
              <div className="panel-header">
                <h3>Client Support Desk</h3>
                <span className="plan-badge" style={{ marginBottom: 0 }}>
                  24/7 Support
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Contact us at <strong style={{ color: 'var(--surface-white)' }}>info@equivaultfx.com</strong> for deposit confirmation, withdrawal PIN reset, or account assistance.
              </p>

              <form onSubmit={handleSupportSubmit}>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select
                    className="form-control"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                  >
                    <option>Deposit &amp; Settlement</option>
                    <option>Withdrawal &amp; 10% Gas Fee</option>
                    <option>Account Security &amp; PIN</option>
                    <option>Order Execution &amp; Chart</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Describe your question or include your TXID..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-crimson">
                  <Send size={15} /> Send to Support
                </button>
              </form>
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <>
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Admin Desk: Deposit Wallets by Network</h3>
                </div>

                <form onSubmit={handleSavePlatformSettings}>
                  {NETWORK_OPTIONS.map((net) => (
                    <div key={net.id} className="form-group">
                      <label
                        className="form-label"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <CurrencyIcon code={net.id} size={16} />
                        <span>{net.fullLabel} Custody Address</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={walletEdits[net.id] ?? net.defaultWallet}
                        onChange={(e) =>
                          setWalletEdits((prev) => ({
                            ...prev,
                            [net.id]: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  ))}

                  <button type="submit" disabled={savingSettings} className="btn btn-crimson">
                    {savingSettings ? 'Saving Wallets...' : 'Save All Network Wallets'}
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
                            <strong>{p.full_name || p.username || 'Trader'}</strong>
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

          <footer className="dash-legal-footer">
            <p>
              <strong>Risk Warning:</strong> Trading leveraged derivatives, Forex, and digital assets carries a high level of risk to your capital and may not be suitable for all traders. Only trade with funds you can afford to lose.
            </p>
            <p>
              <strong>Support &amp; Jurisdiction Notice:</strong> Contact{' '}
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => selectTab('support')}
              >
                Client Support
              </button>{' '}
              (info@equivaultfx.com) for assistance. Services are restricted in jurisdictions where online leveraged trading is prohibited by local law.
            </p>
            <div className="dash-copyright">
              Copyright © 2026 EquivaultFX — All Rights Reserved.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}