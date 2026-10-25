import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // New Vehicle Form State
  const [form, setForm] = useState({
    make: '',
    model: '',
    category: '',
    price: '',
    quantity: '',
  });

  // Edit Vehicle Modal State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  // --- API Calls ---
  const loadVehicles = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query.trim()
        ? `/vehicles/search?make=${encodeURIComponent(query)}&model=${encodeURIComponent(query)}&category=${encodeURIComponent(query)}`
        : '/vehicles';
      const res = await api.get(endpoint);
      setVehicles(Array.isArray(res.data) ? res.data : []);
      setErr('');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const timeout = setTimeout(() => {
        loadVehicles(search);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [token, search, loadVehicles]);

  // Auth Operations
  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setErr('');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password });
      await handleLogin();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setVehicles([]);
  };

  // Inventory & Vehicle Operations
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
      setForm({ make: '', model: '', category: '', price: '', quantity: '' });
      loadVehicles(search);
    } catch (e: any) {
      const msg = e?.response?.data?.error;
      setErr(Array.isArray(msg) ? msg.map((m: any) => m.message).join(', ') : msg || 'Failed to add vehicle');
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      await api.put(`/vehicles/${editingVehicle.id}`, {
        make: editingVehicle.make,
        model: editingVehicle.model,
        category: editingVehicle.category,
        price: Number(editingVehicle.price),
        quantity: Number(editingVehicle.quantity),
      });
      setEditingVehicle(null);
      loadVehicles(search);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Failed to update vehicle');
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      loadVehicles(search);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Purchase failed');
    }
  };

  const handleRestock = async (id: string) => {
    const raw = prompt('Enter restock quantity:', '1');
    if (!raw) return;
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount <= 0) return alert('Enter a valid positive number');

    try {
      await api.post(`/vehicles/${id}/restock`, { amount });
      loadVehicles(search);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Restock failed (Admin required)');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      loadVehicles(search);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Delete failed (Admin required)');
    }
  };

  // --- Login / Register Screen ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-slate-200">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">🚗 Dealership Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to manage and view inventory</p>
          </div>

          {err && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-lg border border-rose-200 flex justify-between">
              <span>{err}</span>
              <button onClick={() => setErr('')} className="font-bold">×</button>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Email Address</label>
              <input
                className="border border-slate-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Password</label>
              <input
                className="border border-slate-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 font-medium text-white px-4 py-2.5 rounded-lg flex-1 shadow transition"
              onClick={handleLogin}
            >
              Sign In
            </button>
            <button
              className="bg-slate-700 hover:bg-slate-800 font-medium text-white px-4 py-2.5 rounded-lg flex-1 shadow transition"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application Dashboard ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">🚗 Car Dealership</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {user?.role || 'USER'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">{user?.email}</span>
            <button
              className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium px-3.5 py-1.5 rounded-lg transition"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-6">
        {err && (
          <div className="bg-rose-100 text-rose-800 p-3.5 rounded-xl mb-6 flex justify-between items-center shadow-sm">
            <span>{err}</span>
            <button onClick={() => setErr('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Admin Inventory Management Section */}
        {isAdmin && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h2 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-3">Add New Inventory</h2>
            <form onSubmit={handleAddVehicle} className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <input
                required
                className="border border-slate-300 p-2 rounded-lg text-sm"
                placeholder="Make (e.g. Toyota)"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
              />
              <input
                required
                className="border border-slate-300 p-2 rounded-lg text-sm"
                placeholder="Model (e.g. Camry)"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
              <input
                required
                className="border border-slate-300 p-2 rounded-lg text-sm"
                placeholder="Category (e.g. Sedan)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                required
                type="number"
                min="1"
                step="0.01"
                className="border border-slate-300 p-2 rounded-lg text-sm"
                placeholder="Price ($)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                required
                type="number"
                min="0"
                className="border border-slate-300 p-2 rounded-lg text-sm"
                placeholder="Qty"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm py-2 transition"
              >
                + Add Vehicle
              </button>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            className="w-full bg-white border border-slate-300 p-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by make, model, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No vehicles found matching your criteria.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => {
              const isOutOfStock = v.quantity === 0;

              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                    isOutOfStock ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {v.make} {v.model}
                        </h3>
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-md mt-1 font-medium">
                          {v.category}
                        </span>
                      </div>
                      <span className="text-xl font-extrabold text-blue-600">
                        ${v.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Stock Status:</span>
                      <span
                        className={`font-semibold ${
                          isOutOfStock ? 'text-rose-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${v.quantity} units available`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handlePurchase(v.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg text-sm transition"
                    >
                      {isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}
                    </button>

                    {isAdmin && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleRestock(v.id)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold py-1.5 rounded-lg transition"
                        >
                          + Restock
                        </button>
                        <button
                          onClick={() => setEditingVehicle(v)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-1.5 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Admin Edit Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Vehicle</h3>
            <form onSubmit={handleUpdateVehicle} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Make</label>
                <input
                  required
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm mt-0.5"
                  value={editingVehicle.make}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Model</label>
                <input
                  required
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm mt-0.5"
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <input
                  required
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm mt-0.5"
                  value={editingVehicle.category}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Price ($)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm mt-0.5"
                    value={editingVehicle.price}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm mt-0.5"
                    value={editingVehicle.quantity}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="w-1/2 border border-slate-300 text-slate-700 font-medium py-2 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}