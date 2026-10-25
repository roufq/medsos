import { useLanguage } from "../context/LanguageContext";import LanguageSwitch from '../components/common/LanguageSwitch';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, LogOut, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';
import AppLayout from '../components/modern/AppLayout';

// ISO 3166-1 alpha-2 code, name, and calling code for the phone selector.
const COUNTRIES = [
['ID', 'Indonesia', '62'], ['MY', 'Malaysia', '60'], ['SG', 'Singapura', '65'], ['BN', 'Brunei', '673'], ['TH', 'Thailand', '66'],
['PH', 'Filipina', '63'], ['VN', 'Vietnam', '84'], ['TL', 'Timor Leste', '670'], ['AU', 'Australia', '61'], ['NZ', 'Selandia Baru', '64'],
['JP', 'Jepang', '81'], ['KR', 'Korea Selatan', '82'], ['CN', 'Tiongkok', '86'], ['HK', 'Hong Kong', '852'], ['TW', 'Taiwan', '886'],
['IN', 'India', '91'], ['PK', 'Pakistan', '92'], ['BD', 'Bangladesh', '880'], ['SA', 'Arab Saudi', '966'], ['AE', 'Uni Emirat Arab', '971'],
['QA', 'Qatar', '974'], ['TR', 'Turki', '90'], ['EG', 'Mesir', '20'], ['NG', 'Nigeria', '234'], ['ZA', 'Afrika Selatan', '27'],
['GB', 'Inggris', '44'], ['DE', 'Jerman', '49'], ['FR', 'Prancis', '33'], ['NL', 'Belanda', '31'], ['IT', 'Italia', '39'],
['ES', 'Spanyol', '34'], ['RU', 'Rusia', '7'], ['US', 'Amerika Serikat', '1'], ['CA', 'Kanada', '1'], ['MX', 'Meksiko', '52'], ['BR', 'Brasil', '55']];

const INTERESTS = ['Teknologi', 'Bisnis', 'Desain', 'Fotografi', 'Travel', 'Kuliner', 'Fashion', 'Olahraga', 'Musik', 'Film', 'Game', 'Pendidikan', 'Kesehatan', 'Otomotif', 'Properti', 'Keuangan', 'Seni', 'Parenting'];
const SHOP_CATEGORIES = ['', 'Elektronik', 'Fashion', 'Kecantikan', 'Rumah & Dapur', 'Otomotif', 'Olahraga', 'Hobi & Koleksi', 'Makanan & Minuman', 'Jasa', 'Lainnya'];

const SUBSCRIPTION_PLANS = [
  { id: 'free', quota: '1x Postingan', features: 'Poster, Video, Shop, Link, Hashtags', price: 'Gratis (Free Account)', blue: false, badge: 'Free Account' },
  { id: 'tier_3', quota: '3x Postingan', features: 'Poster, Video, Shop, Link, Hashtags, Location', price: 'Rp 69.000 / Month', blue: false, badge: 'Berlangganan 🌏' },
  { id: 'tier_6', quota: '6x Postingan', features: 'Poster, Video, Shop, Link', price: 'Rp 1.299.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_9', quota: '9x Postingan', features: 'Poster, Video, Shop, Link', price: 'Rp 1.599.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_12', quota: '12x Postingan', features: 'Poster, Video, Shop, Link, Location', price: 'Rp 299.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_15', quota: '15x Postingan', features: 'Poster, Video, Shop, Link, Hashtags, Location', price: 'Rp 366.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_18', quota: '18x Postingan', features: 'Poster, Video, Shop, Link, Hashtags, Location', price: 'Rp 599.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_21', quota: '21x Postingan', features: 'Poster, Video, Shop, Link, Hashtags, Location', price: 'Rp 699.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
  { id: 'tier_24', quota: '24x Postingan', features: 'Poster, Video, Shop, Link, Hashtags, Location', price: 'Rp 799.000 / Month', blue: true, badge: 'Centang Biru • Berlangganan 🌎' },
];

const errorText = (error, fallback) => error?.response?.data?.error || fallback;
const dialCode = (iso) => COUNTRIES.find((c) => c[0] === iso)?.[2] || '';

function Section({ title, children, description }) {
  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-border-subtle/30">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>);

}

function Notice({ state }) {
  if (!state?.text) return null;
  const ok = state.type === 'ok';
  return <p className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${ok ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{state.text}</p>;
}

export default function SettingsPage() {const { t } = useLanguage();
  const { user, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {await logout();navigate('/thanks', { replace: true });} finally {setLoggingOut(false);}
  };
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState({ email: '', phone: '' });
  const [verifyNotice, setVerifyNotice] = useState({});
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordNotice, setPasswordNotice] = useState({});
  const [blocked, setBlocked] = useState([]);
  const [deletion, setDeletion] = useState({ password: '', confirm: '' });
  const [deleteNotice, setDeleteNotice] = useState({});
  const [subBusy, setSubBusy] = useState('');
  const [subNotice, setSubNotice] = useState({});

  const selectPlan = async (planId) => {
    if (subBusy) return;
    setSubBusy(planId);
    setSubNotice({});
    try {
      const updated = await userApi.updateSettings({ subscription_plan: planId });
      updateProfileState(updated);
      setSubNotice({ type: 'ok', text: planId === 'free' ? 'Paket diubah ke Free Account.' : 'Paket berlangganan berhasil diaktifkan (siap diintegrasikan ke Payment Gateway).' });
    } catch (err) {
      setSubNotice({ type: 'error', text: errorText(err, 'Gagal memperbarui paket berlangganan.') });
    } finally {
      setSubBusy('');
    }
  };

  useEffect(() => {
    if (!user) return;
    const country = user.phone_country || 'ID';
    const dial = dialCode(country);
    const phone = user.phone || '';
    setForm({
      name: user.name || '', username: user.username || '', bio: user.bio || '', website: user.website || '',
      title: user.title || '', company: user.company || '', location: user.location || '',
      email: user.email || '', phone_country: country, phone_local: phone.startsWith('+' + dial) ? phone.slice(dial.length + 1) : phone.replace(/^\+/, ''),
      birth_date: user.birth_date ? String(user.birth_date).slice(0, 10) : '', birth_place: user.birth_place || '',
      gender: user.gender || '', account_type: user.account_type || 'personal', city: user.city || '', country: user.country || '',
      interests: user.interests || [], shop_category: user.shop_category || '', is_private: Boolean(user.is_private), profile_layout: user.profile_layout || 'grid'
    });
  }, [user]);

  useEffect(() => {userApi.getBlockedUsers().then((list) => setBlocked(list || [])).catch(() => setBlocked([]));}, []);

  if (!form) return <AppLayout currentTab="settings"><div /></AppLayout>;

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const input = 'mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-sm outline-none focus:border-primary';
  const label = 'text-sm font-medium';

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({});
    const local = form.phone_local.replace(/\D/g, '').replace(/^0+/, '');
    const payload = {
      name: form.name, username: form.username, bio: form.bio, website: form.website, title: form.title, company: form.company, location: form.location,
      email: form.email, phone_country: form.phone_country, phone: local ? `+${dialCode(form.phone_country)}${local}` : '',
      birth_date: form.birth_date, birth_place: form.birth_place, account_type: form.account_type, city: form.city, country: form.country,
      interests: form.interests, shop_category: form.shop_category, is_private: form.is_private, profile_layout: form.profile_layout,
      ...(form.gender ? { gender: form.gender } : {})
    };
    try {
      const updated = await userApi.updateSettings(payload);
      updateProfileState(updated);
      setNotice({ type: 'ok', text: 'Pengaturan berhasil diperbarui.' });
    } catch (err) {
      setNotice({ type: 'error', text: errorText(err, 'Pengaturan gagal disimpan.') });
    } finally {
      setSaving(false);
    }
  };

  const requestCode = async (channel) => {
    setVerifyNotice({});
    try {
      const res = await authApi.requestVerification(channel);
      setVerifyNotice({ type: 'ok', text: `Kode dikirim via ${channel}.${res.dev_code ? ` (kode dev: ${res.dev_code})` : ''}` });
    } catch (err) {
      setVerifyNotice({ type: 'error', text: errorText(err, 'Gagal mengirim kode') });
    }
  };

  const confirmCode = async (purpose, code) => {
    try {
      await authApi.confirmVerification(purpose, code);
      const field = purpose === 'verify_email' ? 'email_verified_at' : 'phone_verified_at';
      updateProfileState({ ...user, [field]: new Date().toISOString() });
      setVerifyNotice({ type: 'ok', text: 'Kontak berhasil diverifikasi.' });
    } catch (err) {
      setVerifyNotice({ type: 'error', text: errorText(err, 'Kode tidak valid') });
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwords.next.length < 8) {setPasswordNotice({ type: 'error', text: 'Password baru minimal 8 karakter.' });return;}
    if (passwords.next !== passwords.confirm) {setPasswordNotice({ type: 'error', text: 'Konfirmasi password tidak sama.' });return;}
    try {
      await authApi.changePassword(passwords.current, passwords.next);
      updateProfileState({ ...user, needs_password: false });
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordNotice({ type: 'ok', text: 'Password disimpan. Sesi di perangkat lain telah dikeluarkan.' });
    } catch (err) {
      setPasswordNotice({ type: 'error', text: errorText(err, 'Gagal mengubah password') });
    }
  };

  const unblock = async (id) => {
    await userApi.unblockUser(id);
    setBlocked((list) => list.filter((u) => u.id !== id));
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm('Akun akan dinonaktifkan dan dihapus permanen setelah 30 hari. Lanjutkan?')) return;
    try {
      await userApi.deleteAccount(deletion.password, deletion.confirm);
      await logout();
      navigate('/thanks');
    } catch (err) {
      setDeleteNotice({ type: 'error', text: errorText(err, 'Gagal menghapus akun') });
    }
  };

  const verifiedBadge = (at) => at ? <span className="text-xs font-semibold text-success">✓ Terverifikasi</span> : <span className="text-xs font-semibold text-error">Belum diverifikasi</span>;

  return (
    <AppLayout currentTab="settings">
      <div className="mx-auto max-w-3xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{t("Pengaturan akun")}</h1><button type="button" onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-semibold text-error disabled:opacity-50" aria-label={t("Keluar")}><LogOut size={17} />{loggingOut ? t("Keluar...") : t("Keluar")}</button></div>
        <Section title={t("Bahasa")} description={t("Pilihan bahasa disimpan di browser ini.")}><LanguageSwitch /></Section>
        <form onSubmit={save} className="flex flex-col gap-5">
          <Section title={t("Profil")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={label}>{t("Nama lengkap")}<input value={form.name} onChange={(e) => set('name', e.target.value)} className={input} required minLength={2} maxLength={100} /></label>
              <label className={label}>Username<input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase())} className={input} pattern="[a-z0-9_]{3,40}" title="3–40 huruf kecil, angka, atau garis bawah" /></label>
              <label className={label}>{t("Jabatan / peran")}<input value={form.title} onChange={(e) => set('title', e.target.value)} className={input} maxLength={100} /></label>
              <label className={label}>{t("Perusahaan")}<input value={form.company} onChange={(e) => set('company', e.target.value)} className={input} maxLength={100} /></label>
              <label className={label}>{t("Lokasi")}<input value={form.location} onChange={(e) => set('location', e.target.value)} className={input} maxLength={100} /></label>
              <label className={label}>{t("Website")}<input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" className={input} /></label>
              <label className={`${label} sm:col-span-2`}>{t("Bio")}<textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={500} rows={3} className={input} /><span className="block text-right text-xs text-text-secondary">{form.bio.length}/500</span></label>
            </div>
          </Section>

          <Section title="Kontak" description="Mengubah email atau nomor akan membutuhkan verifikasi ulang.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={label}>Email {verifiedBadge(user.email_verified_at)}<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} required /></label>
              <div className={label}>Nomor telepon {user.phone && verifiedBadge(user.phone_verified_at)}
                <div className="mt-1 flex gap-2">
                  <select value={form.phone_country} onChange={(e) => set('phone_country', e.target.value)} className="rounded-lg border border-border-subtle p-2.5 text-sm w-36" aria-label="Kode negara">
                    {COUNTRIES.map(([iso, name, dial]) => <option key={iso} value={iso}>{iso} +{dial} {name}</option>)}
                  </select>
                  <input inputMode="tel" value={form.phone_local} onChange={(e) => set('phone_local', e.target.value)} placeholder="81234567890" className="flex-1 rounded-lg border border-border-subtle p-2.5 text-sm" aria-label="Nomor telepon" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Data pribadi">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={label}>Jenis akun
                <select value={form.account_type} onChange={(e) => set('account_type', e.target.value)} className={input}>
                  <option value="personal">Pribadi</option><option value="business">Bisnis</option><option value="team">Tim</option>
                </select>
              </label>
              <label className={label}>{t("Gender")}{form.account_type !== 'personal' && <span className="text-xs text-text-secondary">(opsional untuk bisnis/tim)</span>}
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={input}>
                  <option value="">Tidak disebutkan</option><option value="male">{t("Laki-laki")}</option><option value="female">{t("Perempuan")}</option><option value="other">{t("Lainnya")}</option>
                </select>
              </label>
              <label className={label}>Tempat lahir<input value={form.birth_place} onChange={(e) => set('birth_place', e.target.value)} className={input} maxLength={100} /></label>
              <label className={label}>Tanggal lahir<input type="date" value={form.birth_date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set('birth_date', e.target.value)} className={input} /></label>
              <label className={label}>Kota<input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} maxLength={100} /></label>
              <label className={label}>{t("Negara")}<input value={form.country} onChange={(e) => set('country', e.target.value)} className={input} maxLength={100} list="country-names" /></label>
              <datalist id="country-names">{COUNTRIES.map(([iso, name]) => <option key={iso} value={name} />)}</datalist>
            </div>
          </Section>

          <Section title="Minat & Shop" description="Dipakai untuk rekomendasi konten dan produk.">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const active = form.interests.includes(item);
                return <button key={item} type="button" onClick={() => set('interests', active ? form.interests.filter((i) => i !== item) : [...form.interests, item])} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-primary text-white' : 'bg-surface-container text-text-secondary'}`}>{item}</button>;
              })}
            </div>
            <label className={`${label} block mt-4`}>Kategori shop utama
              <select value={form.shop_category} onChange={(e) => set('shop_category', e.target.value)} className={input}>{SHOP_CATEGORIES.map((c) => <option key={c} value={c}>{c || 'Tidak ada'}</option>)}</select>
            </label>
          </Section>

          <Section title="Privasi & tampilan">
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={form.is_private} onChange={(e) => set('is_private', e.target.checked)} className="mt-1" /><span><strong>Akun private</strong><br /><span className="text-text-secondary text-xs">Hanya pengikut yang Anda setujui yang dapat melihat postingan.</span></span></label>
            <div className="mt-4 text-sm font-medium">Tampilan profil</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[['grid', 'Grid card', 'Kotak-kotak ringkas seperti galeri'], ['long', 'Long card', 'Kartu penuh selebar layar']].map(([value, title, desc]) =>
              <label key={value} className={`cursor-pointer rounded-xl border-2 p-3 text-sm ${form.profile_layout === value ? 'border-primary bg-primary/5' : 'border-border-subtle'}`}>
                  <input type="radio" name="layout" value={value} checked={form.profile_layout === value} onChange={() => set('profile_layout', value)} className="sr-only" />
                  <strong>{title}</strong><br /><span className="text-xs text-text-secondary">{desc}</span>
                </label>
              )}
            </div>
          </Section>

          <div className="sticky bottom-4 z-10">
            <button disabled={saving} className="w-full rounded-full bg-primary p-3 font-semibold text-white shadow-lg disabled:opacity-60">{saving ? 'Menyimpan…' : t("Simpan perubahan")}</button>
            <Notice state={notice} />
          </div>
        </form>

        <Section title="Paket Berlangganan & Centang Biru" description="Pilih paket kuota posting harian dan fitur Centang Biru. Ke depannya pembayaran langganan akan terhubung otomatis dengan Payment Gateway.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan, idx) => {
              const currentPlan = user.subscription_plan || 'free';
              const isCurrent = currentPlan === plan.id;
              return (
                <div key={plan.id} className={`flex flex-col justify-between rounded-xl border-2 p-4 ${isCurrent ? 'border-primary bg-primary/5' : 'border-border-subtle'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{idx + 1}. {plan.quota}</span>
                      {plan.blue && <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-600"><BadgeCheck className="w-3.5 h-3.5 text-sky-500" />Centang Biru</span>}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">Fitur: {plan.features}</p>
                    <p className="mt-2 text-sm font-extrabold text-primary">{plan.price}</p>
                    <p className="text-[11px] text-text-secondary">{plan.badge}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isCurrent || Boolean(subBusy)}
                    onClick={() => selectPlan(plan.id)}
                    className={`mt-3 w-full rounded-full py-2 text-xs font-bold transition-colors ${isCurrent ? 'bg-success/15 text-success cursor-default' : 'bg-primary text-white hover:opacity-90 disabled:opacity-50'}`}
                  >
                    {isCurrent ? '✓ Paket Aktif Saat Ini' : subBusy === plan.id ? 'Memproses...' : plan.id === 'free' ? 'Beralih ke Free Account' : 'Upgrade & Berlangganan'}
                  </button>
                </div>
              );
            })}
          </div>
          <Notice state={subNotice} />
        </Section>

        <Section title={t("Verifikasi kontak")} description="Kode berlaku 10 menit.">
          <div className="flex flex-col gap-3">
            {[['email', 'verify_email', 'Email', user.email_verified_at], ['sms', 'verify_phone', 'SMS', user.phone_verified_at], ['whatsapp', 'verify_phone', 'WhatsApp', user.phone_verified_at]].map(([channel, purpose, name, verified]) =>
            <div key={channel} className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm font-medium">{name}</span>
                {verified ? <span className="text-xs font-semibold text-success">✓ Terverifikasi</span> :
              <>
                    <button type="button" disabled={channel !== 'email' && !user.phone} onClick={() => requestCode(channel)} className="rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold disabled:opacity-40">{t("Kirim kode")}</button>
                    <input value={codes[channel === 'email' ? 'email' : 'phone']} onChange={(e) => setCodes({ ...codes, [channel === 'email' ? 'email' : 'phone']: e.target.value })} inputMode="numeric" maxLength={6} placeholder="6 digit" className="w-28 rounded-lg border border-border-subtle p-1.5 text-sm" />
                    <button type="button" onClick={() => confirmCode(purpose, codes[channel === 'email' ? 'email' : 'phone'])} className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">{t("Verifikasi")}</button>
                  </>
              }
              </div>
            )}
          </div>
          <Notice state={verifyNotice} />
        </Section>

        <Section title={user.needs_password ? t("Buat password") : t("Ubah password")} description={user.needs_password ? 'Akun Anda dibuat lewat login sosial. Tambahkan password agar bisa masuk dengan email/username.' : 'Mengubah password akan mengeluarkan semua sesi lain.'}>
          <form onSubmit={changePassword} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {!user.needs_password && <input type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Password saat ini" className="rounded-lg border border-border-subtle p-2.5 text-sm" required />}
            <input type="password" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} placeholder="Password baru (8–72)" minLength={8} maxLength={72} className="rounded-lg border border-border-subtle p-2.5 text-sm" required />
            <input type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Ulangi password baru" className="rounded-lg border border-border-subtle p-2.5 text-sm" required />
            <button className="sm:col-span-3 rounded-full bg-primary py-2 text-sm font-bold text-white">{user.needs_password ? 'Simpan password' : t("Ubah password")}</button>
          </form>
          <Notice state={passwordNotice} />
        </Section>

        <Section title={t("Akun yang diblokir")}>
          {blocked.length === 0 ? <p className="text-sm text-text-secondary">{t("Tidak ada akun yang diblokir.")}</p> :
          <div className="flex flex-col gap-2">
              {blocked.map((u) =>
            <div key={u.id} className="flex items-center gap-3">
                  <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 text-sm"><strong>{u.name}</strong> <span className="text-text-secondary">@{u.username}</span></div>
                  <button type="button" onClick={() => unblock(u.id)} className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold">{t("Buka blokir")}</button>
                </div>
            )}
            </div>
          }
        </Section>

        <Section title={t("Hapus akun")} description="Akun dinonaktifkan segera dan dihapus permanen setelah 30 hari. Masuk kembali dalam 30 hari untuk mengaktifkannya lagi.">
          <form onSubmit={deleteAccount} className="flex flex-wrap gap-2">
            {user.needs_password ?
            <input value={deletion.confirm} onChange={(e) => setDeletion({ ...deletion, confirm: e.target.value })} placeholder='Ketik "DELETE"' className="flex-1 rounded-lg border border-border-subtle p-2.5 text-sm" required /> :
            <input type="password" autoComplete="current-password" value={deletion.password} onChange={(e) => setDeletion({ ...deletion, password: e.target.value })} placeholder="Konfirmasi password" className="flex-1 rounded-lg border border-border-subtle p-2.5 text-sm" required />}
            <button className="rounded-full bg-error px-5 py-2 text-sm font-bold text-white">{t("Hapus akun")}</button>
          </form>
          <Notice state={deleteNotice} />
        </Section>
      </div>
    </AppLayout>);

}
