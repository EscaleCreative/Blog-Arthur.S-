import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection, firestoreService, useDocument } from '../hooks/useFirestore';
import { Service, Verbatim, LeSaviezVous, AppSettings } from '../types';
import { MangaCard, MangaButton } from '../components/ui/MangaUI';
import { INITIAL_VERBATIMS } from '../constants';
import { Star, Calendar, Clock, User, MessageSquare, Mail, Phone, X, Info, ArrowRight } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Home() {
  const { data: services, loading: servicesLoading } = useCollection<Service>('services', []);
  const { data: verbatims } = useCollection<Verbatim>('verbatims', []);
  const { data: articles } = useCollection<LeSaviezVous>('le_saviez_vous', []);
  const { data: settings } = useDocument<AppSettings>('settings', 'app');
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Handle hash-based scrolling and search params
  useEffect(() => {
    const handleScroll = () => {
      const hash = location.hash;
      const serviceId = searchParams.get('serviceId');

      if (serviceId) {
        setReservation(prev => ({ ...prev, serviceId }));
        const element = document.getElementById('action-zone');
        if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      } else if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    handleScroll();
  }, [location, searchParams]);

  // Dynamic Verbatims: 2 random ones
  const displayedVerbatims = useMemo(() => {
    const pool = verbatims.length > 0 ? verbatims : (INITIAL_VERBATIMS as Verbatim[]);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [verbatims]);

  // Le Saviez-Vous ? Rotation every 5 minutes
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const activeArticles = useMemo(() => articles.filter(a => a.active), [articles]);

  useEffect(() => {
    if (activeArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentArticleIndex(prev => (prev + 1) % activeArticles.length);
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [activeArticles]);

  const currentArticle = activeArticles[currentArticleIndex];

  // Reservation Form State
  const [reservation, setReservation] = useState({
    clientName: '',
    serviceId: '',
    date: '',
    time: '',
    duration: '1h'
  });

  // Handle pre-selected service from URL
  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      setReservation(prev => ({ ...prev, serviceId }));
      // Scroll to reservation section
      const element = document.getElementById('action-zone');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

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
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'envoi.");
    }
  };

  if (servicesLoading && services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin border-8 border-black border-t-transparent rounded-full w-16 h-16" />
          <p className="font-black uppercase tracking-tighter text-xl">Chargement du Dojo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-offwhite bg-grid-vertical">
      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-10 px-6 md:px-12 overflow-hidden scroll-mt-24">
        {/* Background Kanji */}
        <div className="absolute top-20 left-10 text-[20rem] font-black text-manga-red/5 pointer-events-none select-none italic transform -rotate-12 z-0">
          武道心
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="inline-block bg-black text-white px-4 py-2 font-black text-4xl -rotate-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] mb-4">
              MOODYS
            </div>
            <div className="space-y-0">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                COACH SPORTIF
              </h2>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-manga-red">
                ARTHUR SITAUD
              </h1>
              <div className="flex items-center gap-2 text-2xl font-black text-black mt-2">
                <Phone size={24} className="text-manga-red" />
                <a href="tel:0678420966" className="hover:text-manga-red transition-colors">06 78 42 09 66</a>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xl font-black text-manga-red uppercase tracking-widest">
                BPJEPS MÉTIERS DE LA FORME
              </p>
              <p className="text-lg font-bold text-gray-500">
                Poitiers & Environs
              </p>
            </div>

            <p className="text-2xl font-bold italic max-w-lg">
              « Chaque mouvement compte. »
            </p>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              DESIGNED PAR ARTHUR.S
            </p>

            <div className="pt-8 flex flex-wrap gap-4">
              <MangaButton 
                onClick={() => document.getElementById('action-zone')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 text-xl"
              >
                Réserver une séance
              </MangaButton>
              <MangaButton 
                variant="outline"
                onClick={() => document.getElementById('action-zone')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 text-xl"
              >
                Me Contacter
              </MangaButton>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex justify-center lg:justify-end"
          >
            <img 
              src={settings?.heroImage || "https://images.unsplash.com/photo-1590502160462-08994220392b?q=80&w=1000&auto=format&fit=crop"} 
              alt="Arthur Sitaud - Kenshi Style" 
              className="w-full max-w-lg drop-shadow-[20px_20px_40px_rgba(200,16,46,0.3)] hover:scale-105 transition-all duration-700 relative z-20 border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=1000&auto=format&fit=crop";
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="pt-10 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 scroll-mt-24">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Nos Services</h2>
            <div className="h-2 w-48 bg-manga-red" />
          </div>
        </div>

        {services.length === 0 ? (
          <div className="border-8 border-black border-dashed p-20 text-center">
            <p className="font-black uppercase text-2xl text-gray-400 italic">Aucun service disponible pour le moment.</p>
            <p className="mt-4 font-bold text-black">Initialisation des données en cours...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Featured Services */}
            {services.filter(s => s.featured).map((service) => (
              <Link key={service.id} to={`/activity/${service.id}`} className="md:col-span-2 lg:col-span-1">
                <MangaCard kanji={service.kanji} className="h-full flex flex-col">
                  <img 
                    src={service.image || `https://picsum.photos/seed/${service.title}/600/400`} 
                    className="w-full h-48 object-cover border-4 border-black mb-6 grayscale hover:grayscale-0 transition-all"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <h3 className="text-3xl font-black uppercase mb-2 group-hover:text-manga-red transition-colors">{service.title}</h3>
                  <p className="text-lg font-bold text-gray-600 mb-4">{service.tagline}</p>
                  
                  <div className="flex gap-2 mb-6">
                    <Link to={`/activity/${service.id}`} className="flex-1">
                      <MangaButton variant="outline" className="w-full py-2 text-xs uppercase">Détails</MangaButton>
                    </Link>
                    <MangaButton 
                      className="flex-1 py-2 text-xs uppercase"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setReservation(prev => ({ ...prev, serviceId: service.id }));
                        document.getElementById('action-zone')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Réserver
                    </MangaButton>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t-2 border-black/10">
                    <span className="font-black text-2xl text-manga-red">{service.price ? `${service.price}€` : "Sur devis"}</span>
                    <span className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      Détails <ArrowRight size={16} className="text-manga-red" />
                    </span>
                  </div>
                </MangaCard>
              </Link>
            ))}
            
            {/* Regular Services */}
            {services.filter(s => !s.featured).map((service) => (
              <Link key={service.id} to={`/activity/${service.id}`}>
                <MangaCard kanji={service.kanji} className="h-full flex flex-col">
                  <h3 className="text-2xl font-black uppercase mb-2">{service.title}</h3>
                  <p className="font-bold text-gray-600 mb-4 line-clamp-2">{service.tagline}</p>
                  
                  <div className="flex gap-2 mb-4 mt-auto">
                    <Link to={`/activity/${service.id}`} className="flex-1">
                      <MangaButton variant="outline" className="w-full py-1 text-[10px] uppercase">Infos</MangaButton>
                    </Link>
                    <MangaButton 
                      className="flex-1 py-1 text-[10px] uppercase"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setReservation(prev => ({ ...prev, serviceId: service.id }));
                        document.getElementById('action-zone')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Réserver
                    </MangaButton>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-black/10">
                    <span className="font-black text-xl">{service.price ? `${service.price}€` : "Sur devis"}</span>
                    <span className="font-bold text-xs uppercase">Voir plus</span>
                  </div>
                </MangaCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Programme Sur Mesure Block */}
      <section className="py-16 px-6 md:px-12 bg-black text-white relative overflow-hidden border-y-8 border-black">
        <div className="absolute top-0 right-0 text-[18rem] font-black text-white/5 pointer-events-none select-none italic transform rotate-12 translate-x-1/4 -translate-y-1/4">
          力
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Programme <br /> 
                <span className="text-manga-red italic">Sur Mesure</span>
              </h2>
              <p className="text-lg font-bold text-gray-300 leading-relaxed max-w-lg">
                Vous préférez vous entraîner seul mais vous avez besoin d'un guide ? 
                Je conçois pour vous un plan d'entraînement complet, adapté à votre matériel, 
                votre emploi du temps et vos objectifs précis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-manga-red rotate-45 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Analyse</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Étude de vos besoins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-manga-red rotate-45 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Planification</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Cycle 4 à 12 semaines</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-manga-red rotate-45 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Vidéos</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Démos techniques</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-manga-red rotate-45 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Bilan</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Suivi hebdomadaire</p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <MangaButton 
                  variant="primary" 
                  className="w-full md:w-auto px-10 py-3 text-base"
                  onClick={() => {
                    const el = document.getElementById('action-zone');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Demander mon programme
                </MangaButton>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-manga-red/10 blur-3xl rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" 
                alt="Training Program" 
                className="relative z-10 border-8 border-white grayscale hover:grayscale-0 transition-all duration-700 shadow-[15px_15px_0px_0px_rgba(200,16,46,1)] max-w-sm ml-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Le Saviez-Vous ? Section */}
      <section id="le-saviez-vous" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <Info size={32} className="text-black" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">Le Saviez-Vous ?</h2>
            </div>
            
            <AnimatePresence mode="wait">
              {currentArticle ? (
                <motion.div
                  key={currentArticle.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                >
                  <h3 className="text-2xl font-black uppercase mb-4">{currentArticle.title}</h3>
                  <div className="prose prose-lg font-bold text-gray-700 mb-6">
                    {currentArticle.content}
                  </div>
                  <Link to="/archives" className="inline-flex items-center gap-2 font-black uppercase text-sm hover:underline decoration-4">
                    Voir toutes les archives <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ) : (
                <div className="bg-gray-100 border-4 border-dashed border-black p-12 text-center font-black uppercase text-gray-400">
                  Aucun article pour le moment
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-black pb-2">Ils Témoignent</h2>
              <div className="space-y-8">
                {displayedVerbatims.map((v, i) => (
                  <div key={v.id || i} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, starI) => (
                        <Star key={starI} size={14} className={starI < (v.rating || 5) ? "fill-manga-red text-manga-red" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-gray-600 italic leading-relaxed mb-4">
                      « {v.content} »
                    </p>
                    <p className="text-manga-red font-black uppercase text-sm">
                      — {v.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Action Zone: Booking & Contact */}
      <section id="action-zone" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t-8 border-black scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-black uppercase tracking-tighter inline-block relative">
            Passez à l'action
            <div className="absolute -bottom-2 left-0 w-full h-4 bg-manga-red/30 -z-10" />
          </h2>
          <p className="mt-4 font-bold text-gray-500 uppercase tracking-widest">Choisissez votre voie : Réservation ou Message</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reservation Column */}
          <div className="space-y-8">
            <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(200,16,46,1)] relative overflow-hidden">
              <div className="absolute -top-6 -right-6 text-8xl font-black text-manga-red/5 italic transform rotate-12 pointer-events-none">
                予約
              </div>
              <h3 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 flex items-center gap-3">
                <Calendar className="text-manga-red" />
                Réserver une séance
              </h3>
              <form onSubmit={handleReservation} className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-black uppercase text-xs">Votre Nom Complet</Label>
                  <Input 
                    className="border-4 border-black font-bold h-12 text-lg" 
                    placeholder="Ex: Son Goku"
                    value={reservation.clientName}
                    onChange={e => setReservation({...reservation, clientName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-black uppercase text-xs">Service Souhaité</Label>
                  <select 
                    className="w-full h-12 px-4 border-4 border-black font-bold bg-white text-lg appearance-none cursor-pointer"
                    value={reservation.serviceId}
                    onChange={e => setReservation({...reservation, serviceId: e.target.value})}
                  >
                    <option value="">Choisir un service...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="font-black uppercase text-xs">Date</Label>
                    <Input 
                      type="date" 
                      className="border-4 border-black font-bold h-12" 
                      value={reservation.date}
                      onChange={e => setReservation({...reservation, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-black uppercase text-xs">Heure</Label>
                    <Input 
                      type="time" 
                      className="border-4 border-black font-bold h-12" 
                      value={reservation.time}
                      onChange={e => setReservation({...reservation, time: e.target.value})}
                    />
                  </div>
                </div>
                <MangaButton type="submit" className="w-full py-4 text-xl mt-4">
                  Confirmer la demande
                </MangaButton>
              </form>
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute -top-6 -right-6 text-8xl font-black text-black/5 italic transform rotate-12 pointer-events-none">
                連絡
              </div>
              <h3 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 flex items-center gap-3">
                <MessageSquare className="text-black" />
                Poser une question
              </h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '', desiredDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      toast.error("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email, Message).");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }
    setLoading(true);
    try {
      await firestoreService.add('contact_requests', form);
      toast.success("Message envoyé ! Arthur vous répondra bientôt.");
      setForm({ firstName: '', lastName: '', email: '', message: '', desiredDate: '' });
    } catch (err) {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="font-black uppercase text-xs">Prénom</Label>
          <Input className="border-4 border-black font-bold h-12" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label className="font-black uppercase text-xs">Nom</Label>
          <Input className="border-4 border-black font-bold h-12" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="font-black uppercase text-xs">Email</Label>
        <Input type="email" className="border-4 border-black font-bold h-12" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      </div>
      <div className="space-y-1">
        <Label className="font-black uppercase text-xs">Votre Message</Label>
        <Textarea className="border-4 border-black font-bold min-h-[120px] text-lg" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
      </div>
      <MangaButton type="submit" variant="outline" className="w-full py-4 text-xl" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer le message"}
      </MangaButton>
    </form>
  );
}

function ContactModal({ variant = "primary", className = "", label = "Me Contacter" }: { variant?: "primary" | "secondary" | "outline", className?: string, label?: string }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '', desiredDate: '' });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      toast.error("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email, Message).");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }
    try {
      await firestoreService.add('contact_requests', form);
      toast.success("Message envoyé ! Arthur vous répondra par email.");
      setOpen(false);
      setForm({ firstName: '', lastName: '', email: '', message: '', desiredDate: '' });
    } catch (err) {
      toast.error("Erreur lors de l'envoi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<MangaButton variant={variant} className={className}>{label}</MangaButton>} />
      <DialogContent className="sm:max-w-[500px] border-8 border-black p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-black text-white p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Contactez Arthur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-black uppercase text-xs">Prénom</Label>
              <Input className="border-4 border-black font-bold" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-black uppercase text-xs">Nom</Label>
              <Input className="border-4 border-black font-bold" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-black uppercase text-xs">Email</Label>
            <Input type="email" className="border-4 border-black font-bold" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="font-black uppercase text-xs">Date souhaitée (optionnel)</Label>
            <Input type="date" className="border-4 border-black font-bold" value={form.desiredDate} onChange={e => setForm({...form, desiredDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="font-black uppercase text-xs">Votre Demande</Label>
            <Textarea className="border-4 border-black font-bold min-h-[100px]" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          </div>
          <MangaButton type="submit" className="w-full">Envoyer le message</MangaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
