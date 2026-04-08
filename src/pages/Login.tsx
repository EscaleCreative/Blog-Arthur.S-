import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MangaButton } from '../components/ui/MangaUI';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login, register, loginWithGoogle, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
        toast.success("Compte créé avec succès !");
      } else {
        await login(email, password);
        toast.success("Connexion réussie !");
      }
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Connexion Google réussie !");
    } catch (err: any) {
      toast.error("Erreur Google : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 font-black uppercase text-sm mb-8 hover:underline decoration-4">
          <ArrowLeft size={16} /> Retour
        </Link>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="text-center space-y-4 mb-10">
            <div className="inline-block bg-black text-white px-4 py-2 font-black text-3xl -rotate-3">
              ADMIN
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              {isRegister ? "Inscription" : "Connexion"}
            </h1>
            <p className="font-bold text-gray-500 italic">Espace réservé à Arthur Sitaud</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs flex items-center gap-2">
                  <Mail size={14} /> Email
                </Label>
                <Input 
                  type="email" 
                  className="border-4 border-black font-bold h-12" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-xs flex items-center gap-2">
                  <Lock size={14} /> Mot de passe
                </Label>
                <Input 
                  type="password" 
                  className="border-4 border-black font-bold h-12" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <MangaButton type="submit" className="w-full h-14" disabled={loading}>
              {loading ? "Traitement..." : (isRegister ? "Créer mon compte" : "Entrer dans le Dojo")}
            </MangaButton>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-black border-dashed"></span></div>
              <div className="relative flex justify-center text-xs uppercase font-black"><span className="bg-white px-4">OU</span></div>
            </div>
            
            <MangaButton 
              variant="secondary" 
              className="w-full h-14 flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </MangaButton>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="font-black uppercase text-xs hover:underline decoration-2"
            >
              {isRegister ? "Déjà un compte ? Se connecter" : "Première fois ? Créer un compte"}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t-4 border-black border-dashed text-center">
            <div className="text-6xl font-black text-black/5 italic select-none">
              {isRegister ? "SIGNUP" : "LOGIN"}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
