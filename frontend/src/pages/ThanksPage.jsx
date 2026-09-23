import React from 'react';
import { Link } from 'react-router-dom';

export default function ThanksPage() {
  return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <section className="max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900">Sampai jumpa</h1>
      <p className="mt-3 text-gray-500">Kamu sudah berhasil keluar dari Connect Modern.</p>
      <Link to="/login" className="mt-7 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white">Masuk kembali</Link>
    </section>
  </main>;
}
