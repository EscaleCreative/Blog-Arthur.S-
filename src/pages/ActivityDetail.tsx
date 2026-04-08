import { useParams, Link } from 'react-router-dom';
import { useDocument } from '../hooks/useFirestore';
import { Service } from '../types';
import { MangaCard, MangaButton } from '../components/ui/MangaUI';
import { ArrowLeft, Clock, Euro, Tag, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: service, loading } = useDocument<Service>('services', id || '');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-16 h-16" />
    </div>
  );

  if (!service) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] p-6 text-center">
      <h1 className="text-4xl font-black uppercase mb-4">Service non trouvé</h1>
      <Link to="/">
        <MangaButton variant="outline">Retour à l'accueil</MangaButton>
      </Link>
    </div>
  );

  const IconComponent = (Icons as any)[service.icon] || Icons.Activity;

  return (
    <div className="min-h-screen bg-manga-offwhite bg-grid-vertical py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 font-black uppercase text-sm mb-8 hover:underline decoration-4 text-manga-red">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute -top-10 -left-10 text-[12rem] font-black text-manga-red/5 pointer-events-none select-none italic transform -rotate-12">
                {service.kanji}
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none relative z-10">
                {service.title}
              </h1>
            </div>
            
            <p className="text-2xl font-bold italic text-gray-600 border-l-8 border-manga-red pl-6">
              {service.tagline}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-manga-red text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-2 font-black uppercase text-xs text-white/60">
                  <Euro size={16} /> Tarif
                </div>
                <div className="text-4xl font-black">{service.price ? `${service.price}€` : "Sur devis"}</div>
              </div>
              <div className="bg-white text-black p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-2 font-black uppercase text-xs text-gray-500">
                  <Clock size={16} /> Durée
                </div>
                <div className="text-4xl font-black">{service.duration || "Variable"}</div>
              </div>
            </div>

            <div className="prose prose-lg font-bold text-gray-700 leading-relaxed max-w-none">
              {service.description.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            <div className="pt-8 flex flex-wrap gap-4">
              <Link to={`/?serviceId=${service.id}#reservation`} className="flex-1 md:flex-none">
                <MangaButton className="w-full">Réserver ce service</MangaButton>
              </Link>
              <div className="flex items-center gap-4 px-6 border-4 border-black font-black uppercase text-sm bg-black text-white">
                <IconComponent size={24} className="text-manga-red" />
                <span>{service.category || 'Catégorie Sport'}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 border-8 border-black rotate-2 -z-10" />
            <img 
              src={service.image || `https://picsum.photos/seed/${service.title}/800/1000`} 
              alt={service.title} 
              className="w-full border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] grayscale hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800';
              }}
            />
            {service.featured && (
              <div className="absolute top-8 right-8 bg-manga-red text-white p-4 font-black text-2xl rotate-12 shadow-xl border-4 border-black">
                FEATURED
              </div>
            )}
          </motion.div>
        </div>

        {/* Breadcrumb-like navigation */}
        <div className="mt-24 pt-12 border-t-8 border-black flex justify-between items-center">
          <div className="font-black uppercase text-sm tracking-widest text-gray-400">
            Moodys Coaching / Services / {service.title}
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-manga-red rotate-45" />
            <div className="w-8 h-8 bg-black rotate-45" />
            <div className="w-8 h-8 bg-manga-red rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
