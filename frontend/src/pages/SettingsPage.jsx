import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';

export default function SettingsPage() {
  const { user, updateProfileState } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '', bio: user?.bio || '', city: user?.city || '', country: user?.country || '', website: user?.website || '', gender: user?.gender || 'other', profile_layout: user?.profile_layout || 'grid', is_private: Boolean(user?.is_private) });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setMessage(''); setError('');
    try { const updated = await userApi.updateSettings(form); updateProfileState(updated); setMessage('Pengaturan berhasil diperbarui.'); }
    catch (err) { setError(err.response?.data?.error || 'Pengaturan gagal disimpan.'); }
  }
  return <main className="min-h-screen bg-gray-50 p-6"><section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-bold">Pengaturan akun</h1>
    {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-green-700">{message}</p>}{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
      {['name','username','city','country','website'].map(key => <label key={key} className="text-sm font-medium capitalize">{key}<input value={form[key]} onChange={e => set(key, e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>)}
      <label className="text-sm font-medium">Gender<select value={form.gender} onChange={e => set('gender', e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option>male</option><option>female</option><option>other</option></select></label>
      <label className="text-sm font-medium">Layout<select value={form.profile_layout} onChange={e => set('profile_layout', e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="grid">Grid</option><option value="long">Long card</option></select></label>
      <label className="sm:col-span-2 text-sm font-medium">Bio<textarea value={form.bio} onChange={e => set('bio', e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border p-3" /></label>
      <label className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" checked={form.is_private} onChange={e => set('is_private', e.target.checked)} /> Jadikan akun private</label>
      <button className="sm:col-span-2 rounded-lg bg-blue-600 p-3 font-semibold text-white">Simpan perubahan</button>
    </form>
  </section></main>;
}
