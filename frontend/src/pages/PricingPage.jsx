import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Check, Crown, Gift, Headphones, Lock, ShieldCheck,
  Sparkles, TrendingUp, Zap, CreditCard, Building2, Mail, Phone, ChevronRight
} from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';

const BILLING_MONTHS = [1, 3, 6, 9, 12];

export const PRICING_PLANS = [
  {
    id: 'free',
    title: 'Free',
    subtitle: 'For everyone, always free.',
    usdMonthly: '$0',
    idrMonthly: 'Rp 0',
    quotaLabel: '1x posting per day',
    features: [
      '1x posting per day',
      'Post: Poster, Video, Shop, Link, Hashtags, Location',
    ],
    referralNote: 'Invite friends & get up to 3x/day (1 month)',
    blue: false,
    periods: null,
  },
  {
    id: 'tier_3',
    title: '3x per Day',
    subtitle: 'For casual creators.',
    popular: true,
    usdMonthly: '$4.99',
    idrMonthly: 'Rp 69.000',
    quotaLabel: '3x posting per day',
    features: ['3x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    periods: {
      1: { usd: '$4.99', idr: 'Rp 69.000' },
      3: { usd: '$14.99', idr: 'Rp 207.000' },
      6: { usd: '$24.99', idr: 'Rp 414.000' },
      9: { usd: '$35.99', idr: 'Rp 621.000' },
      12: { usd: '$47.99', idr: 'Rp 828.000' },
    },
  },
  {
    id: 'tier_6',
    title: '6x per Day',
    subtitle: 'For growing accounts.',
    usdMonthly: '$9.99',
    idrMonthly: 'Rp 129.900',
    quotaLabel: '6x posting per day',
    features: ['6x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    periods: {
      1: { usd: '$9.99', idr: 'Rp 129.900' },
      3: { usd: '$29.99', idr: 'Rp 389.700' },
      6: { usd: '$59.99', idr: 'Rp 779.400' },
      9: { usd: '$89.99', idr: 'Rp 1.169.100' },
      12: { usd: '$119.99', idr: 'Rp 1.558.800' },
    },
  },
  {
    id: 'tier_9',
    title: '9x per Day',
    subtitle: 'For professional creators.',
    usdMonthly: '$12.99',
    idrMonthly: 'Rp 159.900',
    quotaLabel: '9x posting per day',
    features: ['9x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    periods: {
      1: { usd: '$12.99', idr: 'Rp 159.900' },
      3: { usd: '$35.99', idr: 'Rp 479.700' },
      6: { usd: '$69.99', idr: 'Rp 959.400' },
      9: { usd: '$99.99', idr: 'Rp 1.439.100' },
      12: { usd: '$139.99', idr: 'Rp 1.918.800' },
    },
  },
  {
    id: 'tier_12',
    title: '12x per Day',
    subtitle: 'For businesses & brands.',
    usdMonthly: '$19.99',
    idrMonthly: 'Rp 299.000',
    quotaLabel: '12x posting per day',
    features: ['12x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Location'],
    blue: true,
    periods: {
      1: { usd: '$19.99', idr: 'Rp 299.000' },
      3: { usd: '$59.99', idr: 'Rp 897.000' },
      6: { usd: '$119.99', idr: 'Rp 1.794.000' },
      9: { usd: '$159.99', idr: 'Rp 2.961.000' },
      12: { usd: '$199.99', idr: 'Rp 3.588.000' },
    },
  },
  {
    id: 'tier_15',
    title: '15x per Day',
    subtitle: 'For advanced marketers.',
    usdMonthly: '$24.99',
    idrMonthly: 'Rp 366.000',
    quotaLabel: '15x posting per day',
    features: ['15x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    periods: {
      1: { usd: '$24.99', idr: 'Rp 366.000' },
      3: { usd: '$69.99', idr: 'Rp 1.098.000' },
      6: { usd: '$119.99', idr: 'Rp 2.196.000' },
      9: { usd: '$179.99', idr: 'Rp 3.294.000' },
      12: { usd: '$239.99', idr: 'Rp 4.392.000' },
    },
  },
  {
    id: 'tier_18',
    title: '18x per Day',
    subtitle: 'For elite creators.',
    usdMonthly: '$39.99',
    idrMonthly: 'Rp 599.000',
    quotaLabel: '18x posting per day',
    features: ['18x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    periods: {
      1: { usd: '$39.99', idr: 'Rp 599.000' },
      3: { usd: '$99.99', idr: 'Rp 1.797.000' },
      6: { usd: '$199.99', idr: 'Rp 3.594.000' },
      9: { usd: '$299.99', idr: 'Rp 5.391.000' },
      12: { usd: '$399.99', idr: 'Rp 7.188.000' },
    },
  },
  {
    id: 'tier_21',
    title: '21x & 24x per Day',
    subtitle: 'For maximum growth.',
    eliteGlow: true,
    usdMonthly: '$49.99',
    idrMonthly: 'Rp 699.000',
    quotaLabel: '21x / 24x posting per day',
    features: ['21x / 24x posting per day', 'Verified Badge', 'Poster, Video, Shop, Link, Hashtags, Location'],
    blue: true,
    variants: {
      tier_21: {
        label: '21x / Day',
        usdMonthly: '$49.99',
        idrMonthly: 'Rp 699.000',
        quotaLabel: '21x posting per day',
        periods: {
          1: { usd: '$49.99', idr: 'Rp 699.000' },
          3: { usd: '$129.99', idr: 'Rp 2.097.000' },
          6: { usd: '$249.99', idr: 'Rp 4.194.000' },
          9: { usd: '$349.99', idr: 'Rp 6.291.000' },
          12: { usd: '$449.99', idr: 'Rp 8.388.000' },
        },
      },
      tier_24: {
        label: '24x / Day',
        usdMonthly: '$59.99',
        idrMonthly: 'Rp 799.000',
        quotaLabel: '24x posting per day',
        periods: {
          1: { usd: '$59.99', idr: 'Rp 799.000' },
          3: { usd: '$159.99', idr: 'Rp 2.397.000' },
          6: { usd: '$299.99', idr: 'Rp 4.794.000' },
          9: { usd: '$429.99', idr: 'Rp 7.191.000' },
          12: { usd: '$549.99', idr: 'Rp 9.588.000' },
        },
      },
    },
  },
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit Card', desc: 'Visa, Mastercard, American Express', fullWidth: true, badge: 'VISA • MC • AMEX' },
  { id: 'paypal', name: 'PayPal', desc: 'Pay with PayPal', badge: 'P' },
  { id: 'gpay', name: 'Google Pay', desc: 'Pay with Google Pay', badge: 'G Pay' },
  { id: 'dana', name: 'DANA', desc: 'Pay with DANA', badge: 'DANA' },
  { id: 'va', name: 'Virtual Account', desc: 'Bank BCA, BNI, BRI, Mandiri, dll', badge: 'VA' },
  { id: 'doku', name: 'DOKU', desc: 'Pay with DOKU', badge: 'DOKU' },
  { id: 'transfer', name: 'Bank Transfer', desc: 'Via Bank Indonesia', badge: 'BANK' },
];

export default function PricingPage() {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('IDR');
  const [selectedMonths, setSelectedMonths] = useState({
    tier_3: 1, tier_6: 1, tier_9: 1, tier_12: 1, tier_15: 1, tier_18: 1, tier_21: 1, tier_24: 1,
  });
  const [maxVariant, setMaxVariant] = useState(user?.subscription_plan === 'tier_24' ? 'tier_24' : 'tier_21');
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutMonths, setCheckoutMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [billingPhone, setBillingPhone] = useState(user?.phone || '');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const currentPlanId = user?.subscription_plan || 'free';

  const openCheckout = (planId, months) => {
    setNotice(null);
    setCheckoutPlan(planId);
    setCheckoutMonths(months || 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFree = async () => {
    if (busy) return;
    if (currentPlanId === 'free') {
      navigate('/');
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const updated = await userApi.updateSettings({ subscription_plan: 'free', subscription_months: 1 });
      updateProfileState(updated);
      setNotice({ type: 'ok', text: 'Langganan dihentikan: Centang Biru dinonaktifkan dan akun kembali ke Free (1x posting/hari).' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.response?.data?.error || 'Gagal mengubah paket.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (busy || !checkoutPlan) return;
    if (!agreeTerms) {
      setNotice({ type: 'error', text: 'Harap setujui Terms of Service dan Privacy Policy.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const updated = await userApi.updateSettings({
        subscription_plan: checkoutPlan,
        subscription_months: checkoutMonths,
        payment_method: paymentMethod,
      });
      updateProfileState(updated);
      setNotice({
        type: 'ok',
        text: `Berhasil berlangganan paket ${checkoutPlan.replace('tier_', '')}x/hari (${checkoutMonths} bulan) via ${PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}. Centang Biru telah aktif!`,
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text: err?.response?.data?.error || 'Pembayaran berlangganan membutuhkan verifikasi Payment Gateway / Admin.',
      });
    } finally {
      setBusy(false);
    }
  };

  const resolveCheckoutCard = () => {
    if (!checkoutPlan) return null;
    if (checkoutPlan === 'tier_21' || checkoutPlan === 'tier_24') {
      const base = PRICING_PLANS.find((p) => p.id === 'tier_21');
      const v = base.variants[checkoutPlan];
      return { ...base, id: checkoutPlan, title: v.label, usdMonthly: v.usdMonthly, idrMonthly: v.idrMonthly, quotaLabel: v.quotaLabel, periods: v.periods };
    }
    return PRICING_PLANS.find((p) => p.id === checkoutPlan);
  };

  const activeCheckout = resolveCheckoutCard();

  return (
    <AppLayout currentTab="pricing" wide>
      <div className="min-h-[85vh] rounded-3xl bg-[#0a0b10] text-white p-5 sm:p-8 lg:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Ambient Glow Background */}
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-indigo-600/25 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-purple-600/20 blur-[120px]" />

        {notice && (
          <div className={`relative z-10 mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${notice.type === 'ok' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200' : 'border-rose-500/40 bg-rose-500/15 text-rose-200'}`}>
            {notice.text}
          </div>
        )}

        {activeCheckout ? (
          /* ==========================================
             VIEW 2: CHECKOUT & PAYMENT METHOD (Image 1 & 4)
             ========================================== */
          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Plan Summary */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-white/10 bg-[#11131c]/90 p-6 sm:p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
              <div>
                <button
                  type="button"
                  onClick={() => { setCheckoutPlan(null); setNotice(null); }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Pricing
                </button>

                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold text-indigo-200 mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Premium Subscription
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight">Upgrade to Pro</h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
                  Unlock more features and grow your presence with Postter Premium.
                </p>

                {/* Glowing Plan Box */}
                <div className="relative mt-7 rounded-2xl border-2 border-indigo-500/70 bg-gradient-to-b from-indigo-950/50 to-[#121521] p-6 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-3.5 py-0.5 text-[11px] font-extrabold text-white shadow">
                    {activeCheckout.popular ? 'Most Popular' : activeCheckout.title}
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold">{activeCheckout.title}</h2>
                      <p className="text-xs text-slate-400">{activeCheckout.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold">
                        {activeCheckout.periods[checkoutMonths]?.usd}
                        <span className="text-xs font-normal text-slate-400"> / {checkoutMonths} mo</span>
                      </div>
                      <div className="text-xs font-bold text-indigo-300">
                        {activeCheckout.periods[checkoutMonths]?.idr} / {checkoutMonths} bulan
                      </div>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{activeCheckout.quotaLabel}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="inline-flex items-center gap-1.5">
                        Verified Badge <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Access to premium templates</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">Plan Details</div>
                      <div className="text-xs text-slate-400">{activeCheckout.title} Plan • {checkoutMonths} Month(s)</div>
                    </div>
                    <select
                      value={checkoutMonths}
                      onChange={(e) => setCheckoutMonths(Number(e.target.value))}
                      aria-label="Pilih durasi bulan"
                      className="rounded-xl border border-white/15 bg-[#1b1f30] px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-400"
                    >
                      {BILLING_MONTHS.map((m) => (
                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''} — {activeCheckout.periods[m]?.idr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Secure & Encrypted Payment</div>
                  <div className="text-[11px] text-slate-400">Your payment information is safe with us.</div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Method & Billing */}
            <form onSubmit={handleSubscribeSubmit} className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#11131c]/90 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Stepper */}
                <div className="mb-6 flex items-center justify-between text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px]">1</span>
                    <span>Plan</span>
                  </div>
                  <div className="h-px flex-1 bg-indigo-500/40 mx-3" />
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] shadow-[0_0_12px_rgba(99,102,241,0.8)]">2</span>
                    <span>Payment</span>
                  </div>
                  <div className="h-px flex-1 bg-white/10 mx-3" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-slate-400 text-[11px]">3</span>
                    <span>Confirmation</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h2 className="text-xl font-extrabold">Choose Payment Method</h2>
                    <p className="text-xs text-slate-400">Select your preferred payment method to complete the subscription.</p>
                  </div>
                </div>

                {/* Payment Method Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const selected = paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`${method.fullWidth ? 'sm:col-span-2' : ''} flex items-center justify-between gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                          selected
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={selected}
                            onChange={() => setPaymentMethod(method.id)}
                            className="h-4 w-4 accent-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-bold">{method.name}</div>
                            <div className="text-[11px] text-slate-400">{method.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-indigo-300">
                            {method.badge}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Billing Details */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                  <div className="text-sm font-bold mb-3">Billing Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block text-xs text-slate-300">
                      Email Address
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-transparent text-xs text-white outline-none"
                        />
                      </div>
                    </label>
                    <label className="block text-xs text-slate-300">
                      Phone Number (Optional)
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2.5">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={billingPhone}
                          onChange={(e) => setBillingPhone(e.target.value)}
                          placeholder="08xx-xxxx-xxxx"
                          className="w-full bg-transparent text-xs text-white outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="mt-4 flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 accent-indigo-500 rounded"
                    />
                    <span>
                      I agree to the <span className="text-indigo-400 underline">Terms of Service</span> and <span className="text-indigo-400 underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 py-3.5 px-6 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {busy ? 'Processing...' : `Subscribe Now (${activeCheckout.periods[checkoutMonths]?.idr}) →`}
                </button>
                <p className="mt-2.5 text-center text-[11px] text-slate-400">
                  🔒 Jika berhenti berlangganan, Centang Biru otomatis hilang dan kuota kembali ke 1x posting/hari.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* ==========================================
             VIEW 1: PRICING GRID (Image 2)
             ========================================== */
          <div className="relative z-10">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Upgrade Your Experience
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Choose the Perfect Plan<br className="hidden sm:inline" /> for Your Needs
                </h1>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300">
                  Post more, grow faster, and get the verified badge with Postter Premium.
                </p>

                {/* Currency Switcher */}
                <div className="mt-5 inline-flex rounded-full border border-white/15 bg-[#151824] p-1">
                  {['IDR', 'USD'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`rounded-full px-5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        currency === curr ? 'bg-white text-[#0a0b10] shadow' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Referral Banner for Free Account */}
              {user?.username && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 max-w-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Gift className="w-4 h-4 text-amber-400" /> Referral Free Account (Bonus 3x/Day)
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Bagikan kode referral <strong className="text-white">@{user.username}</strong> ke teman untuk mendapat kuota <strong>3x posting/hari selama 1 bulan</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${window.location.origin}/register?ref=${user.username}`);
                      setNotice({ type: 'ok', text: `Link & kode referral (${user.username}) berhasil disalin!` });
                    }}
                    className="mt-2.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer"
                  >
                    Salin Link Referral (@{user.username})
                  </button>
                </div>
              )}
            </div>

            {/* 8-Card 4x2 Symmetrical Grid (Covers all 9 Tiers) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PRICING_PLANS.map((card) => {
                const isVariantCard = Boolean(card.variants);
                const activePlanId = isVariantCard ? maxVariant : card.id;
                const activeData = isVariantCard ? card.variants[maxVariant] : card;
                const months = selectedMonths[activePlanId] || 1;
                const isCurrent = currentPlanId === activePlanId;

                return (
                  <div
                    key={card.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                      card.popular
                        ? 'border-2 border-indigo-400 bg-gradient-to-b from-indigo-950/60 to-[#11131d] shadow-[0_0_35px_rgba(99,102,241,0.28)]'
                        : card.eliteGlow
                        ? 'border-2 border-purple-500/80 bg-gradient-to-b from-purple-950/50 to-[#11131d] shadow-[0_0_35px_rgba(168,85,247,0.25)]'
                        : 'border-white/10 bg-[#11131d]/90 hover:border-white/20'
                    }`}
                  >
                    {card.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-3 py-0.5 text-[10px] font-extrabold text-white shadow">
                        ★ Most Popular
                      </span>
                    )}
                    {card.eliteGlow && (
                      <Sparkles className="absolute top-4 right-4 w-4 h-4 text-purple-300" />
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold">{card.title}</h3>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>

                      {/* Variant Switcher for 21x & 24x Card */}
                      {isVariantCard && (
                        <div className="mt-2.5 inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5">
                          {['tier_21', 'tier_24'].map((vKey) => (
                            <button
                              key={vKey}
                              type="button"
                              onClick={() => setMaxVariant(vKey)}
                              className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold cursor-pointer ${
                                maxVariant === vKey ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {card.variants[vKey].label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Headline Price */}
                      <div className="mt-3">
                        <div className="text-2xl font-extrabold">
                          {currency === 'USD' ? activeData.usdMonthly : activeData.idrMonthly}
                          <span className="text-xs font-normal text-slate-400"> / month</span>
                        </div>
                        <div className="text-xs font-bold text-slate-300">
                          {currency === 'USD' ? `${activeData.idrMonthly} / bulan` : `${activeData.usdMonthly} / month`}
                        </div>
                      </div>

                      {/* Checklist */}
                      <ul className="mt-3.5 space-y-1.5 text-xs text-slate-200 border-t border-white/10 pt-3">
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{activeData.quotaLabel}</span>
                        </li>
                        {card.blue ? (
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="inline-flex items-center gap-1">
                              Verified Badge <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                            </span>
                          </li>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>Post: Poster, Video, Shop, Link, Hashtags, Location</span>
                            </li>
                            <li className="flex items-start gap-2 text-amber-300">
                              <Gift className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{card.referralNote}</span>
                            </li>
                          </>
                        )}
                      </ul>

                      {/* Billing Period Radio List */}
                      {activeData.periods && (
                        <div className="mt-3.5 border-t border-white/10 pt-2.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Choose Billing Period
                          </div>
                          <div className="space-y-1">
                            {BILLING_MONTHS.map((m) => {
                              const p = activeData.periods[m];
                              const checked = months === m;
                              return (
                                <label
                                  key={m}
                                  className={`flex items-center justify-between rounded-lg px-2 py-1 text-[11px] cursor-pointer ${
                                    checked ? 'bg-white/10 font-bold text-white' : 'text-slate-300 hover:bg-white/5'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <input
                                      type="radio"
                                      name={`period-${activePlanId}`}
                                      checked={checked}
                                      onChange={() => setSelectedMonths((prev) => ({ ...prev, [activePlanId]: m }))}
                                      className="h-3 w-3 accent-indigo-400"
                                    />
                                    {m} Month{m > 1 ? 's' : ''}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <span className="text-slate-400">{p.usd}</span>
                                    <span className="text-indigo-200">{p.idr}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {card.id === 'free' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleSelectFree}
                        className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer"
                      >
                        {currentPlanId === 'free' ? 'Get Started' : 'Berhenti Berlangganan (Ke Free)'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCheckout(activePlanId, months)}
                        className={`mt-4 w-full rounded-xl py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                          card.popular
                            ? 'bg-white text-[#0a0b10] hover:bg-slate-100 shadow-lg'
                            : card.eliteGlow
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-95'
                            : 'border border-white/15 bg-white/5 hover:bg-white/15 text-white'
                        }`}
                      >
                        Subscribe
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Feature Bar (Image 2) */}
            <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#11131d]/90 p-4 sm:grid-cols-2 lg:grid-cols-5 items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Verified Badge</div>
                  <div className="text-[11px] text-slate-400">Get the blue checkmark</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Daily Posting Boost</div>
                  <div className="text-[11px] text-slate-400">Post up to 24x daily</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Advanced Analytics</div>
                  <div className="text-[11px] text-slate-400">Understand your audience</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Priority Support</div>
                  <div className="text-[11px] text-slate-400">Get help first</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openCheckout('tier_3', 1)}
                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 px-4 py-3 text-left shadow-lg hover:opacity-95 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <Crown className="w-3.5 h-3.5 text-amber-300" /> Go Premium Today
                  </div>
                  <div className="text-[10px] text-indigo-100">Unlock more features & grow</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

