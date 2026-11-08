import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../App';
import { 
  CarFront, PlusCircle, AlertCircle, Loader2, X, Edit, Banknote, 
  Calendar, Wallet, Clock, Search, Phone, MessageCircle 
} from 'lucide-react';

const getLocalDateString = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function TenantDashboard() {
  const [data, setData] = useState({ kendaraan: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const todayStr = getLocalDateString(new Date()); 
  
  const [filterTgl, setFilterTgl] = useState(todayStr); 
  const [filterOrder, setFilterOrder] = useState('');
  const [orderView, setOrderView] = useState('aktif');

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showArmadaModal, setShowArmadaModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formArmada, setFormArmada] = useState({ old_plat: '', plat_nomor: '', merk: '', kategori: 'Mobil', status_unit: 'Aktif' });
  const [formOrder, setFormOrder] = useState({ 
    id_order: '', plat_nomor: '', nama_klien: '', no_telp: '', tgl_mulai: todayStr, tgl_selesai: todayStr, 
    total_harga: '', dibayar: '', deposit_uang: '', jaminan_teks: '', status_order: 'Draf' 
  });

  const navigate = useNavigate();
  const location = useLocation();
  const tenantId = localStorage.getItem('tenantId');
  const activeTab = new URLSearchParams(location.search).get('tab') || 'ringkasan';

  const fetchData = () => {
    setLoading(true);
    fetch(`${API_URL}?action=tenant_get_data&tenantId=${tenantId}&t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(r => r.json()).then(res => { setData(res); setLoading(false); }).catch(console.error);
  };

  useEffect(() => {
    if (!tenantId) navigate('/auth'); else fetchData();
  }, [tenantId, navigate]);

  // Handlers Armada
  const openAddArmada = () => { setIsEditMode(false); setFormArmada({ old_plat: '', plat_nomor: '', merk: '', kategori: 'Mobil', status_unit: 'Aktif' }); setShowArmadaModal(true); };
  const openEditArmada = (k) => { setIsEditMode(true); setFormArmada({ old_plat: k.plat, plat_nomor: k.plat, merk: k.merk, kategori: k.kategori, status_unit: k.status_unit }); setShowArmadaModal(true); };
  const submitArmada = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: isEditMode ? 'edit_kendaraan' : 'add_kendaraan', tenantId, ...formArmada }) });
    setShowArmadaModal(false); setIsSubmitting(false); fetchData();
  };

  // Handlers Order
  const openAddOrder = () => { setIsEditMode(false); setFormOrder({ id_order: '', plat_nomor: '', nama_klien: '', no_telp: '', tgl_mulai: todayStr, tgl_selesai: todayStr, total_harga: '', dibayar: '', deposit_uang: '', jaminan_teks: '', status_order: 'Draf' }); setShowOrderModal(true); };
  const openEditOrder = (o) => { 
    setIsEditMode(true); 
    setFormOrder({ 
      id_order: o.id, plat_nomor: o.plat, nama_klien: o.klien, no_telp: o.no_telp || '', tgl_mulai: getLocalDateString(o.tgl_mulai), tgl_selesai: getLocalDateString(o.tgl_selesai), 
      total_harga: o.total_harga, dibayar: o.dibayar, deposit_uang: o.deposit_uang, jaminan_teks: o.jaminan_teks, status_order: o.status_order 
    }); setShowOrderModal(true); 
  };
  const submitOrder = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const sisa = Number(formOrder.total_harga) - Number(formOrder.dibayar);
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: isEditMode ? 'edit_order' : 'add_order', tenantId, ...formOrder, sisa }) });
    setShowOrderModal(false); setIsSubmitting(false); fetchData();
  };

  // Auto-Generate Nota WhatsApp
  const handleKirimWA = (o) => {
    if (!o.no_telp) return alert("Nomor telepon kosong!");
    const tglMulai = new Date(o.tgl_mulai).toLocaleDateString('id-ID', {day:'2-digit', month:'short'});
    const tglSelesai = new Date(o.tgl_selesai).toLocaleDateString('id-ID', {day:'2-digit', month:'short'});
    
    // Teks penuh dikembalikan
    let pesan = `Halo kak ${o.klien}, ini rincian sewa dari rental kami:\n\n`;
    pesan += `Unit: ${o.plat}\nJadwal: ${tglMulai} s/d ${tglSelesai}\nJaminan: ${o.jaminan_teks}\n\n`;
    pesan += `Total Sewa: Rp ${Number(o.total_harga).toLocaleString('id-ID')}\n`;
    pesan += `Telah Dibayar: Rp ${Number(o.dibayar).toLocaleString('id-ID')}\n`;
    if (Number(o.sisa) > 0) pesan += `Sisa Tagihan: Rp ${Number(o.sisa).toLocaleString('id-ID')}\n`;
    if (Number(o.deposit_uang) > 0) pesan += `Deposit Ditahan: Rp ${Number(o.deposit_uang).toLocaleString('id-ID')}\n`;
    pesan += `\nMohon kabari kami jika ada kendala. Terima kasih! `;
   
    let noWa = String(o.no_telp).replace(/\D/g, '');
    if (noWa.startsWith('0')) noWa = '62' + noWa.substring(1);
    window.open(`https://wa.me/${noWa}?text=${encodeURIComponent(pesan)}`, '_blank');
  };

  // ===================== LOGIKA BISNIS =====================
  
  // 1. Ketersediaan Absolut Hari Ini
  const ketersediaanHariIni = useMemo(() => {
    const tersewa = new Set();
    data.orders.forEach(o => {
      if (['Dikembalikan', 'Selesai', 'Dibatalkan', 'Draf'].includes(o.status_order)) return;
      if (todayStr >= getLocalDateString(o.tgl_mulai) && todayStr <= getLocalDateString(o.tgl_selesai)) tersewa.add(o.plat);
    });
    return data.kendaraan.filter(k => k.status_unit !== 'Maintenance' && !tersewa.has(k.plat));
  }, [data, todayStr]);

  // 2. Ketersediaan Dinamis Kalender
  const ketersediaan = useMemo(() => {
    const tersewa = new Set();
    data.orders.forEach(o => {
      if (['Dikembalikan', 'Selesai', 'Dibatalkan', 'Draf'].includes(o.status_order)) return; 
      if (filterTgl >= getLocalDateString(o.tgl_mulai) && filterTgl <= getLocalDateString(o.tgl_selesai)) tersewa.add(o.plat);
    });
    const hasil = { tersedia: [], tertahan: [], maintenance: [] };
    data.kendaraan.forEach(k => {
      if (k.status_unit === 'Maintenance') hasil.maintenance.push(k);
      else if (tersewa.has(k.plat)) hasil.tertahan.push(k);
      else hasil.tersedia.push(k);
    });
    return hasil;
  }, [data, filterTgl]);

  // 3. Dropdown Unit Buat Order
  const availableCarsForBooking = useMemo(() => {
    return data.kendaraan.filter(k => {
      if (k.status_unit === 'Maintenance') return false; 
      const isOverlap = data.orders.some(o => {
        if (isEditMode && o.id === formOrder.id_order) return false; 
        if (['Dikembalikan', 'Selesai', 'Dibatalkan', 'Draf'].includes(o.status_order)) return false;
        
        if (o.plat === k.plat) {
           return getLocalDateString(o.tgl_mulai) <= formOrder.tgl_selesai && getLocalDateString(o.tgl_selesai) >= formOrder.tgl_mulai;
        }
        return false;
      });
      return !isOverlap; 
    });
  }, [data, formOrder.tgl_mulai, formOrder.tgl_selesai, formOrder.id_order, isEditMode]);

  // 4. Notifikasi Overdue & Piutang Harian
  const pengembalianHariIni = [];
  const unitTerlambat = [];
  data.orders.forEach(o => {
    if (['Dikembalikan', 'Selesai', 'Dibatalkan', 'Draf'].includes(o.status_order)) return;
    const endDate = getLocalDateString(o.tgl_selesai);
    if (endDate === todayStr) pengembalianHariIni.push(o);
    else if (endDate < todayStr) unitTerlambat.push(o);
  });
  
  const totalPiutang = data.orders.reduce((sum, o) => sum + (['Selesai', 'Dibatalkan'].includes(o.status_order) ? 0 : Number(o.sisa)), 0);
  const totalAktif = data.orders.filter(o => !['Selesai', 'Dibatalkan'].includes(o.status_order)).length;

  // 5. Kalkulasi Kas Masuk
  const curMonth = new Date().getMonth();
  const curYear = new Date().getFullYear();
  let [incomeAllTime, incomeMonth, incomeYear] = [0, 0, 0];
  data.orders.forEach(o => {
    if (['Dibatalkan', 'Draf'].includes(o.status_order)) return; 
    const d = Number(o.dibayar) || 0;
    const sDate = new Date(o.tgl_mulai);
    incomeAllTime += d;
    if (sDate.getFullYear() === curYear) {
      incomeYear += d;
      if (sDate.getMonth() === curMonth) incomeMonth += d;
    }
  });

  // 6. Filter Tabel Order 
  const filteredOrders = data.orders.filter(o => {
    const isEnd = ['Selesai', 'Dibatalkan'].includes(o.status_order);
    if (activeTab === 'ringkasan') return !isEnd; 
    if (activeTab === 'order') {
      if (orderView === 'aktif' && isEnd) return false;
      if (orderView === 'riwayat' && !isEnd) return false;
      if (filterOrder && (filterOrder < getLocalDateString(o.tgl_mulai) || filterOrder > getLocalDateString(o.tgl_selesai))) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-32 text-blue-500 gap-4"><Loader2 className="animate-spin" size={40} /><span className="font-bold text-lg">Sinkronisasi Database...</span></div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* ==================== TAB: RINGKASAN ==================== */}
      {activeTab === 'ringkasan' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tersedia Hari Ini</p>
              <h3 className="text-3xl font-black text-white">{ketersediaanHariIni.length} <span className="text-xs text-blue-400 font-medium">Unit</span></h3>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Piutang Klien (Sisa)</p>
              <h3 className="text-2xl font-black text-red-400 mt-1">Rp {totalPiutang.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-amber-900/50 shadow-xl relative overflow-hidden">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2"><Clock size={14}/> Jatuh Tempo Hari Ini</p>
              <h3 className="text-3xl font-black text-amber-500 mt-1">{pengembalianHariIni.length} <span className="text-xs font-medium">Mobil</span></h3>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-red-900/50 shadow-xl relative overflow-hidden">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2"><AlertCircle size={14}/> Terlambat / Overdue</p>
              <h3 className="text-3xl font-black text-red-500 mt-1">{unitTerlambat.length} <span className="text-xs font-medium">Kasus</span></h3>
            </div>
          </div>

          {(unitTerlambat.length > 0 || pengembalianHariIni.length > 0) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Peringatan Pengembalian</h3>
              <div className="space-y-3">
                {unitTerlambat.map(o => (
                  <div key={o.id} className="flex justify-between items-center bg-red-950/20 border border-red-900/30 p-4 rounded-xl">
                    <div>
                      <span className="bg-red-900/50 text-red-400 text-xs font-bold px-2 py-1 rounded mb-1 inline-block">TERLAMBAT / OVERDUE</span>
                      <p className="font-bold text-white">{o.klien} ({o.plat})</p>
                      <p className="text-xs text-red-300 flex items-center gap-1 mt-1"><Phone size={12}/> {o.no_telp || '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleKirimWA(o)} className="text-white bg-green-600/80 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"><MessageCircle size={16}/> Tagih WA</button>
                      <button onClick={() => openEditOrder(o)} className="text-red-400 hover:text-white bg-red-900/20 px-3 py-2 rounded-lg text-sm font-bold transition">Tindak / Edit</button>
                    </div>
                  </div>
                ))}
                {pengembalianHariIni.map(o => (
                  <div key={o.id} className="flex justify-between items-center bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl">
                    <div>
                      <span className="bg-amber-900/50 text-amber-400 text-xs font-bold px-2 py-1 rounded mb-1 inline-block">KEMBALI HARI INI</span>
                      <p className="font-bold text-white">{o.klien} ({o.plat})</p>
                      <p className="text-xs text-amber-300 flex items-center gap-1 mt-1"><Phone size={12}/> {o.no_telp || '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleKirimWA(o)} className="text-white bg-green-600/80 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"><MessageCircle size={16}/> Ingatkan WA</button>
                      <button onClick={() => openEditOrder(o)} className="text-amber-400 hover:text-white bg-amber-900/20 px-3 py-2 rounded-lg text-sm font-bold transition">Proses</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-bold text-white">Unit Tersedia (Hari Ini)</h3>
            {ketersediaanHariIni.length > 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {ketersediaanHariIni.map(k => (
                  <div key={k.plat} className="flex justify-between items-center p-3 border border-slate-800 rounded-xl hover:bg-slate-800 transition">
                    <div><h4 className="font-bold text-white text-sm">{k.merk}</h4><p className="text-xs text-blue-400 font-mono mt-0.5">{k.plat}</p></div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-6 text-slate-500 text-sm bg-slate-900 rounded-2xl border border-slate-800">Semua armada keluar hari ini.</div>}
          </div>
        </>
      )}

      {/* ==================== TAB: ARMADA ==================== */}
      {activeTab === 'armada' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-white">Katalog & Jadwal Armada</h3>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg">
                <span className="text-xs font-bold text-slate-500 ml-2 uppercase">Cek Jadwal:</span>
                <input type="date" value={filterTgl} onChange={e => setFilterTgl(e.target.value)} className="bg-transparent text-white text-sm outline-none px-2 [color-scheme:dark]" />
              </div>
              <button onClick={openAddArmada} className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg border border-slate-700 transition">Tambah Unit</button>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-full mb-1"><span className="bg-blue-900/30 text-blue-400 text-xs font-bold px-3 py-1 rounded border border-blue-800/50">TERSEDIA TGL {new Date(filterTgl).toLocaleDateString('id-ID')} ({ketersediaan.tersedia.length})</span></div>
            {ketersediaan.tersedia.map(k => (
              <div key={k.plat} className="flex justify-between items-center p-3 border border-slate-800 rounded-xl hover:bg-slate-800 transition">
                <div><h4 className="font-bold text-white text-sm">{k.merk}</h4><p className="text-xs text-blue-400 font-mono mt-0.5">{k.plat}</p></div>
                <button onClick={() => openEditArmada(k)}><Edit size={16} className="text-slate-500 hover:text-white"/></button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ketersediaan.tertahan.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
                <span className="bg-amber-900/30 text-amber-500 text-xs font-bold px-3 py-1 rounded border border-amber-800/50">DIPESAN / TERTAHAN</span>
                {ketersediaan.tertahan.map(k => (<div key={k.plat} className="p-3 border border-slate-800 rounded-xl opacity-60"><h4 className="font-bold text-white text-sm">{k.merk}</h4><p className="text-xs text-slate-400 font-mono">{k.plat}</p></div>))}
              </div>
            )}
            {ketersediaan.maintenance.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
                <span className="bg-red-900/30 text-red-400 text-xs font-bold px-3 py-1 rounded border border-red-800/50">MAINTENANCE</span>
                {ketersediaan.maintenance.map(k => (
                  <div key={k.plat} className="flex justify-between items-center p-3 border border-slate-800 rounded-xl"><div className="opacity-60"><h4 className="font-bold text-white text-sm">{k.merk}</h4><p className="text-xs text-slate-400 font-mono">{k.plat}</p></div><button onClick={() => openEditArmada(k)}><Edit size={16} className="text-slate-500"/></button></div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: ORDER ==================== */}
      {activeTab === 'order' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex justify-center items-center"><Banknote size={24}/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Kas Bulan Ini</p><h3 className="text-2xl font-black text-white">Rp {incomeMonth.toLocaleString('id-ID')}</h3></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-900/30 text-green-400 flex justify-center items-center"><Calendar size={24}/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Kas Tahun Ini</p><h3 className="text-2xl font-black text-white">Rp {incomeYear.toLocaleString('id-ID')}</h3></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 flex justify-center items-center"><Wallet size={24}/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Kas All-Time</p><h3 className="text-2xl font-black text-white">Rp {incomeAllTime.toLocaleString('id-ID')}</h3></div>
          </div>
        </div>
      )}

      {/* ==================== TABEL TRANSAKSI ==================== */}
      {(activeTab === 'ringkasan' || activeTab === 'order') && (
        <div className="space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mt-6">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-white">{activeTab === 'order' ? 'Database Transaksi' : 'Order Sedang Berjalan'}</h3>
              {activeTab === 'order' && (
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button onClick={() => setOrderView('aktif')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${orderView === 'aktif' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Berjalan ({totalAktif})</button>
                  <button onClick={() => setOrderView('riwayat')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${orderView === 'riwayat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Riwayat Selesai</button>
                </div>
              )}
            </div>

            {activeTab === 'order' && (
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg">
                  <Search size={16} className="text-slate-500 ml-2" />
                  <input type="date" value={filterOrder} onChange={e => setFilterOrder(e.target.value)} className="bg-transparent text-white text-sm outline-none px-2 [color-scheme:dark]" />
                  {filterOrder && <button onClick={() => setFilterOrder('')} className="pr-2 text-slate-500 hover:text-red-400"><X size={16}/></button>}
                </div>
                <button onClick={openAddOrder} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition shadow-lg justify-center w-full sm:w-auto">
                  <PlusCircle size={18} /> Buat Order
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Penyewa & Kontak</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Unit & Jadwal</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Keuangan & Deposit</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredOrders.map(o => {
                  const s = o.status_order;
                  const c = s==='Dipesan'?'text-blue-400 border-blue-800 bg-blue-900/50':s==='Diambil'?'text-amber-400 border-amber-800 bg-amber-900/50':s==='Dikembalikan'?'text-purple-400 border-purple-800 bg-purple-900/50':s==='Selesai'?'text-green-400 border-green-800 bg-green-900/50':s==='Dibatalkan'?'text-red-400 border-red-800 bg-red-900/50':'text-slate-300 bg-slate-800';
                  return (
                    <tr key={o.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 sm:px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${c}`}>{s.toUpperCase()}</span></td>
                      <td className="px-4 sm:px-6 py-4"><p className="font-bold text-white">{o.klien}</p><p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={12}/> {o.no_telp || '-'}</p></td>
                      
                      {/* FIX: Tanggal Mulai dan Selesai dipisah 2 baris (stacked) untuk memperkecil lebar di mobile */}
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-bold text-blue-400 mb-1">{o.plat}</p>
                        <div className="flex flex-col text-[11px] sm:text-xs text-slate-400 space-y-0.5">
                          <div><span className="inline-block w-8 text-slate-500">Out:</span> {new Date(o.tgl_mulai).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                          <div><span className="inline-block w-8 text-slate-500">In:</span> {new Date(o.tgl_selesai).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 items-center"><span className="text-slate-500 text-[10px] uppercase w-12">Sewa</span>{o.sisa > 0 ? <span className="text-red-400 text-xs font-bold">Sisa Rp {Number(o.sisa).toLocaleString('id-ID')}</span> : <span className="text-green-400 text-xs font-bold">LUNAS (Rp {Number(o.dibayar).toLocaleString('id-ID')})</span>}</div>
                          {Number(o.deposit_uang) > 0 && <div className="flex gap-2 items-center"><span className="text-slate-500 text-[10px] uppercase w-12">Titip</span><span className="text-amber-400 text-xs font-bold">Rp {Number(o.deposit_uang).toLocaleString('id-ID')} (Ditahan)</span></div>}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button onClick={() => handleKirimWA(o)} className="text-green-500 hover:text-white transition p-2 rounded-lg hover:bg-green-900/50 mr-1 sm:mr-2" title="Kirim Nota via WA"><MessageCircle size={16}/></button>
                        <button onClick={() => openEditOrder(o)} className="text-slate-400 hover:text-blue-400 transition p-2 rounded-lg hover:bg-slate-800"><Edit size={16}/></button>
                      </td>
                    </tr>
                  )
                })}
                {filteredOrders.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-slate-500">Tidak ada data order ditemukan.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ORDER ======================= */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">     <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{isEditMode ? 'Manajemen Order' : 'Buat Order Baru'}</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={submitOrder} className="space-y-5">
              
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase">1. Penjadwalan Sewa (Pilih Tgl Dulu)</h4>
                
                {/* FIX: Input Tanggal menjadi grid-cols-1 di mobile, tapi grid-cols-2 di tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tgl Mulai</label>
                    <input required value={formOrder.tgl_mulai} type="date" className="w-1/2 sm:w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 [color-scheme:dark]" onChange={e => setFormOrder({...formOrder, tgl_mulai: e.target.value, plat_nomor: ''})} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tgl Selesai (Kembali)</label>
                    <input required value={formOrder.tgl_selesai} type="date" className="w-1/2 sm:w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 [color-scheme:dark]" onChange={e => setFormOrder({...formOrder, tgl_selesai: e.target.value, plat_nomor: ''})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Pilih Unit (Hanya Yg Tersedia)</label>
                    <select required value={formOrder.plat_nomor} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, plat_nomor: e.target.value})}>
                      <option value="">-- Pilih --</option>
                      {availableCarsForBooking.map((k, i) => <option key={i} value={k.plat}>{k.merk} ({k.plat})</option>)}
                    </select>
                    {availableCarsForBooking.length === 0 && <p className="text-red-400 text-xs mt-1">Semua unit penuh di rentang tanggal ini.</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Status Booking</label>
                    <select value={formOrder.status_order} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold" onChange={e => setFormOrder({...formOrder, status_order: e.target.value})}>
                      <option value="Draf">Draf (Tanya-tanya)</option><option value="Dipesan">Dipesan (Terkunci)</option><option value="Diambil">Diambil (Sedang Disewa)</option><option value="Dikembalikan">Dikembalikan (Pengecekan)</option><option value="Selesai">Selesai (Deposit Cair)</option><option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase">2. Profil & Keuangan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Nama Penyewa</label><input required value={formOrder.nama_klien} type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, nama_klien: e.target.value})} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">No. WA / Telepon</label><input required value={formOrder.no_telp} type="tel" placeholder="0812..." className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, no_telp: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Total Sewa (Rp)</label><input required value={formOrder.total_harga} type="number" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, total_harga: e.target.value})} /></div>
                  <div><label className="block text-xs text-blue-400 font-bold mb-1">Telah Dibayar</label><input required value={formOrder.dibayar} type="number" className="w-full bg-slate-900 border border-blue-900/50 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, dibayar: e.target.value})} /></div>
                  <div><label className="block text-xs text-amber-500 font-bold mb-1">Deposit Ditahan</label><input value={formOrder.deposit_uang} type="number" placeholder="0" className="w-full bg-slate-900 border border-amber-900/50 text-white rounded-lg px-3 py-2 outline-none focus:border-amber-500" onChange={e => setFormOrder({...formOrder, deposit_uang: e.target.value})} /></div>
                </div>
                <div><label className="block text-xs text-slate-500 mb-1">Jaminan Berkas/Barang</label><input required value={formOrder.jaminan_teks} type="text" placeholder="KTP Asli + Motor Vario B1234" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormOrder({...formOrder, jaminan_teks: e.target.value})} /></div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                {isSubmitting && <Loader2 className="animate-spin" size={18} />} {isEditMode ? 'Simpan Perubahan' : 'Terbitkan Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ARMADA ======================= */}
      {showArmadaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{isEditMode ? 'Edit Armada' : 'Tambah Armada'}</h3>
              <button onClick={() => setShowArmadaModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={submitArmada} className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-1">Merk / Tipe Kendaraan</label><input required value={formArmada.merk} type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500" onChange={e => setFormArmada({...formArmada, merk: e.target.value})} /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Plat Nomor</label><input required value={formArmada.plat_nomor} type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500" onChange={e => setFormArmada({...formArmada, plat_nomor: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-slate-400 mb-1">Kategori</label><select value={formArmada.kategori} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500" onChange={e => setFormArmada({...formArmada, kategori: e.target.value})}><option value="Mobil">Mobil</option><option value="Motor">Motor</option></select></div>
                <div><label className="block text-sm text-slate-400 mb-1">Kondisi</label><select value={formArmada.status_unit} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold" onChange={e => setFormArmada({...formArmada, status_unit: e.target.value})}><option value="Aktif">Aktif</option><option value="Maintenance">Maintenance</option></select></div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2">{isSubmitting && <Loader2 className="animate-spin" size={18} />} Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}