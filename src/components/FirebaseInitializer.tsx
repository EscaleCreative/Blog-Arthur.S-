import { useEffect } from 'react';
import { collection, getDocs, writeBatch, doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_SERVICES, INITIAL_VERBATIMS, INITIAL_MEDIA } from '../constants';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

export function FirebaseInitializer() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore is offline. Please check your Firebase configuration.");
          toast.error("Connexion à la base de données impossible. Vérifiez la configuration Firebase.");
        }
      }
    };

    const seedData = async () => {
      if (!isAdmin) return;
      
      try {
        // Seed Services
        const servicesSnap = await getDocs(collection(db, 'services'));
        if (servicesSnap.empty) {
          const batch = writeBatch(db);
          INITIAL_SERVICES.forEach((service) => {
            const newDocRef = doc(collection(db, 'services'));
            batch.set(newDocRef, {
              ...service,
              createdAt: new Date().toISOString()
            });
          });
          await batch.commit();
          console.log('Services seeded');
          toast.success('Services initialisés !');
        }

        // Seed Verbatims
        const verbatimsSnap = await getDocs(collection(db, 'verbatims'));
        if (verbatimsSnap.empty) {
          const vBatch = writeBatch(db);
          INITIAL_VERBATIMS.forEach((verbatim) => {
            const newDocRef = doc(collection(db, 'verbatims'));
            vBatch.set(newDocRef, {
              ...verbatim,
              createdAt: new Date().toISOString()
            });
          });
          await vBatch.commit();
          console.log('Verbatims seeded');
        }

        // Seed Media Library
        const mediaSnap = await getDocs(collection(db, 'media_library'));
        if (mediaSnap.empty) {
          const mBatch = writeBatch(db);
          INITIAL_MEDIA.forEach((media) => {
            const newDocRef = doc(collection(db, 'media_library'));
            mBatch.set(newDocRef, {
              ...media,
              createdAt: new Date().toISOString()
            });
          });
          await mBatch.commit();
          console.log('Media library seeded');
        }
        
        // Seed initial "Le Saviez-Vous ?"
        const lsvSnap = await getDocs(collection(db, 'le_saviez_vous'));
        if (lsvSnap.empty) {
          const lsvBatch = writeBatch(db);
          const initialArticle = {
            title: "L'importance de l'hydratation",
            content: "Boire de l'eau est crucial pour la performance sportive. Une déshydratation de seulement 2% peut réduire vos capacités physiques de 20%. Pensez à boire régulièrement avant, pendant et après l'effort !",
            active: true,
            createdAt: new Date().toISOString()
          };
          const newDocRef = doc(collection(db, 'le_saviez_vous'));
          lsvBatch.set(newDocRef, initialArticle);
          await lsvBatch.commit();
          console.log('Initial article seeded');
        }
      } catch (err: any) {
        console.error("Error during data seeding:", err);
      }
    };

    testConnection();
    seedData();
  }, [isAdmin]);

  return null;
}
