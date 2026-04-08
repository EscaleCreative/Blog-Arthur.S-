import { useCollection, firestoreService, useDocument } from '../../hooks/useFirestore';
import { Media, AppSettings } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Plus, Trash2, Copy, Image as ImageIcon, Upload, X, Check, Search, Eye, Grid, List, CheckSquare, Square, Download, Star, Edit2 } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import { orderBy } from 'firebase/firestore';

import { INITIAL_MEDIA } from '../../constants';

export default function ManageMedia() {
  const { data: media, loading } = useCollection<Media>('media_library', [orderBy('createdAt', 'desc')]);
  const { data: settings } = useDocument<AppSettings>('settings', 'app');
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<{id: string, path?: string} | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const cats = new Set(media.map(m => m.category).filter(Boolean));
    const list = ['all', ...Array.from(cats).sort()];
    if (media.some(m => !m.category)) {
      list.push('none');
    }
    return list;
  }, [media]);

  const seedSampleMedia = async () => {
    setIsSeeding(true);
    const loadingToast = toast.loading("Génération des exemples en cours...");
    try {
      const existingUrls = new Set(media.map(m => m.url));
      
      // Deduplicate INITIAL_MEDIA by URL first
      const uniqueInitialMediaMap = new Map();
      INITIAL_MEDIA.forEach(m => {
        if (m.url && !uniqueInitialMediaMap.has(m.url)) {
          uniqueInitialMediaMap.set(m.url, m);
        }
      });
      
      const uniqueInitialMedia = Array.from(uniqueInitialMediaMap.values())
        .filter(m => !existingUrls.has(m.url!));

      if (uniqueInitialMedia.length === 0) {
        toast.info("Tous les exemples sont déjà présents dans la galerie.", { id: loadingToast });
        return;
      }

      // Add a small delay between batches to avoid overwhelming Firestore
      const batchSize = 10;
      for (let i = 0; i < uniqueInitialMedia.length; i += batchSize) {
        const batch = uniqueInitialMedia.slice(i, i + batchSize);
        const promises = batch.map(sample => 
          firestoreService.add('media_library', {
            ...sample,
            createdAt: new Date().toISOString()
          })
        );
        await Promise.all(promises);
        toast.loading(`Génération : ${Math.min(i + batchSize, uniqueInitialMedia.length)}/${uniqueInitialMedia.length}`, { id: loadingToast });
      }
      toast.success(`${uniqueInitialMedia.length} nouveaux exemples générés !`, { id: loadingToast });
    } catch (err) {
      toast.error("Erreur lors de la génération des exemples.", { id: loadingToast });
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const loadingToast = toast.loading(`Upload de ${files.length} fichier(s)...`);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          await firestoreService.add('media_library', {
            name: file.name,
            url,
            type: file.type,
            size: file.size,
            category: 'Upload',
            storagePath: storageRef.fullPath,
            createdAt: new Date().toISOString()
          });
        } catch (fileErr: any) {
          console.error(`Error uploading ${file.name}:`, fileErr);
          throw new Error(`Erreur sur ${file.name}: ${fileErr.message || 'Inconnue'}`);
        }
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} fichier(s) uploadé(s) !`, { id: loadingToast });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(`Erreur lors de l'upload: ${err.message || 'Vérifiez les permissions Firebase Storage'}`, { id: loadingToast });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deletingMedia) return;
    try {
      if (deletingMedia.path) {
        const storageRef = ref(storage, deletingMedia.path);
        await deleteObject(storageRef).catch(err => console.error("Storage delete error:", err));
      }
      await firestoreService.delete('media_library', deletingMedia.id);
      toast.success("Média supprimé.");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      throw err;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const loadingToast = toast.loading(`Suppression de ${selectedIds.length} média(s)...`);
    try {
      const selectedMedia = media.filter(m => selectedIds.includes(m.id));
      
      // Delete from storage
      const storagePromises = selectedMedia
        .filter(m => m.storagePath)
        .map(m => deleteObject(ref(storage, m.storagePath!)).catch(err => console.error("Storage delete error:", err)));
      
      await Promise.all(storagePromises);
      
      // Delete from firestore
      await firestoreService.deleteMultiple('media_library', selectedIds);
      
      toast.success(`${selectedIds.length} média(s) supprimé(s).`, { id: loadingToast });
      setSelectedIds([]);
    } catch (err) {
      toast.error("Erreur lors de la suppression groupée.", { id: loadingToast });
      throw err;
    }
  };

  const handleClearAll = async () => {
    if (media.length === 0) return;
    const loadingToast = toast.loading("Nettoyage de la galerie...");
    try {
      // Delete from storage
      const storagePromises = media
        .filter(m => m.storagePath)
        .map(m => deleteObject(ref(storage, m.storagePath!)).catch(err => console.error("Storage delete error:", err)));
      
      await Promise.all(storagePromises);
      
      // Delete from firestore
      const allIds = media.map(m => m.id);
      await firestoreService.deleteMultiple('media_library', allIds);
      
      toast.success("La galerie a été vidée.", { id: loadingToast });
      setSelectedIds([]);
    } catch (err) {
      toast.error("Erreur lors du nettoyage de la galerie.", { id: loadingToast });
      throw err;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredMedia.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMedia.map(m => m.id));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée !");
  };

  const setAsHero = async (url: string) => {
    try {
      await firestoreService.update('settings', 'app', { heroImage: url });
      toast.success("Image d'accueil mise à jour !");
    } catch (err) {
      // If document doesn't exist, create it
      try {
        await firestoreService.set('settings', 'app', { heroImage: url });
        toast.success("Image d'accueil mise à jour !");
      } catch (innerErr) {
        toast.error("Erreur lors de la mise à jour de l'image d'accueil.");
      }
    }
  };

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    try {
      await firestoreService.update('media_library', editingMedia.id, {
        name: editingMedia.name,
        category: editingMedia.category
      });
      toast.success("Média mis à jour !");
      setEditingMedia(null);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

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

  if (loading) return (
    <div className="flex items-center justify-center p-24">
      <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-16 h-16" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Galerie <br /> <span className="text-stroke-black text-transparent">Média</span>
          </h1>
          <div className="h-2 w-48 bg-black" />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              className="pl-12 border-4 border-black font-bold h-12" 
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload} 
          />
          <MangaButton 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? "Upload..." : <><Upload size={20} /> Uploader</>}
          </MangaButton>
          
          <MangaButton 
            variant="secondary"
            onClick={seedSampleMedia}
            disabled={isSeeding}
            className="flex items-center gap-2"
            title="Ajouter les images d'exemple à la galerie"
          >
            {isSeeding ? "Génération..." : media.length === 0 ? "Générer des exemples" : "Ajouter des exemples"}
          </MangaButton>

          {media.length > 0 && (
            <MangaButton 
              variant="outline"
              onClick={() => setIsClearingAll(true)}
              disabled={isSeeding || uploading}
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              title="Vider toute la galerie"
            >
              <Trash2 size={20} /> Vider
            </MangaButton>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap items-center gap-4">
          <MangaButton 
            variant="secondary" 
            onClick={selectAll}
            className="h-10 px-4 text-xs flex items-center gap-2"
          >
            {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
            {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? "Tout désélectionner" : "Tout sélectionner"}
          </MangaButton>

          {selectedIds.length > 0 && (
            <MangaButton 
              variant="danger" 
              onClick={() => setIsBulkDeleting(true)}
              className="h-10 px-4 text-xs flex items-center gap-2"
            >
              <Trash2 size={16} /> Supprimer ({selectedIds.length})
            </MangaButton>
          )}

          <div className="h-8 w-1 bg-black/10 hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-gray-400">Filtrer par :</span>
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

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.length > 0 ? (
            filteredMedia.map((m) => (
              <div 
                key={m.id} 
                className={cn(
                  "group relative bg-white border-4 border-black p-2 transition-all",
                  selectedIds.includes(m.id) ? "shadow-[8px_8px_0px_0px_rgba(255,0,0,1)] -translate-x-1 -translate-y-1" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="aspect-square border-2 border-black overflow-hidden relative cursor-pointer" onClick={() => toggleSelect(m.id)}>
                  <img 
                    src={m.url} 
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-cover transition-all",
                      selectedIds.includes(m.id) ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                    )} 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  
                  {/* Hero Indicator */}
                  {settings?.heroImage === m.url && (
                    <div className="absolute top-2 right-2 bg-manga-red text-white p-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-10 flex items-center gap-1">
                      <Star size={14} fill="currentColor" />
                      <span className="text-[8px] font-black uppercase">Home</span>
                    </div>
                  )}

                  {/* Selection Overlay */}
                  <div className={cn(
                    "absolute top-2 left-2 w-6 h-6 border-2 border-black flex items-center justify-center transition-all",
                    selectedIds.includes(m.id) ? "bg-manga-red text-white" : "bg-white/80 opacity-0 group-hover:opacity-100"
                  )}>
                    {selectedIds.includes(m.id) && <Check size={16} />}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAsHero(m.url); }}
                      className={cn(
                        "p-2 border-2 border-black transition-all",
                        settings?.heroImage === m.url ? "bg-manga-red text-white" : "bg-white text-black hover:bg-black hover:text-white"
                      )}
                      title="Définir comme image d'accueil"
                    >
                      <Star size={18} fill={settings?.heroImage === m.url ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingMedia(m); }}
                      className="p-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPreviewMedia(m); }}
                      className="p-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all"
                      title="Aperçu"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyUrl(m.url); }}
                      className="p-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all"
                      title="Copier l'URL"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingMedia({ id: m.id, path: m.storagePath }); }}
                      className="p-2 bg-red-500 text-white border-2 border-black hover:bg-black transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] font-black uppercase truncate text-black leading-none">{m.name}</div>
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                    <span className="text-manga-red">{m.category || 'Sans catégorie'}</span>
                    <span className="text-gray-400">{formatBytes(m.size)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border-8 border-dashed border-black p-20 text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter">La galerie est vide</h3>
                <p className="font-bold text-gray-500 max-w-md mx-auto">
                  Commencez par uploader vos propres images ou initialisez la galerie avec des exemples pour tester l'interface.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MangaButton 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload size={20} /> Uploader des fichiers
                </MangaButton>
                <MangaButton 
                  variant="secondary"
                  onClick={seedSampleMedia}
                  disabled={isSeeding}
                  className="flex items-center gap-2"
                >
                  {isSeeding ? "Génération..." : "Initialiser avec des exemples"}
                </MangaButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-xs font-black tracking-widest">
                <th className="p-4 w-12">
                  <button onClick={selectAll}>
                    {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="p-4">Aperçu</th>
                <th className="p-4">Nom</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Taille</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((m) => (
                <tr key={m.id} className={cn("border-b-2 border-black/10 hover:bg-gray-50 transition-colors", selectedIds.includes(m.id) && "bg-manga-red/5")}>
                  <td className="p-4">
                    <button onClick={() => toggleSelect(m.id)}>
                      {selectedIds.includes(m.id) ? <CheckSquare size={16} className="text-manga-red" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="w-12 h-12 border-2 border-black overflow-hidden cursor-pointer" onClick={() => setPreviewMedia(m)}>
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
                  <td className="p-4 font-black text-sm uppercase truncate max-w-[200px]">{m.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 border-2 border-black text-[10px] font-black uppercase">
                      {m.category || 'Sans catégorie'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-xs text-gray-500">{formatBytes(m.size)}</td>
                  <td className="p-4 font-bold text-xs text-gray-400">{formatDate(m.createdAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setAsHero(m.url)} 
                        className={cn(
                          "p-2 border-2 border-black transition-all",
                          settings?.heroImage === m.url ? "bg-manga-red text-white" : "hover:bg-black hover:text-white"
                        )}
                        title="Image d'accueil"
                      >
                        <Star size={16} fill={settings?.heroImage === m.url ? "currentColor" : "none"} />
                      </button>
                      <a 
                        href={m.url} 
                        download={m.name} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"
                        title="Télécharger"
                      >
                        <Download size={16} />
                      </a>
                      <button 
                        onClick={() => setEditingMedia(m)} 
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => copyUrl(m.url)} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"><Copy size={16} /></button>
                      <button onClick={() => setDeletingMedia({ id: m.id, path: m.storagePath })} className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="sm:max-w-[800px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="bg-black text-white p-6 flex flex-row justify-between items-center">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter truncate pr-8">
              {previewMedia?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="aspect-video border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                src={previewMedia?.url} 
                alt={previewMedia?.name} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-gray-400">Nom du fichier</div>
                  <div className="font-black uppercase break-all">{previewMedia?.name}</div>
                </div>
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-gray-400">Taille</div>
                    <div className="font-black">{previewMedia ? formatBytes(previewMedia.size) : '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-gray-400">Date d'upload</div>
                    <div className="font-black">{previewMedia ? formatDate(previewMedia.createdAt) : '-'}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 justify-end">
                <MangaButton 
                  onClick={() => previewMedia && setAsHero(previewMedia.url)} 
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    settings?.heroImage === previewMedia?.url ? "bg-manga-red" : ""
                  )}
                >
                  <Star size={20} fill={settings?.heroImage === previewMedia?.url ? "currentColor" : "none"} /> 
                  {settings?.heroImage === previewMedia?.url ? "Image d'accueil actuelle" : "Définir comme image d'accueil"}
                </MangaButton>
                <MangaButton onClick={() => previewMedia && copyUrl(previewMedia.url)} className="w-full flex items-center justify-center gap-2">
                  <Copy size={20} /> Copier l'URL
                </MangaButton>
                <a 
                  href={previewMedia?.url} 
                  download={previewMedia?.name} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <MangaButton variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Download size={20} /> Télécharger
                  </MangaButton>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <DeleteConfirm 
        isOpen={!!deletingMedia} 
        onClose={() => setDeletingMedia(null)} 
        onConfirm={handleDelete} 
      />

      <DeleteConfirm 
        isOpen={isBulkDeleting} 
        onClose={() => setIsBulkDeleting(false)} 
        onConfirm={handleBulkDelete}
        title={`Supprimer ${selectedIds.length} média(s) ?`}
        message="Cette action est irréversible et supprimera définitivement les fichiers du stockage."
      />

      <DeleteConfirm 
        isOpen={isClearingAll} 
        onClose={() => setIsClearingAll(false)} 
        onConfirm={handleClearAll}
        title="Vider toute la galerie ?"
        message="Cette action supprimera TOUS les médias de la bibliothèque. C'est irréversible."
      />

      {/* Edit Modal */}
      <Dialog open={!!editingMedia} onOpenChange={(open) => !open && setEditingMedia(null)}>
        <DialogContent className="sm:max-w-[500px] border-8 border-black p-0 overflow-hidden bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="bg-black text-white p-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              Modifier le média
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMedia} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nom du fichier</label>
              <Input 
                className="border-4 border-black font-bold h-12"
                value={editingMedia?.name || ''}
                onChange={e => setEditingMedia(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Catégorie</label>
              <Input 
                className="border-4 border-black font-bold h-12"
                placeholder="ex: Manga, Coaching, Dojo..."
                value={editingMedia?.category || ''}
                onChange={e => setEditingMedia(prev => prev ? { ...prev, category: e.target.value } : null)}
              />
            </div>
            <div className="pt-4 flex gap-4">
              <MangaButton 
                type="button" 
                variant="secondary" 
                onClick={() => setEditingMedia(null)}
                className="flex-1 h-14"
              >
                Annuler
              </MangaButton>
              <MangaButton type="submit" className="flex-1 h-14">
                Enregistrer
              </MangaButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
