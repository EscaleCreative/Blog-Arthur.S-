import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { LeSaviezVous } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Plus, Trash2, Edit2, Info, Check, X, Eye, EyeOff, Upload, Loader2, Library } from 'lucide-react';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';
import { MediaSelector } from '../../components/admin/MediaSelector';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { orderBy } from 'firebase/firestore';

export default function ManageLeSaviezVous() {
  const { data: articles, loading } = useCollection<LeSaviezVous>('le_saviez_vous', [orderBy('createdAt', 'desc')]);
  const [editingArticle, setEditingArticle] = useState<Partial<LeSaviezVous> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Update article image URL
      setEditingArticle(prev => ({ ...prev, image: url }));

      // Also add to media library
      await firestoreService.add('media_library', {
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        storagePath: storageRef.fullPath
      });

      toast.success("Image uploadée et ajoutée à la galerie !");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.content) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    try {
      if (editingArticle.id) {
        await firestoreService.update('le_saviez_vous', editingArticle.id, editingArticle);
        toast.success("Article mis à jour !");
      } else {
        await firestoreService.add('le_saviez_vous', { ...editingArticle, active: editingArticle.active || false });
        toast.success("Article ajouté !");
      }
      setIsModalOpen(false);
      setEditingArticle(null);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await firestoreService.delete('le_saviez_vous', deletingId);
      toast.success("Article supprimé.");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      throw err;
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await firestoreService.update('le_saviez_vous', id, { active });
      toast.success(active ? "Article activé" : "Article désactivé");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Gestion du <br /> <span className="text-stroke-black text-transparent">Le Saviez-Vous ?</span>
          </h1>
          <div className="h-2 w-48 bg-black" />
        </div>
        
        <MangaButton 
          onClick={() => { setEditingArticle({}); setIsModalOpen(true); }} 
          className="flex items-center gap-2 h-16 text-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus size={24} /> Nouvel Article
        </MangaButton>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                {editingArticle?.id ? "Modifier l'Article" : "Ajouter un Article"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Titre</Label>
                <Input className="border-4 border-black font-bold" value={editingArticle?.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
              </div>
              <div className="space-y-4">
                <Label className="font-black uppercase text-xs tracking-widest">Image de l'Article</Label>
                
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {editingArticle?.image && (
                    <div className="w-32 h-32 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0">
                      <img 
                        src={editingArticle.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex gap-2">
                      <Input 
                        className="border-4 border-black font-bold h-12 focus-visible:ring-manga-red flex-1" 
                        placeholder="URL de l'image (ou uploader →)"
                        value={editingArticle?.image || ''} 
                        onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} 
                      />
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <div className="flex gap-2">
                        <MangaButton 
                          type="button"
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="h-12 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-blue-500 text-white"
                          title="Choisir dans la galerie"
                        >
                          <Library size={20} />
                        </MangaButton>
                        <MangaButton 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="h-12 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          title="Uploader un fichier"
                        >
                          {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        </MangaButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs">Contenu (Markdown supporté)</Label>
                <Textarea className="border-4 border-black font-bold min-h-[200px]" value={editingArticle?.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
              </div>
              <div className="flex items-center justify-between p-4 border-4 border-black bg-gray-50">
                <Label className="font-black uppercase text-sm">Activer l'article</Label>
                <Switch checked={editingArticle?.active || false} onCheckedChange={val => setEditingArticle({...editingArticle, active: val})} />
              </div>
              <MangaButton type="submit" className="w-full">Enregistrer</MangaButton>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-8">
            {article.image && (
              <div className="md:w-48 h-48 border-4 border-black shrink-0">
                <img src={article.image} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase tracking-tighter">{article.title}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleActive(article.id, !article.active)}
                    className={cn("p-2 border-2 border-black transition-all", article.active ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}
                  >
                    {article.active ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button 
                    onClick={() => { setEditingArticle(article); setIsModalOpen(true); }}
                    className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => setDeletingId(article.id)}
                    className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="prose prose-sm font-bold text-gray-500 line-clamp-3">
                {article.content}
              </div>
              <div className="pt-4 border-t-2 border-black/10 text-xs font-black uppercase text-gray-400">
                Publié le {new Date(article.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirm 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        onConfirm={handleDelete} 
      />

      <MediaSelector 
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={(url) => {
          setEditingArticle(prev => ({ ...prev, image: url }));
          setIsMediaSelectorOpen(false);
        }}
        currentUrl={editingArticle?.image}
      />
    </div>
  );
}
