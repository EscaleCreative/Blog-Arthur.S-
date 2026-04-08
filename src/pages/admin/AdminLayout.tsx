import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCollection } from '../../hooks/useFirestore';
import { useEffect } from 'react';
import { MangaButton } from '../../components/ui/MangaUI';
import { 
  Calendar, 
  Dumbbell, 
  Info, 
  Image as ImageIcon, 
  MessageSquare, 
  Mail, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-16 h-16" />
    </div>
  );

  const menuItems = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Réservations', path: '/admin/reservations', icon: Calendar },
    { title: 'Activités', path: '/admin/services', icon: Dumbbell },
    { title: 'Le Saviez-Vous ?', path: '/admin/le-saviez-vous', icon: Info },
    { title: 'Verbatims', path: '/admin/verbatims', icon: MessageSquare },
    { title: 'Contacts', path: '/admin/contacts', icon: Mail },
    { title: 'Galerie Média', path: '/admin/media', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center border-b-4 border-white">
        <div className="font-black text-xl uppercase tracking-tighter">Admin Dojo</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "fixed md:static inset-0 z-40 w-80 bg-black text-white border-r-8 border-white p-8 flex flex-col h-full",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="mb-12">
              <div className="inline-block bg-white text-black px-4 py-2 font-black text-3xl -rotate-3 mb-4">
                ADMIN
              </div>
              <h1 className="text-xl font-black uppercase tracking-widest text-gray-400">Arthur Sitaud</h1>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-4 font-black uppercase tracking-tighter text-lg transition-all border-4 border-transparent",
                      isActive ? "bg-white text-black border-white rotate-1" : "hover:bg-white/10"
                    )}
                  >
                    <item.icon size={24} />
                    <span>{item.title}</span>
                    {isActive && <ChevronRight className="ml-auto" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <button 
                onClick={() => logout()} 
                className="flex items-center gap-4 p-4 font-black uppercase tracking-tighter text-lg text-red-500 hover:bg-red-500/10 w-full text-left"
              >
                <LogOut size={24} />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function AdminDashboard() {
  const { data: reservations } = useCollection('reservations', []);
  const { data: contacts } = useCollection('contact_requests', []);
  const { data: services } = useCollection('services', []);
  const { data: articles } = useCollection('le_saviez_vous', []);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
          Dashboard <br /> <span className="text-stroke-black text-transparent">Arthur Sitaud</span>
        </h1>
        <div className="h-2 w-48 bg-black" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard title="Réservations" count={reservations.length} icon={Calendar} color="bg-blue-500" path="/admin/reservations" />
        <DashboardCard title="Contacts" count={contacts.length} icon={Mail} color="bg-green-500" path="/admin/contacts" />
        <DashboardCard title="Services" count={services.length} icon={Dumbbell} color="bg-purple-500" path="/admin/services" />
      </div>

      <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">Dernières Activités</h2>
        <div className="space-y-4">
          {reservations.slice(0, 5).map((res: any, i) => (
            <div key={res.id || i} className="flex items-center gap-4 p-4 border-4 border-black font-bold">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black">0{i + 1}</div>
              <div className="flex-1">
                <p className="uppercase text-sm text-gray-400">
                  {new Date(res.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-lg">Nouvelle réservation de <span className="font-black">{res.clientName}</span> pour <span className="font-black">{res.serviceTitle}</span></p>
              </div>
              <ChevronRight size={24} />
            </div>
          ))}
          {reservations.length === 0 && (
            <div className="p-12 text-center font-black uppercase text-gray-400 border-4 border-dashed border-black">
              Aucune activité récente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, count, icon: Icon, color, path }: any) {
  return (
    <Link to={path}>
      <motion.div
        whileHover={{ scale: 1.05, rotate: -2 }}
        className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6"
      >
        <div className={cn("w-16 h-16 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", color)}>
          <Icon size={32} className="text-white" />
        </div>
        <div>
          <h3 className="font-black uppercase text-xl tracking-tighter">{title}</h3>
          <p className="text-4xl font-black">{count}</p>
        </div>
      </motion.div>
    </Link>
  );
}
