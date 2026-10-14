import { useState, FormEvent, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Phone, User, Calendar, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import OAuthButtons from './OAuthButtons';
import AuthLayout from './AuthLayout';

interface SignupProps {
	onRegister: (email: string, fullName: string, password?: string, extra?: Record<string, any>) => void | Promise<void>;
	onNavigateToLogin: () => void;
	onOAuth: (provider: string) => void;
}

const INTERESTS = [
  'Teknologi', 'Olahraga', 'Musik', 'Film & TV', 'Travel',
  'Kuliner', 'Fashion', 'Game', 'Bisnis', 'Lainnya'
];

const COUNTRIES = ["Indonesia", "Malaysia", "Singapore"];

const REGION_DATA: Record<string, Record<string, string[]>> = {
  "Malaysia": {
    "Kuala Lumpur": ["Kuala Lumpur"],
    "Selangor": ["Petaling Jaya", "Shah Alam", "Klang", "Subang Jaya"]
  },
  "Singapore": {
    "Singapore": ["Central", "East", "North", "North-East", "West"]
  }
};

export default function Signup({ onRegister, onNavigateToLogin, onOAuth }: SignupProps) {
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

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [provinces, setProvinces] = useState<{id: string, name: string}[]>([]);
  const [cities, setCities] = useState<{id: string, name: string}[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  useEffect(() => {
    if (country === 'Indonesia') {
      setIsLoadingRegions(true);
      fetch('https://ibnux.github.io/data-indonesia/provinsi.json')
        .then(res => res.json())
        .then(data => {
          setProvinces(data.map((p: any) => ({ id: p.id, name: p.nama })));
          setIsLoadingRegions(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingRegions(false);
        });
    } else {
      setProvinces([]);
      setCities([]);
    }
  }, [country]);

  useEffect(() => {
    if (country === 'Indonesia' && province) {
      const selectedProv = provinces.find(p => p.name === province);
      if (selectedProv) {
        setIsLoadingRegions(true);
        fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${selectedProv.id}.json`)
          .then(res => res.json())
          .then(data => {
            setCities(data.map((c: any) => ({ id: c.id, name: c.nama })));
            setIsLoadingRegions(false);
          })
          .catch(err => {
            console.error(err);
            setIsLoadingRegions(false);
          });
      }
    } else {
      setCities([]);
    }
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
      phone_country: phoneCode === '+62' ? 'ID' : phoneCode === '+60' ? 'MY' : 'SG',
      profile: {
        ...(gender ? { gender } : {}),
        birth_date: birthDate,
        country,
        location: province,
        city,
        interests: selectedInterests
      }
    };

    setBusy(true);
    try { await onRegister(email, fullName.trim(), password, extra); } finally { setBusy(false); }
  };

  return (
    <AuthLayout isLogin={false}>
      <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 w-full lg:max-h-[85vh] lg:overflow-y-auto custom-scrollbar">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{t("Daftar Akun Baru")}</h2>
          <p className="text-gray-500 text-sm">{t("Isi data di bawah ini untuk membuat akun Postterest.")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Informasi Akun */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">{t("Informasi Akun")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 overflow-hidden">
                  <User size={18} className="ml-3.5 mr-2.5 text-gray-400" />
                  <input aria-label={t('Nama lengkap')} autoComplete="name" required minLength={2} maxLength={100} value={fullName} onChange={e => setFullName(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-gray-900 outline-none"
                    placeholder={t('Nama lengkap')}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-gray-400 group-focus-within:text-gray-900">
                    <Mail size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t('Email address')} autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                    placeholder={t("Email address")}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">{t("Gunakan email aktif kamu")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-gray-400 group-focus-within:text-gray-900">
                    <Lock size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label="Password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                    placeholder={t("Password")}
                  />
                  <button type="button" aria-label={t('Tampilkan password')} onClick={() => setShowPassword(!showPassword)} className="w-10 h-full flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">{t("Minimal 8 karakter, kombinasi huruf & angka")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2.5 flex items-center justify-center text-gray-400 group-focus-within:text-gray-900">
                    <Lock size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t('Konfirmasi Password')} autoComplete="new-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                    placeholder={t("Konfirmasi Password")}
                  />
                  <button type="button" aria-label={t('Tampilkan konfirmasi password')} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="w-10 h-full flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">{t("Masukkan kembali password kamu")}</p>
              </div>
            </div>
          </div>

          {/* Informasi Pribadi */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">{t("Informasi Pribadi")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="col-span-1 md:col-span-2">
                <div className="relative flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-900">
                  <div className="pl-3.5 pr-2 flex items-center text-gray-400">
                    <Phone size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label="Kode negara telepon" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="bg-transparent text-[13px] text-gray-900 py-2.5 outline-none font-medium appearance-none border-r border-gray-200 pr-2">
                    <option value="+62">+62</option>
                    <option value="+60">+60</option>
                    <option value="+65">+65</option>
                  </select>
                  <input aria-label="Nomor HP" type="tel" autoComplete="tel-national" value={phoneLocal} onChange={e => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2.5 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                    placeholder="812 3456 7890"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">{t("Gunakan nomor HP aktif (contoh: 0812 3456 7890)")}</p>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <User size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Jenis Kelamin")} value={gender} onChange={e => setGender(e.target.value)} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none appearance-none border-none focus:ring-0 cursor-pointer">
                    <option value="" disabled>{t("Pilih jenis kelamin")}</option>
                    <option value="male">{t("Laki-laki")}</option>
                    <option value="female">{t("Perempuan")}</option>
                    <option value="other">{t("Lainnya")}</option>
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <Calendar size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t("Tanggal Lahir")} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">{t("Lokasi")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Negara")} value={country} onChange={e => {
                    setCountry(e.target.value);
                    setProvince("");
                    setCity("");
                  }} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none appearance-none border-none focus:ring-0 cursor-pointer">
                    <option value="" disabled>{t("Pilih negara")}</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Provinsi")} value={province} onChange={e => {
                    setProvince(e.target.value);
                    setCity("");
                  }} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none appearance-none border-none focus:ring-0 cursor-pointer"
                  disabled={!country || (country === 'Indonesia' ? provinces.length === 0 : !REGION_DATA[country])}>
                    <option value="" disabled>{t(isLoadingRegions ? 'Memuat...' : 'Pilih provinsi')}</option>
                    {country === 'Indonesia' ? (
                      provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                    ) : (
                      country && REGION_DATA[country] && Object.keys(REGION_DATA[country]).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))
                    )}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <select aria-label={t("Kota / Kabupaten")} value={city} onChange={e => setCity(e.target.value)} className="flex-1 w-0 bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 outline-none appearance-none border-none focus:ring-0 cursor-pointer"
                  disabled={!province || (country === 'Indonesia' ? cities.length === 0 : (!REGION_DATA[country] || !REGION_DATA[country][province]))}>
                    <option value="" disabled>{t(isLoadingRegions ? 'Memuat...' : 'Pilih kota/kabupaten')}</option>
                    {country === 'Indonesia' ? (
                      cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    ) : (
                      country && province && REGION_DATA[country] && REGION_DATA[country][province] && REGION_DATA[country][province].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                  <div className="pr-3.5 pl-2 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center w-full bg-white border border-gray-200 rounded-xl focus-within:border-gray-900 transition-colors overflow-hidden group">
                  <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
                    <MapPin size={18} strokeWidth={1.25} />
                  </div>
                  <input aria-label={t("Kode pos")} type="text" value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 w-0 bg-transparent py-2.5 pr-4 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                    placeholder={t("Masukkan kode pos")}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 text-right">{t("Contoh: 12345")}</p>
              </div>
            </div>
          </div>

          {/* Minat */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">{t("Minat (Interest)")}</h3>
            <p className="text-[10px] text-gray-500 mb-3">{t("Pilih minat kamu (bisa lebih dari satu)")}</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors ${selected ? 'bg-white border-white' : 'bg-white border-gray-300'}`}>
                      {selected && <svg className="w-2.5 h-2.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {t(interest)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Agreement */}
          <div className="flex items-center gap-2.5 pt-2">
            <input type="checkbox" aria-label={t("Syarat dan Ketentuan")} checked={agree} onChange={e => setAgree(e.target.checked)} required className="w-[15px] h-[15px] accent-gray-900" />
            <p className="text-[11px] text-gray-500 leading-tight">
              {t("Saya menyetujui")} <a href="#" className="text-[#0866ff] font-semibold hover:underline">{t("Syarat dan Ketentuan")}</a> {t("serta")} <a href="#" className="text-[#0866ff] font-semibold hover:underline">{t("Kebijakan Privasi")}</a> {t("Postterest.")}
            </p>
          </div>

          {/* Submit */}
          {error && <p role="alert" className="text-sm text-red-600">{t(error)}</p>}
          <button type="submit" disabled={busy} className="w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {t("Daftar Sekarang")}
            <span className="text-lg leading-none">&rarr;</span>
          </button>
        </form>

        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-[10px] text-gray-400 font-medium">{t("atau daftar dengan")}</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="mt-6">
          <OAuthButtons onOAuth={onOAuth} verb="Daftar" />
        </div>

        <div className="mt-8 text-center text-[11px] text-gray-500">
          {t("Sudah punya akun?")}{' '}
          <button onClick={onNavigateToLogin} className="text-[#0866ff] font-bold hover:underline">
            {t("Login sekarang")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
