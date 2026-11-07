import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CarFront, FileText, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Membaca tab aktif saat ini dari URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'ringkasan';

  const menu = [
    { id: 'ringkasan', name: 'Ringkasan Harian', path: '/dashboard?tab=ringkasan', icon: <LayoutDashboard size={20} /> },
    { id: 'armada', name: 'Katalog Armada', path: '/dashboard?tab=armada', icon: <CarFront size={20} /> },
    { id: 'order', name: 'Order & Transaksi', path: '/dashboard?tab=order', icon: <FileText size={20} /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem('tenantId');
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 relative z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">S</div>
          <span className="font-bold text-xl text-white tracking-tight">Sobat<span className="text-blue-500">Rental</span></span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Utama</p>
          {menu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Keluar Akun</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-y-auto z-10">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-bold text-white hidden sm:block">Dashboard Tenant</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-white">ID: {localStorage.getItem('tenantId') || 'Anonim'}</p>
              <p className="text-xs text-blue-400 font-medium">Sistem Cloud Aktif</p>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 w-full bg-slate-900 border-b border-slate-800 z-30 shadow-xl">
            {menu.map((item) => (
              <button key={item.id} onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-4 border-b border-slate-800/50 ${activeTab === item.id ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                {item.icon} <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-slate-800">
              <LogOut size={20} /> <span className="text-sm font-medium">Keluar Akun</span>
            </button>
          </div>
        )}

        <div className="p-4 sm:p-8 relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}