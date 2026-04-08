import { useState } from 'react';
import { useCollection } from '../../hooks/useFirestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Image as ImageIcon, Check, X } from 'lucide-react';
import { MangaButton } from './MangaUI';
import { cn } from '@/lib/utils';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const { data: media, loading } = useCollection<any>('media_library', []);
  const [search, setSearch] = useState('');

  const filteredMedia = media.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.type?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="bg-black text-white p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ImageIcon size={32} /> Choisir un Média
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              className="pl-12 border-4 border-black font-bold h-12 text-lg focus-visible:ring-manga-red" 
              placeholder="Rechercher une image..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-2">
            {loading ? (
              <div className="col-span-full py-12 text-center font-black uppercase text-gray-400">Chargement de la galerie...</div>
            ) : filteredMedia.length === 0 ? (
              <div className="col-span-full py-12 text-center font-black uppercase text-gray-400 italic border-4 border-black border-dashed">
                Aucune image trouvée
              </div>
            ) : (
              filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square border-4 border-black cursor-pointer hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100"
                >
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-manga-red/0 group-hover:bg-manga-red/20 transition-all flex items-center justify-center">
                    <div className="bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                      <Check size={20} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-1 text-[8px] font-black uppercase truncate opacity-0 group-hover:opacity-100 transition-all">
                    {item.name}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4">
            <MangaButton variant="outline" onClick={onClose}>Annuler</MangaButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
