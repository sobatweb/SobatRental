import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Fitur', path: '#fitur' },
    { name: 'Cara Kerja', path: '#alur' },
    { name: 'Harga', path: '#harga' },
    { name: 'Kontak', path: '#kontak' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50">S</div>
            <span className="font-bold text-xl text-white tracking-tight">Sobat<span className="text-blue-500">Rental</span></span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link, i) => (
              <a key={i} href={link.path} className="text-sm font-medium text-slate-300 hover:text-white transition">
                {link.name}
              </a>
            ))}
            <Link to="/auth" className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5">
              Masuk / Daftar
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white transition">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/5 absolute w-full">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link, i) => (
              <a key={i} href={link.path} onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-lg">
                {link.name}
              </a>
            ))}
            <Link to="/auth" onClick={() => setIsOpen(false)} className="block w-full text-center mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg font-bold">
              Area Juragan (Login)
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}