import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { Reservation } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Calendar, Clock, User, Trash2, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';

export default function ManageReservations() {
  const { data: reservations, loading } = useCollection<Reservation>('reservations', []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredReservations = useMemo(() => {
    return reservations
      .filter(r => 
        (r.clientName.toLowerCase().includes(search.toLowerCase()) || r.serviceTitle.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || r.status === statusFilter)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reservations, search, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await firestoreService.update('reservations', id, { status });
      toast.success(`Statut mis à jour : ${status}`);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await firestoreService.delete('reservations', deletingId);
      toast.success("Réservation supprimée.");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      throw err;
    }
  };

  const statusColors = {
    pending: "bg-yellow-400 text-black",
    confirmed: "bg-green-500 text-white",
    cancelled: "bg-red-500 text-white"
  };

  const statusIcons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    cancelled: XCircle
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Réservations <br /> <span className="text-stroke-black text-transparent">Clients</span>
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
          <select 
            className="h-12 px-4 border-4 border-black font-black uppercase text-sm bg-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((res) => {
            const StatusIcon = statusIcons[res.status];
            return (
              <div key={res.id} className="bg-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-8 items-center">
                <div className={cn("w-16 h-16 flex items-center justify-center border-4 border-black shrink-0", statusColors[res.status])}>
                  <StatusIcon size={32} />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="space-y-1">
                    <div className="font-black uppercase text-xs text-gray-400">Client</div>
                    <div className="text-xl font-black">{res.clientName}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-black uppercase text-xs text-gray-400">Service</div>
                    <div className="text-xl font-black">{res.serviceTitle}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-black uppercase text-xs text-gray-400">Date & Heure</div>
                    <div className="text-xl font-black flex items-center gap-2">
                      <Calendar size={18} /> {new Date(res.date).toLocaleDateString('fr-FR')} à {res.time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                  {res.status !== 'confirmed' && (
                    <MangaButton 
                      variant="secondary" 
                      className="py-2 px-4 text-xs bg-green-500 text-white"
                      onClick={() => updateStatus(res.id, 'confirmed')}
                    >
                      Confirmer
                    </MangaButton>
                  )}
                  {res.status !== 'cancelled' && (
                    <MangaButton 
                      variant="secondary" 
                      className="py-2 px-4 text-xs bg-red-500 text-white"
                      onClick={() => updateStatus(res.id, 'cancelled')}
                    >
                      Annuler
                    </MangaButton>
                  )}
                  <button 
                    onClick={() => setDeletingId(res.id)}
                    className="p-3 border-4 border-black hover:bg-black hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gray-100 border-4 border-dashed border-black p-24 text-center font-black uppercase text-gray-400">
            Aucune réservation trouvée
          </div>
        )}
      </div>

      <DeleteConfirm 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}
