import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SERVICE_ILLUSTRATIONS } from '@/constants/illustrations';
import { MangaButton } from './MangaUI';
import { Image as ImageIcon, Check } from 'lucide-react';

interface IllustrationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function IllustrationPicker({ isOpen, onClose, onSelect }: IllustrationPickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="bg-black text-white p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ImageIcon size={32} /> Bibliothèque d'Illustrations
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {SERVICE_ILLUSTRATIONS.map((category) => (
            <div key={category.category} className="space-y-4">
              <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2">{category.category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {category.images.map((img) => (
                  <div 
                    key={img.url}
                    onClick={() => {
                      onSelect(img.url);
                      onClose();
                    }}
                    className="group relative aspect-video border-4 border-black cursor-pointer hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100"
                  >
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <div className="bg-white text-black p-2 rounded-full">
                        <Check size={20} />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black text-white p-1 text-[10px] font-black uppercase text-center">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t-4 border-black flex justify-end">
          <MangaButton variant="outline" onClick={onClose}>Fermer</MangaButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
