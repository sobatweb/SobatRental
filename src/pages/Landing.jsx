import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Float, ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { 
  CalendarCheck, ShieldCheck, CreditCard, Wallet, 
  CarFront, ArrowRight, CheckCircle2, Phone, Mail, MapPin 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Komponen 3D Abstrak Modern (Menggantikan Mobil)
function AbstractTechShapes() {
  return (
    <group>
      {/* Bentuk Utama (Icosahedron Wireframe) */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[0, 0.5, 0]}>
          <icosahedronGeometry args={[1.6, 0]} />
          <meshPhysicalMaterial color="#3b82f6" wireframe={true} emissive="#1e3a8a" emissiveIntensity={0.5} />
        </mesh>
      </Float>

      {/* Bola Kaca Melayang Kanan Atas */}
      <Float speed={3} rotationIntensity={2} floatIntensity={3}>
        <mesh position={[1.8, 1.8, -1]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshPhysicalMaterial color="#0ea5e9" metalness={0.9} roughness={0.1} clearcoat={1} transmission={0.4} thickness={0.5} />
        </mesh>
      </Float>

      {/* Cincin Torus Melayang Kiri Bawah */}
      <Float speed={1.5} rotationIntensity={3} floatIntensity={2}>
        <mesh position={[-1.5, -0.8, 1.2]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[0.7, 0.15, 16, 32]} />
          <meshPhysicalMaterial color="#60a5fa" metalness={0.5} roughness={0.2} />
        </mesh>
      </Float>

      {/* Bayangan Halus di Lantai */}
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={15} blur={3} far={5} />
    </group>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-600/30 selection:text-white">
      <Navbar />
      
      {/* 1. HERO SECTION DENGAN 3D KANVAS ABSTRAK */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-left md:text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Sistem Manajemen Rental Terpadu
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Stop Rugi Karena <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Double Booking.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Automasi ketersediaan armada, pantau jaminan dan kelola piutang pelanggan dalam satu dashboard pintar yang dirancang khusus untuk juragan rental.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:-translate-y-1">
                Coba Sekarang <ArrowRight size={20} />
              </Link>
              <a href="#alur" className="flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">
                Cara Kerja
              </a>
            </div>
          </div>

          {/* Area Render 3D Abstrak */}
          <div className="h-[400px] md:h-[500px] w-full relative cursor-grab active:cursor-grabbing">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
            <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Environment preset="city" />
              <AbstractTechShapes />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
            </Canvas>
          </div>
        </div>
      </section>

      {/* 2. FITUR SECTION */}
      <section id="fitur" className="py-24 bg-slate-950 relative border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kendali Penuh di Tangan Anda</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Tinggalkan pencatatan buku manual. Beralih ke sistem cloud yang mencegah kerugian administratif.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Kalender Anti-Bentrok', desc: 'Sistem otomatis mengunci jadwal jika mobil sudah dipesan, mustahil terjadi bentrok penyewa.', icon: <CalendarCheck size={32} /> },
              { 
  title: 'Pencatatan DP & Jaminan', 
  desc: 'Catat Uang Muka (DP), sisa tagihan, uang deposit, hingga jaminan barang/berkas (KTP/Motor) secara detail agar terdata rapi dan aman.', 
  icon: <Wallet size={32} /> 
},    { title: 'Manajemen Piutang', desc: 'Kelola klien yang baru bayar DP. Indikator merah untuk yang berutang, hijau untuk lunas.', icon: <Wallet size={32} /> }
            ].map((f, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/50 transition duration-300 group">
                <div className="mb-6 bg-blue-500/10 text-blue-500 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/20">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ALUR KERJA (CARA KERJA) */}
      <section id="alur" className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Sesimpel Hitungan Detik</h2>
              <p className="text-slate-400 mb-10 leading-relaxed">Dirancang untuk operasional yang cepat. Tidak perlu keahlian IT, staf Anda bisa menguasainya dalam 5 menit.</p>
              
              <div className="space-y-8">
                {[
                  { title: '1. Input Data Armada', desc: 'Masukkan plat nomor dan merk kendaraan yang Anda miliki ke dalam garasi digital.' },
                  { title: '2. Catat Order Masuk', desc: 'Saat ada klien, masukkan tanggal sewa dan nominal DP. Jadwal akan otomatis terkunci.' },
                  { title: '3. Pantau Dashboard Harian', desc: 'Buka HP Anda setiap pagi, lihat unit mana yang tersedia hari ini dan piutang mana yang harus ditagih.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="text-blue-500" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                      <p className="text-slate-400 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mockup Dashboard UI Sederhana */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform -translate-x-10 translate-y-10"></div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-mono text-slate-500">sobatrental.my.id/dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="h-20 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 gap-4">
                    <CarFront className="text-slate-500" size={32} />
                    <div>
                      <p className="text-white font-bold text-sm">B 1234 XYZ (Avanza)</p>
                      <p className="text-green-500 text-xs font-bold mt-1">TERSEDIA HARI INI</p>
                    </div>
                  </div>
                  <div className="h-20 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                      <CreditCard className="text-slate-500" size={32} />
                      <div>
                        <p className="text-white font-bold text-sm">Doni (B 9999 NBL)</p>
                        <p className="text-slate-400 text-xs mt-1">Jaminan: KTP Asli</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 text-sm font-bold">- Rp 500.000</p>
                      <p className="text-slate-500 text-xs">Sisa Tagihan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HARGA (PRICING) */}
      <section id="harga" className="py-24 bg-slate-950 relative border-t border-slate-800/50 flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Investasi Super Ringan</h2>
          <p className="text-slate-400">Pilih paket flat tanpa potongan komisi per transaksi.</p>
        </div>
        
        <div className="w-full max-w-md bg-slate-900 border-2 border-blue-600 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(37,99,235,0.15)]">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Paling Populer
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Paket Juragan</h3>
          <p className="text-slate-400 text-sm text-center mb-6">Akses ke semua fitur tanpa batas armada.</p>
          <div className="text-center mb-8 border-b border-slate-800 pb-8">
            <span className="text-5xl font-black text-white">Rp 50</span>
            <span className="text-xl text-slate-400 font-medium">.000</span>
            <span className="text-slate-500 block mt-2 text-sm">/ bulan (dibayar bulanan)</span>
          </div>
          <ul className="space-y-4 mb-8">
            {['Armada Kendaraan Unlimited', 'Order & Transaksi Unlimited', 'Dashboard Finansial & Piutang', 'Sistem Kunci Jadwal Anti-Bentrok', 'Bebas Update Fitur Baru'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="text-blue-500 flex-shrink-0" size={18} /> {item}
              </li>
            ))}
          </ul>
          <Link to="/auth" className="block w-full bg-blue-600 hover:bg-blue-500 text-center text-white font-bold py-4 rounded-xl transition shadow-lg">
            Daftar Sekarang
          </Link>
        </div>
      </section>

     {/* 5. KONTAK & FAQ (TEMA GELAP ELEGAN - RESPONSIVE MOBILE) */}
      <section id="kontak" className="py-16 md:py-24 bg-slate-950 relative border-t border-slate-800/50 overflow-hidden">
        {/* Ornamen Cahaya Biru di Latar Belakang */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-cyan-600/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Sisi Kiri: Teks & Tombol WA */}
          {/* Tambahan: Hanya sticky di layar besar (lg:sticky), di HP normal mengikuti scroll */}
          <div className="relative lg:sticky lg:top-24">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              Siap Merapikan Bisnis Rental Anda?
            </h2>
            <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
              Tinggalkan cara lama yang bikin pusing. Hubungi kami sekarang untuk mendapatkan akses <strong>Uji Coba Gratis 3 Hari</strong>. Tim kami siap membantu Anda dari awal sampai mahir.
            </p>
            
            {/* Tombol Kontak WA Langsung - Responsive Width & Text */}
            <a 
              href="https://wa.me/6281319878831?text=Halo%20Nabil,%20saya%20tertarik%20mencoba%20sistem%20SobatRental." 
              target="_blank" 
              rel="noreferrer"
              className="flex sm:inline-flex items-center gap-4 md:gap-5 text-slate-300 bg-slate-900/80 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all group cursor-pointer shadow-xl hover:shadow-blue-900/20 w-full sm:w-auto"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                <Phone className="w-6 h-6 md:w-7 md:h-7 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs md:text-sm text-blue-400 font-bold mb-0.5 md:mb-1 tracking-wider uppercase truncate">Tanya & Konsultasi (WA)</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-blue-400 transition-colors truncate">0813-1987-8831</p>
              </div>
            </a>
          </div>
          
          {/* Sisi Kanan: FAQ Interaktif */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              Pertanyaan Sering Diajukan
            </h3>
            
            <div className="space-y-4">
              {/* Pertanyaan 1 */}
              <details className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl [&_summary::-webkit-details-marker]:hidden open:border-blue-900/50 transition-all shadow-lg">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 md:p-5 text-white font-bold">
                  <span className="text-sm md:text-base pr-4">Apakah ada batasan jumlah kendaraan?</span>
                  <span className="shrink-0 rounded-full bg-slate-800 p-2 text-slate-400 group-open:bg-blue-600 group-open:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </span>
                </summary>
                <p className="px-4 md:px-5 pb-4 md:pb-5 leading-relaxed text-slate-400 text-xs md:text-sm border-t border-slate-800 pt-3 md:pt-4 mt-1 md:mt-2">
                  Tidak ada batasan (Unlimited). Anda bebas menginput berapapun unit mobil atau motor yang Anda kelola tanpa ada biaya tambahan sama sekali.
                </p>
              </details>

              {/* Pertanyaan 2 */}
              <details className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl [&_summary::-webkit-details-marker]:hidden open:border-blue-900/50 transition-all shadow-lg">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 md:p-5 text-white font-bold">
                  <span className="text-sm md:text-base pr-4">Bagaimana jika pelanggan telat mengembalikan?</span>
                  <span className="shrink-0 rounded-full bg-slate-800 p-2 text-slate-400 group-open:bg-blue-600 group-open:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </span>
                </summary>
                <p className="px-4 md:px-5 pb-4 md:pb-5 leading-relaxed text-slate-400 text-xs md:text-sm border-t border-slate-800 pt-3 md:pt-4 mt-1 md:mt-2">
                  Sistem kami dibekali fitur deteksi Overdue. Jika mobil belum dikembalikan lewat dari tanggal selesai, dashboard akan memunculkan peringatan merah dan tombol "Tagih WA" agar Anda bisa langsung menagih penyewa dengan satu klik.
                </p>
              </details>

              {/* Pertanyaan 3 */}
              <details className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl [&_summary::-webkit-details-marker]:hidden open:border-blue-900/50 transition-all shadow-lg">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 md:p-5 text-white font-bold">
                  <span className="text-sm md:text-base pr-4">Apakah admin rental yang gaptek bisa pakai?</span>
                  <span className="shrink-0 rounded-full bg-slate-800 p-2 text-slate-400 group-open:bg-blue-600 group-open:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </span>
                </summary>
                <p className="px-4 md:px-5 pb-4 md:pb-5 leading-relaxed text-slate-400 text-xs md:text-sm border-t border-slate-800 pt-3 md:pt-4 mt-1 md:mt-2">
                  Sangat bisa! SobatRental sengaja didesain anti-mumet tanpa fitur HRD atau akuntansi kompleks yang membingungkan. Staf lulusan SMP pun dijamin bisa menguasai aplikasi ini dalam waktu kurang dari 5 menit.
                </p>
              </details>

              {/* Pertanyaan 4 */}
              <details className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl [&_summary::-webkit-details-marker]:hidden open:border-blue-900/50 transition-all shadow-lg">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 md:p-5 text-white font-bold">
                  <span className="text-sm md:text-base pr-4">Apakah data dan transaksi saya aman?</span>
                  <span className="shrink-0 rounded-full bg-slate-800 p-2 text-slate-400 group-open:bg-blue-600 group-open:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </span>
                </summary>
                <p className="px-4 md:px-5 pb-4 md:pb-5 leading-relaxed text-slate-400 text-xs md:text-sm border-t border-slate-800 pt-3 md:pt-4 mt-1 md:mt-2">
                  Tentu saja. Data disimpan dengan teknologi berbasis Google Cloud Database. Sistem kami juga menggunakan Isolasi Data (Tenant Isolation), sehingga data rental Anda 100% rahasia dan tidak bisa dilihat oleh rental lain.
                </p>
              </details>
            </div>
            
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}