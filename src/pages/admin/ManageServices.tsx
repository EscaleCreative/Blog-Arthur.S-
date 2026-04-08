import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { Service } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Plus, Trash2, Edit2, Star, Image as ImageIcon, Check, X, Tag, Upload, Loader2, Library } from 'lucide-react';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';
import { MediaSelector } from '../../components/admin/MediaSelector';
import { cn } from '@/lib/utils';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { orderBy } from 'firebase/firestore';

export default function ManageServices() {
  const { data: services, loading } = useCollection<Service>('services', [orderBy('createdAt', 'desc')]);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
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
      const storageRef = ref(storage, `services/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Update service image URL
      setEditingService(prev => ({ ...prev, image: url }));

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
    if (!editingService?.title) {
      toast.error("Le titre est obligatoire.");
      return;
    }
    try {
      if (editingService.id) {
        await firestoreService.update('services', editingService.id, editingService);
        toast.success("Service mis à jour !");
      } else {
        await firestoreService.add('services', { ...editingService, featured: editingService.featured || false, order: services.length + 1 });
        toast.success("Service ajouté !");
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await firestoreService.delete('services', deletingId);
      toast.success("Activité supprimée.");
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
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-manga-red">
            Gestion des <br /> <span className="text-black">Activités</span>
          </h1>
          <div className="h-2 w-48 bg-manga-red" />
        </div>
        
        <MangaButton 
          onClick={() => { setEditingService({}); setIsModalOpen(true); }} 
          className="flex items-center gap-2 h-16 text-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus size={24} /> Nouvelle Activité
        </MangaButton>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-4xl font-black uppercase tracking-tighter">
                {editingService?.id ? "Modifier l'Activité" : "Ajouter une Activité"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Titre de l'Activité</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 text-lg focus-visible:ring-manga-red" 
                    placeholder="ex: Coaching Personnel"
                    value={editingService?.title || ''} 
                    onChange={e => setEditingService({...editingService, title: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Kanji (Décoratif)</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 text-lg focus-visible:ring-manga-red" 
                    placeholder="ex: 武"
                    value={editingService?.kanji || ''} 
                    onChange={e => setEditingService({...editingService, kanji: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black uppercase text-xs tracking-widest">Slogan / Tagline</Label>
                <Input 
                  className="border-4 border-black font-bold h-12 focus-visible:ring-manga-red italic" 
                  placeholder="ex: Repoussez vos limites..."
                  value={editingService?.tagline || ''} 
                  onChange={e => setEditingService({...editingService, tagline: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Prix (€)</Label>
                  <Input 
                    type="number" 
                    className="border-4 border-black font-bold h-12 text-xl focus-visible:ring-manga-red" 
                    value={editingService?.price || ''} 
                    onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Durée</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 text-xl focus-visible:ring-manga-red" 
                    placeholder="ex: 1h / Séance"
                    value={editingService?.duration || ''} 
                    onChange={e => setEditingService({...editingService, duration: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Catégorie</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 focus-visible:ring-manga-red" 
                    placeholder="ex: Coaching, DYS, etc." 
                    value={editingService?.category || ''} 
                    onChange={e => setEditingService({...editingService, category: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black uppercase text-xs tracking-widest">Icône (Nom Lucide)</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 focus-visible:ring-manga-red" 
                    placeholder="ex: Dumbbell, User, Heart"
                    value={editingService?.icon || ''} 
                    onChange={e => setEditingService({...editingService, icon: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase text-xs tracking-widest">Image de l'Activité</Label>
                
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {editingService?.image && (
                      <div className="w-32 h-32 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0">
                        <img 
                          src={editingService.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=300';
                          }}
                        />
                      </div>
                  )}
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex gap-2">
                      <Input 
                        className="border-4 border-black font-bold h-12 focus-visible:ring-manga-red flex-1" 
                        placeholder="URL de l'image (ou uploader →)"
                        value={editingService?.image || ''} 
                        onChange={e => setEditingService({...editingService, image: e.target.value})} 
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
                    <p className="text-[10px] font-black uppercase text-gray-400">
                      Conseil : Utilisez une image au format paysage (16:9) pour un meilleur rendu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black uppercase text-xs tracking-widest">Description Complète</Label>
                <Textarea 
                  className="border-4 border-black font-bold min-h-[120px] focus-visible:ring-manga-red" 
                  value={editingService?.description || ''} 
                  onChange={e => setEditingService({...editingService, description: e.target.value})} 
                />
              </div>

              <div className="flex items-center justify-between p-6 border-4 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-1">
                  <Label className="font-black uppercase text-sm">Mettre en avant</Label>
                  <p className="text-xs font-bold text-gray-500 uppercase">Sera affiché en priorité sur l'accueil</p>
                </div>
                <Switch checked={editingService?.featured || false} onCheckedChange={val => setEditingService({...editingService, featured: val})} />
              </div>

              <div className="pt-4">
                <MangaButton type="submit" className="w-full h-16 text-2xl">
                  {editingService?.id ? "Mettre à jour" : "Créer l'Activité"}
                </MangaButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <MangaCard key={service.id} kanji={service.kanji} className="flex flex-col group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "px-4 py-1.5 font-black text-xs uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", 
                service.featured ? "bg-manga-red text-white" : "bg-white text-black"
              )}>
                {service.featured ? "★ Featured" : "Standard"}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                  className="p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  title="Modifier"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => setDeletingId(service.id)}
                  className="p-3 border-4 border-black bg-white hover:bg-manga-red hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <h3 className="text-3xl font-black uppercase mb-2 group-hover:text-manga-red transition-colors leading-none">{service.title}</h3>
            <p className="font-bold text-gray-500 text-sm mb-4 italic leading-tight">"{service.tagline}"</p>
            
            {service.category && (
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase bg-black text-white px-3 py-1 mb-6 w-fit">
                <Tag size={12} /> {service.category}
              </div>
            )}
            
            <div className="mt-auto pt-6 border-t-4 border-black/10">
              <div className="flex justify-between items-center font-black">
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-gray-400">Tarif</span>
                  <span className="text-3xl text-manga-red">{service.price ? `${service.price}€` : "Sur devis"}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase text-gray-400">Durée</span>
                  <span className="text-lg uppercase tracking-tighter">{service.duration || "Variable"}</span>
                </div>
              </div>
            </div>
          </MangaCard>
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
          setEditingService(prev => ({ ...prev, image: url }));
          setIsMediaSelectorOpen(false);
        }}
        currentUrl={editingService?.image}
      />
    </div>
  );
}
