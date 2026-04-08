import { useCollection } from '../hooks/useFirestore';
import { LeSaviezVous } from '../types';
import { MangaCard, MangaButton } from '../components/ui/MangaUI';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

export default function Archives() {
  const { data: articles, loading } = useCollection<LeSaviezVous>('le_saviez_vous', []);
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    return articles
      .filter(a => a.active && (a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [articles, search]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-16 h-16" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 font-black uppercase text-sm mb-8 hover:underline decoration-4">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Archives <br /> <span className="text-stroke-black text-transparent">Culture & Santé</span>
            </h1>
            <div className="h-2 w-48 bg-black" />
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              className="pl-12 border-4 border-black font-bold h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="Rechercher un sujet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-12">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MangaCard className="p-0 overflow-hidden flex flex-col md:flex-row">
                  {article.image && (
                    <div className="md:w-1/3 h-64 md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-black">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-8 flex-1 space-y-4">
                    <div className="flex items-center gap-3 font-black uppercase text-xs text-gray-400">
                      <Calendar size={14} />
                      {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{article.title}</h2>
                    <div className="prose prose-lg font-bold text-gray-700 line-clamp-4">
                      {article.content}
                    </div>
                    <div className="pt-4">
                      <MangaButton variant="outline" className="text-xs py-2 px-4">Lire la suite</MangaButton>
                    </div>
                  </div>
                </MangaCard>
              </motion.div>
            ))
          ) : (
            <div className="bg-gray-100 border-4 border-dashed border-black p-24 text-center">
              <Info size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="font-black uppercase text-2xl text-gray-400">Aucun article trouvé</p>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="mt-24 flex justify-center gap-12">
          <div className="text-9xl font-black text-black/5 italic select-none">ARCHIVES</div>
        </div>
      </div>
    </div>
  );
}
