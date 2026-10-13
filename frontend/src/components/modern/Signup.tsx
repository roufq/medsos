import { useLanguage } from "../../context/LanguageContext";import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserRound, Smartphone, Calendar, Globe, MapPin, Building2, Loader2 } from 'lucide-react';
import OAuthButtons from './OAuthButtons';
import AuthShowcase from './AuthShowcase';
interface SignupProps {onRegister: (email: string, fullName: string, password?: string, extra?: any) => void | Promise<void>;onNavigateToLogin: () => void;onOAuth: (provider: string) => void;}
const INTERESTS = ['Teknologi', 'Olahraga', 'Musik', 'Film & TV', 'Travel', 'Kuliner', 'Fashion', 'Game', 'Bisnis', 'Lainnya'];
export default function Signup({ onRegister, onNavigateToLogin, onOAuth }: SignupProps) {const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', dial: '+62', gender: '', birth_date: '', country: 'Indonesia', location: '', city: '' });
  const [interests, setInterests] = useState<string[]>([]);const [showPassword, setShowPassword] = useState(false);const [showConfirm, setShowConfirm] = useState(false);const [agree, setAgree] = useState(false);const [error, setError] = useState('');const [busy, setBusy] = useState(false);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();if (busy) return;setError('');
    if (form.password !== form.confirm) {setError('Konfirmasi password tidak sama.');return;}
    if (!agree) {setError('Persetujuan diperlukan untuk melanjutkan.');return;}
    setBusy(true);
    const phone = form.phone ? form.dial + form.phone.replace(/\D/g, '').replace(/^0+/, '') : '';
    try {await onRegister(form.email, form.name.trim(), form.password, { phone, phone_country: form.dial === '+62' ? 'ID' : form.dial === '+60' ? 'MY' : 'SG', profile: { ...(form.gender ? { gender: form.gender } : {}), birth_date: form.birth_date, country: form.country, location: form.location, city: form.city, interests } });} finally {setBusy(false);}
  };
  return <AuthShowcase signup><section className="auth-form-panel"><h2>{t("Daftar Akun Baru")}</h2><p className="auth-form-description">{t("Isi data di bawah ini untuk membuat akun Postterest.")}</p><form onSubmit={submit} className="auth-register-form">
    <fieldset><legend>{t("Informasi Akun")}</legend><div className="auth-form-grid">
      <label className="auth-input-wrap auth-full"><UserRound size={17} /><input aria-label={t("Nama lengkap")} autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t("Nama lengkap")} /></label>
      <div><label className="auth-input-wrap"><Mail size={17} /><input aria-label={t("Email address")} type="email" autoComplete="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={t("Email address")} /></label><small>{t("Gunakan email aktif kamu")}</small></div>
      <div><label className="auth-input-wrap"><Lock size={17} /><input aria-label="Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Password" /><button type="button" aria-label={t("Tampilkan password")} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={16} /> : <EyeOff size={16} />}</button></label><small>{t("Minimal 8 karakter")}</small></div>
      <div className="auth-full"><label className="auth-input-wrap"><Lock size={17} /><input aria-label={t("Konfirmasi Password")} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder={t("Konfirmasi Password")} /><button type="button" aria-label={t("Tampilkan konfirmasi password")} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}</button></label><small>{t("Masukkan kembali password kamu")}</small></div>
    </div></fieldset>
    <fieldset><legend>{t("Informasi Pribadi")}</legend><div className="auth-form-grid">
      <div className="auth-full"><label className="auth-input-wrap"><Smartphone size={17} /><select aria-label="Kode negara telepon" value={form.dial} onChange={(e) => set('dial', e.target.value)} className="auth-dial"><option>+62</option><option>+60</option><option>+65</option></select><input aria-label="Nomor HP" type="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Nomor HP (opsional)" /></label><small>Gunakan nomor HP aktif, contoh: 0812 3456 7890</small></div>
      <label className="auth-input-wrap"><UserRound size={17} /><select aria-label={t("Jenis Kelamin")} value={form.gender} onChange={(e) => set('gender', e.target.value)}><option value="">{t("Pilih jenis kelamin")}</option><option value="male">{t("Laki-laki")}</option><option value="female">{t("Perempuan")}</option><option value="other">{t("Lainnya")}</option></select></label>
      <label className="auth-input-wrap"><Calendar size={17} /><input aria-label={t("Tanggal Lahir")} type="date" value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} /></label>
    </div></fieldset>
    <fieldset><legend>{t("Lokasi")}</legend><div className="auth-form-grid">
      <label className="auth-input-wrap"><Globe size={17} /><select aria-label={t("Negara")} value={form.country} onChange={(e) => set('country', e.target.value)}><option>Indonesia</option><option>Malaysia</option><option>Singapura</option><option>Australia</option><option value="Lainnya">{t("Lainnya")}</option></select></label>
      <label className="auth-input-wrap"><MapPin size={17} /><input aria-label={t("Provinsi")} value={form.location} maxLength={100} onChange={(e) => set('location', e.target.value)} placeholder={t("Provinsi / wilayah")} /></label>
      <label className="auth-input-wrap auth-full"><Building2 size={17} /><input aria-label="Kota atau Kabupaten" value={form.city} maxLength={100} onChange={(e) => set('city', e.target.value)} placeholder={t("Kota / Kabupaten")} /></label>
    </div></fieldset>
    <fieldset><legend>{t("Minat (Interest)")}</legend><p className="auth-interest-hint">{t("Pilih minat kamu (bisa lebih dari satu)")}</p><div className="auth-interests">{INTERESTS.map((interest) => <label key={interest}><input type="checkbox" checked={interests.includes(interest)} onChange={(e) => setInterests(e.target.checked ? [...interests, interest] : interests.filter((item) => item !== interest))} />{interest}</label>)}</div></fieldset>
    <label className="auth-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required /><span>Saya menyetujui syarat penggunaan dan kebijakan privasi Postterest.</span></label>
    {error && <p role="alert" className="auth-inline-error">{error}</p>}<button type="submit" disabled={busy} className="auth-primary">{busy ? <Loader2 size={16} className="animate-spin" /> : null}{t("Daftar Sekarang")}<ArrowRight size={16} /></button>
  </form><div className="auth-divider"><span>{t("atau daftar dengan")}</span></div><OAuthButtons onOAuth={onOAuth} verb="Daftar" /><p className="auth-switch">{t("Sudah punya akun?")}<button type="button" onClick={onNavigateToLogin}>{t("Login sekarang")}</button></p></section></AuthShowcase>;
}
