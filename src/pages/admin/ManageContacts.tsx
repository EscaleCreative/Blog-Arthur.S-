import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { ContactRequest } from '../../types';
import { MangaCard, MangaButton } from '../../components/ui/MangaUI';
import { Mail, Calendar, User, Trash2, MessageSquare, Clock, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DeleteConfirm } from '../../components/ui/DeleteConfirm';

export default function ManageContacts() {
  const { data: contacts, loading } = useCollection<ContactRequest>('contact_requests', []);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(c => 
        c.firstName.toLowerCase().includes(search.toLowerCase()) || 
        c.lastName.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.message.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contacts, search]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await firestoreService.delete('contact_requests', deletingId);
      toast.success("Demande supprimée.");
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
            Demandes de <br /> <span className="text-stroke-black text-transparent">Contact</span>
          </h1>
          <div className="h-2 w-48 bg-black" />
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            className="pl-12 border-4 border-black font-bold h-12" 
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-12">
              <div className="md:w-64 space-y-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl uppercase">
                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">{contact.firstName} {contact.lastName}</h3>
                    <p className="font-bold text-gray-400 text-sm">{contact.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-6 border-t-2 border-black/10">
                  <div className="flex items-center gap-3 font-bold text-sm">
                    <Calendar size={18} className="text-gray-400" />
                    <span>Reçu le {new Date(contact.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {contact.desiredDate && (
                    <div className="flex items-center gap-3 font-bold text-sm text-blue-600">
                      <Clock size={18} />
                      <span>Souhaité le {new Date(contact.desiredDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                <MangaButton 
                  variant="danger" 
                  className="w-full py-2 px-4 text-xs"
                  onClick={() => setDeletingId(contact.id)}
                >
                  Supprimer
                </MangaButton>
              </div>

              <div className="flex-1 bg-gray-50 border-4 border-black p-8 relative">
                <MessageSquare className="absolute -top-4 -left-4 text-black fill-white" size={32} />
                <div className="prose prose-lg font-bold text-gray-700 leading-relaxed italic">
                  "{contact.message}"
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-100 border-4 border-dashed border-black p-24 text-center font-black uppercase text-gray-400">
            Aucune demande de contact
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
