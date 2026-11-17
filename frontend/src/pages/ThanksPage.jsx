import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function ThanksPage() {
  const { t: translateUI } = useLanguage();

  return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <section className="max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900">{translateUI("Sampai jumpa")}</h1>
      <p className="mt-3 text-gray-500">{translateUI("Kamu sudah berhasil keluar dari postter.us.")}</p>
      <Link to="/login" className="mt-7 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white">{translateUI("Masuk kembali")}</Link>
    </section>
  </main>;
}
