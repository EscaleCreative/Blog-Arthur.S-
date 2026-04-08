import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MangaButton } from './MangaUI';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
}

export function DeleteConfirm({ isOpen, onClose, onConfirm, title = "Confirmer la suppression", message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible." }: DeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Delete confirmation error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="bg-red-500 text-white p-6">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-8 font-bold text-lg">
          {message}
        </div>
        <DialogFooter className="p-6 bg-gray-50 flex gap-4">
          <MangaButton 
            variant="secondary" 
            onClick={onClose} 
            disabled={isDeleting}
            className="flex-1"
          >
            Annuler
          </MangaButton>
          <MangaButton 
            variant="danger" 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </MangaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
