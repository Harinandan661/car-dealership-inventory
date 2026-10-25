import { useEffect, useState } from 'react';
import { api } from './api';

type Vehicle = { id: string; make: string; model: string; category: string; price: number; quantity: number };

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ make: '', model: '', category: '', price: '', quantity: '' });
  const [err, setErr] = useState('');

  const load = async () => {
    try { const res = await api.get('/vehicles'); setVehicles(res.data); }
    catch (e: any) { setErr(e?.response?.data?.error || 'Failed to load'); }
  };
  useEffect(() => { if (token) load(); }, [token]);

  const login = async () => {
    try { const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); setToken(res.data.token); setErr('');
    } catch (e: any) { setErr(e?.response?.data?.error || 'Login failed'); }
  };
  const register = async () => {
    try { await api.post('/auth/register', { email, password }); await login(); }
    catch (e: any) { setErr(e?.response?.data?.error || 'Register failed'); }
  };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  const addVehicle = async () => {
    try {
      await api.post('/vehicles', { ...form, price: Number(form.price), quantity: Number(form.quantity) });
      setForm({ make: '', model: '', category: '', price: '', quantity: '' });
      load();
    } catch (e: any) { setErr(e?.response?.data?.error || 'Add failed'); }
  };
  const purchase = async (id: string) => {
    try { await api.post(`/vehicles/${id}/purchase`); load(); }
    catch (e: any) { setErr(e?.response?.data?.error || 'Purchase failed'); }
  };
  const remove = async (id: string) => {
    try { await api.delete(`/vehicles/${id}`); load(); }
    catch { alert('Admin only — update role in prisma studio'); }
  };

  const filtered = vehicles.filter(v =>
    `${v.make} ${v.model} ${v.category}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow w-96 space-y-3">
        <h1 className="text-2xl font-bold">🚗 Car Dealership</h1>
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <input className="border p-2 w-full rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 w-full rounded" type="password" placeholder="Password (min 6)" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded flex-1" onClick={login}>Login</button>
          <button className="bg-slate-600 text-white px-4 py-2 rounded flex-1" onClick={register}>Register</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🚗 Inventory</h1>
          <button className="bg-slate-700 text-white px-4 py-2 rounded" onClick={logout}>Logout</button>
        </div>

        {err && <div className="bg-rose-100 text-rose-700 p-2 rounded mb-3">{err}</div>}

        <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-2 md:grid-cols-6 gap-2">
          <input className="border p-2 rounded" placeholder="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Qty" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <button className="bg-emerald-600 text-white rounded px-3" onClick={addVehicle}>Add</button>
        </div>

        <input className="border p-2 rounded w-full mb-4" placeholder="Search by make / model / category…" value={search} onChange={e => setSearch(e.target.value)} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="bg-white p-4 rounded-xl shadow">
              <div className="text-lg font-semibold">{v.make} {v.model}</div>
              <div className="text-sm text-slate-500">{v.category}</div>
              <div className="text-blue-600 font-bold mt-2">${v.price.toLocaleString()}</div>
              <div className="text-sm">In stock: {v.quantity}</div>
              <div className="flex gap-2 mt-3">
                <button disabled={v.quantity === 0} onClick={() => purchase(v.id)}
                  className="bg-blue-600 disabled:bg-slate-300 text-white px-3 py-1 rounded flex-1">Purchase</button>
                <button onClick={() => remove(v.id)} className="bg-rose-600 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
