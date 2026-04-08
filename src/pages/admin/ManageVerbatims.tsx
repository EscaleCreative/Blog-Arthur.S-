import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { Verbatim } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Plus, Trash2, Edit2, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';

export default function ManageVerbatims() {
  const { data: verbatims, loading } = useCollection<Verbatim>('verbatims', []);
  const [editingVerbatim, setEditingVerbatim] = useState<Partial<Verbatim> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVerbatim?.author || !editingVerbatim?.content) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    try {
      if (editingVerbatim.id) {
        await firestoreService.update('verbatims', editingVerbatim.id, editingVerbatim);
        toast.success("Témoignage mis à jour !");
      } else {
        await firestoreService.add('verbatims', { ...editingVerbatim, rating: editingVerbatim.rating || 5 });
        toast.success("Témoignage ajouté !");
      }
      setIsModalOpen(false);
      setEditingVerbatim(null);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await firestoreService.delete('verbatims', deletingId);
      toast.success("Témoignage supprimé.");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      throw err;
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Gestion des <br /> <span className="text-stroke-black text-transparent">Verbatims</span>
          </h1>
          <div className="h-2 w-48 bg-black" />
        </div>
        
        <MangaButton 
          onClick={() => { setEditingVerbatim({}); setIsModalOpen(true); }} 
          className="flex items-center gap-2 h-16 text-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus size={24} /> Nouveau Témoignage
        </MangaButton>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                {editingVerbatim?.id ? "Modifier le Témoignage" : "Ajouter un Témoignage"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Auteur</Label>
                <Input className="border-4 border-black font-bold" value={editingVerbatim?.author || ''} onChange={e => setEditingVerbatim({...editingVerbatim, author: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Note (1-5)</Label>
                <Input type="number" min="1" max="5" className="border-4 border-black font-bold" value={editingVerbatim?.rating || ''} onChange={e => setEditingVerbatim({...editingVerbatim, rating: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Contenu</Label>
                <Textarea className="border-4 border-black font-bold min-h-[100px]" value={editingVerbatim?.content || ''} onChange={e => setEditingVerbatim({...editingVerbatim, content: e.target.value})} />
              </div>
              <MangaButton type="submit" className="w-full">Enregistrer</MangaButton>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {verbatims.map((v) => (
          <MangaCard key={v.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex text-yellow-500">
                {[...Array(v.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingVerbatim(v); setIsModalOpen(true); }}
                  className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeletingId(v.id)}
                  className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="font-bold text-gray-600 mb-6 italic flex-1">"{v.content}"</p>
            
            <div className="pt-4 border-t-2 border-black/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black uppercase">
                {v.author.charAt(0)}
              </div>
              <span className="font-black uppercase tracking-tighter">{v.author}</span>
            </div>
          </MangaCard>
        ))}
      </div>

      <DeleteConfirm 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}
