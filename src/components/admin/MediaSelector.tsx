import { useCollection } from '../../hooks/useFirestore';
import { Media } from '../../types';
import { MangaButton } from '../ui/MangaUI';
import { Search, Grid, List, Check, X, Image as ImageIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, formatBytes } from '@/lib/utils';
import { orderBy } from 'firebase/firestore';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export function MediaSelector({ isOpen, onClose, onSelect, currentUrl }: MediaSelectorProps) {
  const { data: media, loading } = useCollection<Media>('media_library', [orderBy('createdAt', 'desc')]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => {
    const cats = new Set(media.map(m => m.category).filter(Boolean));
    const list = ['all', ...Array.from(cats).sort()];
    if (media.some(m => !m.category)) {
      list.push('none');
    }
    return list;
  }, [media]);

  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' 
        ? true 
        : categoryFilter === 'none' 
          ? !m.category 
          : m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [media, search, categoryFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="bg-black text-white p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ImageIcon size={32} /> Choisir un média
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  className="pl-12 border-4 border-black font-bold h-12" 
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase border-2 border-black transition-all",
                      categoryFilter === cat ? "bg-manga-red text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black hover:bg-gray-100"
                    )}
                  >
                    {cat === 'all' ? 'Tous' : cat === 'none' ? 'Sans catégorie' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-2 border-black p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 transition-all", viewMode === 'grid' ? "bg-black text-white" : "hover:bg-gray-100")}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 transition-all", viewMode === 'list' ? "bg-black text-white" : "hover:bg-gray-100")}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Media List */}
          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-24">
                <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-12 h-12" />
              </div>
            ) : filteredMedia.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((m) => (
                    <div 
                      key={m.id} 
                      onClick={() => onSelect(m.url)}
                      className={cn(
                        "group relative bg-white border-4 border-black p-1 cursor-pointer transition-all",
                        currentUrl === m.url ? "border-manga-red shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] -translate-x-1 -translate-y-1" : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      )}
                    >
                      <div className="aspect-square border-2 border-black overflow-hidden relative">
                        <img 
                          src={m.url} 
                          loading="lazy"
                          className={cn(
                            "w-full h-full object-cover transition-all",
                            currentUrl === m.url ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                          )} 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                        {currentUrl === m.url && (
                          <div className="absolute inset-0 bg-manga-red/20 flex items-center justify-center">
                            <div className="bg-manga-red text-white p-1 border-2 border-black">
                              <Check size={20} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-[8px] font-black uppercase truncate text-black">{m.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-4 border-black overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b-4 border-black">
                      <tr className="text-[10px] font-black uppercase tracking-widest">
                        <th className="p-3">Aperçu</th>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Taille</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedia.map((m) => (
                        <tr 
                          key={m.id} 
                          onClick={() => onSelect(m.url)}
                          className={cn(
                            "border-b-2 border-black/10 hover:bg-gray-50 cursor-pointer transition-colors",
                            currentUrl === m.url && "bg-manga-red/5"
                          )}
                        >
                          <td className="p-3">
                            <div className="w-10 h-10 border-2 border-black overflow-hidden">
                              <img 
                                src={m.url} 
                                loading="lazy"
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-3 font-black text-xs uppercase truncate max-w-[150px]">{m.name}</td>
                          <td className="p-3 font-bold text-[10px] text-gray-500">{formatBytes(m.size)}</td>
                          <td className="p-3 text-right">
                            <MangaButton 
                              variant={currentUrl === m.url ? "primary" : "secondary"}
                              className="h-8 px-3 text-[10px]"
                            >
                              {currentUrl === m.url ? "Sélectionné" : "Choisir"}
                            </MangaButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="bg-gray-100 border-4 border-dashed border-black p-12 text-center font-black uppercase text-gray-400">
                Aucun média trouvé
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t-4 border-black flex justify-end">
          <MangaButton onClick={onClose} variant="secondary" className="px-8">
            Fermer
          </MangaButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
