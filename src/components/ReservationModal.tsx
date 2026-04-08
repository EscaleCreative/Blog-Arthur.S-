import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MangaButton } from './ui/MangaUI';
import { Service } from '../types';
import { firestoreService } from '../hooks/useFirestore';
import { toast } from 'sonner';

interface ReservationModalProps {
  services: Service[];
  initialServiceId?: string;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReservationModal({ services, initialServiceId, trigger, open: controlledOpen, onOpenChange }: ReservationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [reservation, setReservation] = useState({
    clientName: '',
    serviceId: initialServiceId || '',
    date: '',
    time: '',
    duration: '1h'
  });

  useEffect(() => {
    if (initialServiceId) {
      setReservation(prev => ({ ...prev, serviceId: initialServiceId }));
    }
  }, [initialServiceId]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation.clientName || !reservation.serviceId || !reservation.date || !reservation.time) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      const selectedService = services.find(s => s.id === reservation.serviceId);
      await firestoreService.add('reservations', {
        ...reservation,
        serviceTitle: selectedService?.title || 'Service inconnu',
        status: 'pending'
      });
      toast.success("Demande de réservation envoyée ! Arthur vous recontactera bientôt.");
      setReservation({ clientName: '', serviceId: '', date: '', time: '', duration: '1h' });
      setOpen(false);
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[500px] border-8 border-black p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-black text-white p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Réserver une séance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleReservation} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="font-black uppercase text-xs">Votre Nom</Label>
            <Input 
              className="border-4 border-black font-bold" 
              value={reservation.clientName}
              onChange={e => setReservation({...reservation, clientName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-black uppercase text-xs">Service</Label>
            <select 
              className="w-full h-10 px-3 border-4 border-black font-bold bg-white"
              value={reservation.serviceId}
              onChange={e => setReservation({...reservation, serviceId: e.target.value})}
              required
            >
              <option value="">Choisir un service...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-black uppercase text-xs">Date</Label>
              <Input 
                type="date" 
                className="border-4 border-black font-bold" 
                value={reservation.date}
                onChange={e => setReservation({...reservation, date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black uppercase text-xs">Heure</Label>
              <Input 
                type="time" 
                className="border-4 border-black font-bold" 
                value={reservation.time}
                onChange={e => setReservation({...reservation, time: e.target.value})}
                required
              />
            </div>
          </div>
          <MangaButton type="submit" className="w-full">Envoyer la demande</MangaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
