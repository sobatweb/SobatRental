import { useState, useEffect } from 'react';
import { API_URL } from '../App';
import { Users, CarFront, Banknote, ShieldAlert } from 'lucide-react';

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}?action=admin_get_users&t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(res => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (tenantId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'active' : 'pending';
    
    // Update Optimistic
    setUsers(users.map(u => u.tenantId === tenantId ? { ...u, status: newStatus } : u));
    
    // Fetch background
    await fetch(API_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admin_verify', tenantId, newStatus }) 
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold">Sinkronisasi Data Master...</div>;

  // Analitik Bisnis
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const estimatedRevenue = activeUsers * 50000;
  const totalKendaraanSistem = users.reduce((sum, u) => sum + (Number(u.kendaraan) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans selection:bg-blue-600/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">Console SobatWeb Enterprise</h1>
          <p className="text-slate-400 mt-1">Data Real-Time Operasional SaaS SobatRental</p>
        </div>

        {/* Metrik Bisnis Utama */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Tenant Aktif</p>
              <Users className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-black text-white">{activeUsers} Bisnis</p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Estimasi MRR (Bulan Ini)</p>
              <Banknote className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-black text-white">Rp {estimatedRevenue.toLocaleString('id-ID')}</p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Aset (Sistem)</p>
              <CarFront className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-black text-white">{totalKendaraanSistem} Mobil</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Menunggu Verifikasi</p>
              <ShieldAlert className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-black text-yellow-500">{pendingUsers} Antrean</p>
          </div>
        </div>

        {/* Tabel Master Tenant */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative z-10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-5 font-medium">Data Bisnis / Tenant ID</th>
                <th className="px-6 py-5 font-medium">Status Pembayaran</th>
                <th className="px-6 py-5 font-medium">Aset Dikelola</th>
                <th className="px-6 py-5 font-medium text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map(u => (
                <tr key={u.tenantId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-white text-base">{u.nama}</p>
                    <p className="font-mono text-slate-500 text-xs mt-1">{u.tenantId}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${u.status === 'active' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-yellow-900/30 text-yellow-500 border-yellow-800'}`}>
                      {u.status === 'active' ? 'AKTIF (LUNAS)' : 'PENDING 50K'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <CarFront size={16} className="text-slate-500" /> {u.kendaraan} Unit
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right relative z-20">
                    <button 
                      type="button"
                      onClick={() => toggleStatus(u.tenantId, u.status)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition relative cursor-pointer ${u.status === 'pending' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-red-400 hover:bg-slate-700'}`}
                    >
                      {u.status === 'pending' ? 'Verifikasi TF' : 'Cabut Lisensi'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="4" className="text-center py-10 text-slate-500">Belum ada pelanggan mendaftar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}