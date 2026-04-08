import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MangaButton } from '../ui/MangaUI';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-8 border-black py-4 px-6 md:px-12 flex justify-between items-center">
      <button 
        onClick={() => {
          const el = document.getElementById('hero');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else navigate('/#hero');
        }}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="bg-black text-white p-2 font-black text-2xl rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          MOODYS
        </div>
        <span className="font-black text-xl tracking-tighter hidden sm:block">ARTHUR SITAUD</span>
      </button>

      <div className="hidden md:flex items-center gap-8 font-black uppercase tracking-widest text-sm">
        <button 
          onClick={() => {
            const el = document.getElementById('hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/#hero');
          }}
          className="hover:underline decoration-4 underline-offset-8 uppercase"
        >
          Accueil
        </button>
        <button 
          onClick={() => {
            const el = document.getElementById('services');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/#services');
          }}
          className="hover:underline decoration-4 underline-offset-8 uppercase"
        >
          Services
        </button>
        <button 
          onClick={() => {
            const el = document.getElementById('action-zone');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/#action-zone');
          }}
          className="hover:underline decoration-4 underline-offset-8 uppercase"
        >
          Contact & Réservation
        </button>
        <button 
          onClick={() => {
            const el = document.getElementById('le-saviez-vous');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/#le-saviez-vous');
          }}
          className="hover:underline decoration-4 underline-offset-8 uppercase"
        >
          Le Saviez-Vous ?
        </button>
        {user ? (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin">
                <MangaButton variant="secondary" className="py-1 px-4 text-xs">Admin</MangaButton>
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-600 transition-colors">
              <LogOut size={18} />
              <span>Quitter</span>
            </button>
          </div>
        ) : (
          <Link to="/login">
            <MangaButton variant="primary" className="py-1 px-4 text-xs">Connexion</MangaButton>
          </Link>
        )}
      </div>

      {/* Mobile Toggle */}
      <button className="md:hidden border-4 border-black p-1" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b-8 border-black p-8 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            <button 
              onClick={() => {
                setIsOpen(false);
                const el = document.getElementById('hero');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
                else navigate('/#hero');
              }} 
              className="font-black text-2xl uppercase text-left"
            >
              Accueil
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                const el = document.getElementById('services');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
                else navigate('/#services');
              }} 
              className="font-black text-2xl uppercase text-left"
            >
              Services
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                const el = document.getElementById('action-zone');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
                else navigate('/#action-zone');
              }} 
              className="font-black text-2xl uppercase text-left"
            >
              Contact & Réservation
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                const el = document.getElementById('le-saviez-vous');
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
                else navigate('/#le-saviez-vous');
              }} 
              className="font-black text-2xl uppercase text-left"
            >
              Le Saviez-Vous ?
            </button>
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="font-black text-2xl uppercase text-blue-600">Dashboard Admin</Link>}
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="font-black text-2xl uppercase text-red-600 text-left">Déconnexion</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="font-black text-2xl uppercase">Connexion</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12 border-t-8 border-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <button 
            onClick={() => {
              const el = document.getElementById('hero');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else navigate('/#hero');
            }}
            className="inline-block bg-white text-black p-2 font-black text-2xl -rotate-2 cursor-pointer"
          >
            MOODYS
          </button>
          <p className="font-bold text-gray-400 max-w-xs italic">
            "Chaque mouvement compte. Transformez votre corps et votre esprit avec un coaching sur mesure."
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-black text-xl uppercase tracking-widest border-b-2 border-white inline-block mb-4">Liens</h3>
          <ul className="space-y-2 font-bold text-gray-300">
            <li>
              <button 
                onClick={() => {
                  const el = document.getElementById('hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#hero');
                }}
                className="hover:text-white transition-colors uppercase"
              >
                Accueil
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#services');
                }}
                className="hover:text-white transition-colors uppercase"
              >
                Services
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  const el = document.getElementById('action-zone');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#action-zone');
                }}
                className="hover:text-white transition-colors uppercase"
              >
                Contact & Réservation
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  const el = document.getElementById('le-saviez-vous');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#le-saviez-vous');
                }}
                className="hover:text-white transition-colors uppercase"
              >
                Le Saviez-Vous ?
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-xl uppercase tracking-widest border-b-2 border-white inline-block mb-4">Contact</h3>
          <ul className="space-y-4 font-bold text-gray-300">
            <li className="pt-2 space-y-2">
              <div><Link to="/login" className="hover:text-white transition-colors">Espace Admin</Link></div>
              <div><Link to="/archives" className="hover:text-white transition-colors">Archives Culture</Link></div>
              <div><a href="#" className="hover:text-white transition-colors">Mentions Légales</a></div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-800 text-center font-bold text-gray-500 text-sm">
        © {new Date().getFullYear()} MOODYS COACHING - DESIGNED IN MANGA STYLE
      </div>
    </footer>
  );
}
