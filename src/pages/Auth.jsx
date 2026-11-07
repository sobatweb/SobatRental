import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ nama_bisnis: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingTenantId, setPendingTenantId] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = isLogin ? { action: 'login', ...form } : { action: 'register', ...form };
      const res = await fetch(API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload) 
      }).then(r => r.json());

      if (res.status === 'success') {
        if (res.userStatus === 'active') {
          localStorage.setItem('tenantId', res.tenantId);
          navigate('/dashboard');
        } else {
          setPendingTenantId(res.tenantId);
          setShowModal(true);
        }
      } else {
        alert(res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server. Cek koneksi Anda.');
    }
    setLoading(false);
  };

  // BUG FIX: Interval Polling Super Admin
  useEffect(() => {
    let interval;
    if (showModal && pendingTenantId) {
      interval = setInterval(async () => {
        try {
          // Menambahkan timestamp murni (&t=...) dan cache: no-store agar tidak baca memori lama
          const r = await fetch(`${API_URL}?action=check_status&tenantId=${pendingTenantId}&t=${new Date().getTime()}`, { cache: 'no-store' });
          const res = await r.json();
          
          if (res.status === 'active') {
            clearInterval(interval);
            setShowModal(false);
            localStorage.setItem('tenantId', pendingTenantId);
            
            // Hard-Redirect browser untuk memaksa pindah halaman dan me-refresh DOM (Bypass React Router)
            window.location.href = '/dashboard'; 
          }
        } catch (err) {
          console.error("Cek status delay:", err);
        }
      }, 3000); // Bertanya ke server setiap 3 detik
    }
    return () => clearInterval(interval);
  }, [showModal, pendingTenantId]);

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md m-auto px-6 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg shadow-blue-500/30">S</div>
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Masuk ke Dashboard' : 'Daftar SobatRental'}</h2>
            <p className="text-slate-400 text-sm mt-2">{isLogin ? 'Pantau pergerakan armada Anda hari ini.' : 'Hanya Rp 50.000/bulan, batalkan kapan saja.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nama Bisnis / Rental</label>
              <input type="text" required className="w-full bg-slate-950/50 text-white border border-slate-700 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-blue-500 outline-none transition" onChange={e => setForm({...form, nama_bisnis: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password Akses</label>
              <input type="password" required className="w-full bg-slate-950/50 text-white border border-slate-700 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-blue-500 outline-none transition" onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-2">
              {loading && <Loader2 className="animate-spin" size={18} />} 
              {loading ? 'Memproses...' : (isLogin ? 'Masuk Sekarang' : 'Buat Akun')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-white text-sm transition">
              {isLogin ? 'Belum punya akun? Daftar disini' : 'Sudah langganan? Masuk disini'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 rounded-t-3xl"></div>
            <h3 className="text-2xl font-black text-white mb-2 mt-2">Aktivasi Akun</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Selesaikan pembayaran bulan pertama agar Lisensi Admin dapat mengaktifkan akun Anda.</p>
            
            <div className="bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-800">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Transfer Ke Mandiri</p>
              <p className="text-2xl font-mono font-bold text-white tracking-tight">1550013730711</p>
              <p className="text-sm text-slate-400 mt-1">a.n MUHAMMAD NABIL FIRDI</p>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xl font-bold text-blue-500">Rp 50.000</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-blue-400 mb-6">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-semibold">Menunggu Verifikasi Admin...</span>
            </div>

            <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white text-sm font-medium">Tutup & Cek Nanti</button>
          </div>
        </div>
      )}
    </div>
  );
}