import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function ForgotPasswordPage() {
  const [target, setTarget] = useState('');
  const [channel, setChannel] = useState('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestCode(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      const result = await authApi.forgotPassword(target, channel);
      setSent(true);
      setMessage(result.dev_code ? `Kode development: ${result.dev_code}` : 'Kode verifikasi sudah dikirim.');
    } catch (err) { setError(err.response?.data?.error || 'Gagal mengirim kode verifikasi.'); }
  }

  async function reset(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      await authApi.resetPassword(target, code, password);
      setMessage('Password berhasil diubah. Silakan masuk kembali.');
      setSent(false); setCode(''); setPassword('');
    } catch (err) { setError(err.response?.data?.error || 'Kode tidak valid atau sudah kedaluwarsa.'); }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Lupa password</h1>
      <p className="mt-2 text-sm text-gray-500">Kami akan mengirim kode verifikasi ke akunmu.</p>
      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      <form onSubmit={requestCode} className="mt-6 space-y-4">
        <input required value={target} onChange={e => setTarget(e.target.value)} placeholder="Email, username, atau nomor telepon" className="w-full rounded-lg border p-3" />
        <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full rounded-lg border p-3">
          <option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option>
        </select>
        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white">Kirim kode</button>
      </form>
      {sent && <form onSubmit={reset} className="mt-6 space-y-4 border-t pt-6">
        <input required value={code} onChange={e => setCode(e.target.value)} placeholder="Kode verifikasi" inputMode="numeric" className="w-full rounded-lg border p-3" />
        <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password baru (min. 8 karakter)" className="w-full rounded-lg border p-3" />
        <button className="w-full rounded-lg bg-gray-900 p-3 font-semibold text-white">Ubah password</button>
      </form>}
      <Link to="/login" className="mt-6 block text-center text-sm text-blue-600">Kembali ke login</Link>
    </section>
  </main>;
}
