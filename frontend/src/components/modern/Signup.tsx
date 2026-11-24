import {useFeedbackState} from '../../hooks/useFeedbackState';
import { useState, FormEvent, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Phone, User, Calendar, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AuthLayout from './AuthLayout';
import { REGISTRATION_COUNTRIES, loadRegistrationRegions, phoneCountryForCode } from '../../utils/registrationRegions';

interface SignupProps {
	onRegister: (email: string, fullName: string, password?: string, extra?: Record<string, any>) => void | Promise<void>;
	onNavigateToLogin: () => void;
}

const INTERESTS = [
  'Teknologi', 'Olahraga', 'Musik', 'Film & TV', 'Travel',
  'Kuliner', 'Fashion', 'Game', 'Bisnis', 'Lainnya'
];


const FALLBACK_ID_REGIONS: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi", "Sukabumi"],
  "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Pekalongan", "Tegal"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Kediri", "Batu"],
  "Banten": ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon"],
  "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Buleleng"],
  "Sumatera Utara": ["Medan", "Binjai", "Deli Serdang", "Pematangsiantar"],
  "Sulawesi Selatan": ["Makassar", "Gowa", "Maros", "Parepare"]
};

export default function Signup({ onRegister, onNavigateToLogin }: SignupProps) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phoneCode, setPhoneCode] = useState('+62');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const [country, setCountry] = useState('Indonesia');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [referralCode, setReferralCode] = useState(() => new URLSearchParams(window.location.search).get('ref') || '');

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useFeedbackState('', 'error');
  const [busy, setBusy] = useState(false);

  const [provinces, setProvinces] = useState<{id: string, name: string}[]>([]);
  const [cities, setCities] = useState<{id: string, name: string}[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [foreignRegions, setForeignRegions] = useState<Record<string,string[]>>({});
  const [regionError, setRegionError] = useState(false);
  const [regionRetry, setRegionRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRegionError(false);
    setIsLoadingRegions(true);
    setForeignRegions({});
    if (country === 'Indonesia') {
      fetch('https://ibnux.github.io/data-indonesia/provinsi.json', {signal:controller.signal})
        .then(res => {if(!res.ok) throw new Error('Regions unavailable');return res.json();})
        .then(data => {if(!controller.signal.aborted) setProvinces(data.map((p: any) => ({ id: p.id, name: p.nama })));})
        .catch(() => {if(!controller.signal.aborted) setProvinces(Object.keys(FALLBACK_ID_REGIONS).map((name, idx) => ({ id: String(idx + 1), name })));})
        .finally(() => {if(!controller.signal.aborted) setIsLoadingRegions(false);});
    } else {
      setProvinces([]);
      setCities([]);
      loadRegistrationRegions(country,{signal:controller.signal,baseURL:import.meta.env.BASE_URL})
        .then(data => {if(!controller.signal.aborted) setForeignRegions(data);})
        .catch(() => {if(!controller.signal.aborted) setRegionError(true);})
        .finally(() => {if(!controller.signal.aborted) setIsLoadingRegions(false);});
    }
    return () => controller.abort();
  }, [country,regionRetry]);

  useEffect(() => {
    const controller = new AbortController();
    if (country === 'Indonesia' && province) {
      const selectedProv = provinces.find(p => p.name === province);
      if (selectedProv) {
        setIsLoadingRegions(true);
        fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${selectedProv.id}.json`, {signal:controller.signal})
          .then(res => {if(!res.ok) throw new Error('Cities unavailable');return res.json();})
          .then(data => {if(!controller.signal.aborted) setCities(data.map((c: any) => ({ id: c.id, name: c.nama })));})
          .catch(() => {if(!controller.signal.aborted) setCities((FALLBACK_ID_REGIONS[province] || [province]).map((name, idx) => ({ id: String(idx + 1), name })));})
          .finally(() => {if(!controller.signal.aborted) setIsLoadingRegions(false);});
      }
    } else {
      setCities([]);
    }
    return () => controller.abort();
  }, [province, country, provinces]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!agree) {
      setError('Persetujuan diperlukan untuk melanjutkan.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    if (!email) return;

    const extra = {
      phone: phoneLocal ? `${phoneCode}${phoneLocal.replace(/^0+/, '')}` : '',
      phone_country: phoneCountryForCode(phoneCode),
      referral_code: referralCode.trim(),
      profile: {
        ...(gender ? { gender } : {}),
        birth_date: birthDate,
        country,
        location: [province, postalCode].filter(Boolean).join(' '),
        city,
        interests: selectedInterests
      }
    };

    setBusy(true);
    try { await onRegister(email, fullName.trim(), password, extra); } finally { setBusy(false); }
  };

  return (
    <AuthLayout isLogin={false}>
      <div className="bg-surface-card rounded-[2rem] p-5 sm:p-8 xl:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-subtle w-full">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">{t("Daftar Akun Baru")}</h2>
          <p className="text-text-secondary text-sm">{t("Isi data di bawah ini untuk membuat akun Postter.")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Informasi Akun */}
          <div>
            <h3 className="text-[15px] font-bold text-text-primary mb-4">{t("Informasi Akun")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary overflow-hidden">
                  <User size={18} className="ml-3.5 mr-2.5 text-text-secondary" />
                  <input aria-label={t('Nama lengkap')} autoComplete="name" required minLength={2} maxLength={100} value={fullName} onChange={e => setFullName(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-text-primary outline-none"
                    placeholder={t('Nama lengkap')}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-text-secondary group-focus-within:text-text-primary">
                    <Mail size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t('Email address')} autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                    placeholder={t("Email address")}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1">{t("Gunakan email aktif kamu")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-text-secondary group-focus-within:text-text-primary">
                    <Lock size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t("Password")} autoComplete="new-password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                    placeholder={t("Password")}
                  />
                  <button type="button" aria-label={t('Tampilkan password')} onClick={() => setShowPassword(!showPassword)} className="w-10 h-full flex-shrink-0 flex items-center justify-center text-text-secondary hover:text-text-secondary">
                    {showPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1">{t("Minimal 8 karakter, kombinasi huruf & angka")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-text-secondary group-focus-within:text-text-primary">
                    <Lock size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t('Konfirmasi Password')} autoComplete="new-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                    placeholder={t("Konfirmasi Password")}
                  />
                  <button type="button" aria-label={t('Tampilkan konfirmasi password')} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="w-10 h-full flex-shrink-0 flex items-center justify-center text-text-secondary hover:text-text-secondary">
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1">{t("Masukkan kembali password kamu")}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary overflow-hidden">
                  <User size={18} className="ml-3.5 mr-2.5 text-text-secondary" />
                  <input aria-label={t("Kode Referral")} value={referralCode} onChange={e => setReferralCode(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-text-primary outline-none"
                    placeholder={t("Kode Referral teman (opsional)")}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1">{t("Masukkan kode referral teman yang mengajak kamu")}</p>
              </div>
              <div className="hidden">
              </div>
            </div>
          </div>

          {/* Informasi Pribadi */}
          <div>
            <h3 className="text-[15px] font-bold text-text-primary mb-4">{t("Informasi Pribadi")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="col-span-1 md:col-span-2">
                <div className="relative flex items-center bg-surface-card border border-border-subtle rounded-xl overflow-hidden focus-within:border-text-primary">
                  <div className="pl-3.5 pr-2 flex items-center text-text-secondary">
                    <Phone size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Kode negara telepon")} value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="bg-transparent text-[13px] text-text-primary py-2.5 outline-none font-medium appearance-none border-r border-border-subtle pr-2 max-w-[125px] sm:max-w-[155px] truncate shrink-0">
                    {REGISTRATION_COUNTRIES.map(item=><option key={item.iso} value={item.dial}>{item.dial} {t(item.label)}</option>)}
                  </select>
                  <input aria-label={t("Nomor HP")} type="tel" autoComplete="tel-national" value={phoneLocal} onChange={e => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 min-w-0 w-0 px-3 py-2.5 bg-transparent text-[13px] outline-none placeholder:text-text-secondary"
                    placeholder="812 3456 7890"
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1">{t("Gunakan nomor HP aktif (contoh: 0812 3456 7890)")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <User size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Jenis Kelamin")} value={gender} onChange={e => setGender(e.target.value)} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none appearance-none border-none focus:ring-0 cursor-pointer">
                    <option value="" disabled>{t("Pilih jenis kelamin")}</option>
                    <option value="male">{t("Laki-laki")}</option>
                    <option value="female">{t("Perempuan")}</option>
                    <option value="other">{t("Lainnya")}</option>
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-text-secondary">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <Calendar size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t("Tanggal Lahir")} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-text-primary outline-none border-none focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <h3 className="text-[15px] font-bold text-text-primary mb-4">{t("Lokasi")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Negara")} value={country} onChange={e => {
                    setCountry(e.target.value);
                    if(!phoneLocal) setPhoneCode(REGISTRATION_COUNTRIES.find(item=>item.name===e.target.value)?.dial || '+62');
                    setProvince("");
                    setCity("");
                  }} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none appearance-none border-none focus:ring-0 cursor-pointer">
                    <option value="" disabled>{t("Pilih negara")}</option>
                    {REGISTRATION_COUNTRIES.map(c => (
                      <option key={c.iso} value={c.name}>{t(c.label)}</option>
                    ))}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-text-secondary">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Provinsi / negara bagian / wilayah")} value={province} onChange={e => {
                    setProvince(e.target.value);
                    setCity("");
                  }} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none appearance-none border-none focus:ring-0 cursor-pointer"
                  disabled={!country || (country === 'Indonesia' ? provinces.length === 0 : !Object.keys(foreignRegions).length)}>
                    <option value="" disabled>{t(isLoadingRegions ? 'Memuat...' : 'Pilih provinsi / negara bagian')}</option>
                    {country === 'Indonesia' ? (
                      provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                    ) : (
                      country && Object.keys(foreignRegions).length>0 && Object.keys(foreignRegions).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))
                    )}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-text-secondary">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Kota / Kabupaten")} value={city} onChange={e => setCity(e.target.value)} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-text-primary outline-none appearance-none border-none focus:ring-0 cursor-pointer"
                  disabled={!province || (country === 'Indonesia' ? cities.length === 0 : (!Object.keys(foreignRegions).length || !foreignRegions[province]?.length))}>
                    <option value="" disabled>{t(isLoadingRegions ? 'Memuat...' : 'Pilih kota/kabupaten')}</option>
                    {country === 'Indonesia' ? (
                      cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    ) : (
                      country && province && Object.keys(foreignRegions).length>0 && foreignRegions[province] && foreignRegions[province].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-text-secondary">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-surface-card border border-border-subtle rounded-xl focus-within:border-text-primary transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-text-secondary">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t("Kode pos")} type="text" value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                    placeholder={t("Masukkan kode pos")}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-1.5 ml-1 text-right">{t("Contoh: 12345")}</p>
              </div>
            </div>
          </div>

          {regionError&&<p role="alert" className="text-xs text-error">{t("Data wilayah gagal dimuat.")} <button type="button" className="underline" onClick={()=>setRegionRetry(value=>value+1)}>{t("Coba lagi")}</button></p>}
          {['United States','China','India'].includes(country)&&<p className="text-[10px] text-text-secondary">{t("Data wilayah")}: <a className="underline" href="https://github.com/dr5hn/countries-states-cities-database" target="_blank" rel="noopener noreferrer">CSC Database</a> · <a className="underline" href={`${import.meta.env.BASE_URL}regions/LICENSE.odbl.txt`} target="_blank" rel="noopener noreferrer">ODbL 1.0</a></p>}

          {/* Minat */}
          <div>
            <h3 className="text-[15px] font-bold text-text-primary mb-1">{t("Minat (Interest)")}</h3>
            <p className="text-[10px] text-text-secondary mb-3">{t("Pilih minat kamu (bisa lebih dari satu)")}</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${selected ? 'border-text-primary bg-text-primary text-surface-card' : 'border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-container-low'}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors ${selected ? 'bg-surface-card border-white' : 'bg-surface-card border-border-subtle'}`}>
                      {selected && <svg className="w-2.5 h-2.5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {t(interest)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Agreement */}
          <div className="flex items-center gap-2.5 pt-2">
            <input type="checkbox" aria-label={t("Syarat dan Ketentuan")} checked={agree} onChange={e => setAgree(e.target.checked)} required className="w-[15px] h-[15px] shrink-0 accent-gray-900" />
            <p className="text-[11px] text-text-secondary leading-tight">
              {t("Saya menyetujui")} <a href="#" className="auth-link font-semibold hover:underline">{t("Syarat dan Ketentuan")}</a> {t("serta")} <a href="#" className="auth-link font-semibold hover:underline">{t("Kebijakan Privasi")}</a> {t("Postter.")}
            </p>
          </div>

          {/* Submit */}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{t(error)}</p>}
          <button type="submit" disabled={busy} className="w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {t("Daftar Sekarang")}
            <span className="text-lg leading-none">&rarr;</span>
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-text-secondary">
          {t("Sudah punya akun?")}{' '}
          <button onClick={onNavigateToLogin} className="auth-link font-bold hover:underline">
            {t("Login sekarang")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
