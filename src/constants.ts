import { Service, Verbatim, Media } from './types';

export const INITIAL_VERBATIMS: Partial<Verbatim>[] = [
  { author: "Marc L.", content: "Arthur m'a aidé à reprendre le sport après 5 ans d'arrêt. Sa patience et son expertise sont incroyables.", rating: 5 },
  { author: "Sophie D.", content: "Le programme sur mesure est top. J'ai vu des résultats dès le premier mois !", rating: 5 },
  { author: "Julien R.", content: "Un coach qui connaît son métier. Les séances sont intenses mais toujours dans la bonne humeur.", rating: 4 },
  { author: "Léa M.", content: "J'adore l'approche d'Arthur. Il s'adapte vraiment à mes besoins et mes limites.", rating: 5 },
  { author: "Thomas B.", content: "Le coaching à domicile est un vrai gain de temps. Arthur est ponctuel et très pro.", rating: 5 },
  { author: "Emma G.", content: "Grâce à Arthur, j'ai enfin réussi à atteindre mes objectifs de perte de poids.", rating: 5 },
  { author: "Nicolas P.", content: "Un accompagnement de qualité. Je recommande vivement Arthur pour tous ceux qui veulent progresser.", rating: 5 },
  { author: "Chloé S.", content: "Les séances sont variées et motivantes. On ne s'ennuie jamais !", rating: 4 },
  { author: "Antoine F.", content: "Arthur est très à l'écoute et sait nous pousser quand il le faut.", rating: 5 },
  { author: "Sarah V.", content: "Le meilleur coach de Poitiers sans aucun doute !", rating: 5 },
  { author: "David K.", content: "Un vrai pro. Ses conseils en nutrition sont aussi très précieux.", rating: 5 },
  { author: "Marie J.", content: "Séances dynamiques et résultats visibles. Merci Arthur !", rating: 5 },
  { author: "Paul H.", content: "Arthur est passionné et ça se voit. Un plaisir de s'entraîner avec lui.", rating: 5 },
  { author: "Julie C.", content: "J'ai gagné en force et en souplesse grâce à ses programmes.", rating: 4 },
  { author: "Kevin L.", content: "Un coaching personnalisé qui fait toute la différence.", rating: 5 },
  { author: "Alice R.", content: "Arthur est très pédagogue et ses explications sont claires.", rating: 5 },
  { author: "Benoit M.", content: "Une expérience de coaching exceptionnelle. Je ne regrette pas mon choix.", rating: 5 },
  { author: "Clara G.", content: "Arthur est un coach en or. Allez-y les yeux fermés !", rating: 5 }
];

export const INITIAL_SERVICES: Partial<Service>[] = [
  {
    title: "Personal Training",
    tagline: "L'excellence du coaching individuel.",
    description: "Un accompagnement 100% personnalisé pour atteindre vos objectifs avec précision et motivation. Séance d'une heure adaptée à votre niveau.",
    icon: "User",
    kanji: "鍛", // Discipline/Train
    price: 60,
    duration: "1h",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200",
    featured: true,
    order: 1
  },
  {
    title: "Small Group",
    tagline: "L'énergie du groupe, la précision du coach.",
    description: "Séance collective en petit groupe pour une dynamique stimulante tout en bénéficiant des corrections du coach. 25€ par personne.",
    icon: "Users",
    kanji: "衆", // Crowd
    price: 25,
    duration: "1h",
    image: "https://images.unsplash.com/photo-1571902258032-783007241151?auto=format&fit=crop&q=80&w=1200",
    featured: true,
    order: 2
  },
  {
    title: "Préparation Physique",
    tagline: "Dépassez vos limites athlétiques.",
    description: "Programme intensif axé sur la performance, la force et l'endurance. Idéal pour les sportifs cherchant à franchir un palier.",
    icon: "Zap",
    kanji: "競", // Compete
    price: 80,
    duration: "1h30",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200",
    featured: true,
    order: 3
  },
  {
    title: "Accompagnement DYS",
    tagline: "Le sport au service des troubles DYS.",
    description: "Un programme spécifique conçu pour les personnes présentant des troubles DYS (dyslexie, dyspraxie, etc.). Utilisation du mouvement pour améliorer la coordination, la confiance en soi et les fonctions cognitives.",
    icon: "Brain",
    kanji: "脳", // Brain
    price: 55,
    duration: "1h",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
    featured: true,
    order: 4
  },
  {
    title: "Coaching Duo",
    tagline: "À deux, c'est mieux.",
    description: "Partagez votre séance avec un partenaire. Motivation doublée et tarif avantageux : 40€ par personne.",
    icon: "UserPlus",
    kanji: "双", // Pair
    price: 40,
    duration: "1h",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200",
    featured: false,
    order: 4
  },
  {
    title: "Bilan Forme & Santé",
    tagline: "Faites le point sur votre condition.",
    description: "Une évaluation complète de votre état de forme physique, souplesse et composition corporelle pour définir votre stratégie.",
    icon: "ClipboardCheck",
    kanji: "診", // Diagnosis
    price: 50,
    duration: "45min",
    featured: false,
    order: 5
  },
  {
    title: "Programme Sur Mesure",
    tagline: "Votre plan d'entraînement personnalisé.",
    description: "Je conçois pour vous un plan d'entraînement complet, adapté à votre matériel, votre emploi du temps et vos objectifs précis. Idéal pour ceux qui préfèrent s'entraîner seuls mais avec un guide expert.",
    icon: "FileText",
    kanji: "画", // Plan
    featured: true,
    order: 6
  }
];

export const INITIAL_MEDIA: Partial<Media>[] = [
  { name: 'Arthur - Coaching Focus', url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 542, category: 'Coaching' },
  { name: 'Samurai Spirit Art', url: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 820, category: 'Manga' },
  { name: 'Dojo Training Hall', url: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 450, category: 'Dojo' },
  { name: 'Katana Close-up', url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 320, category: 'Manga' },
  { name: 'Zen Garden Path', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 910, category: 'Zen' },
  { name: 'Manga Illustration', url: 'https://images.unsplash.com/photo-1613376023733-0d743d20719b?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 670, category: 'Manga' },
  { name: 'Street Workout Bar', url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 720, category: 'Fitness' },
  { name: 'Boxing Gloves', url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 880, category: 'Fitness' },
  { name: 'Meditation Session', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 590, category: 'Zen' },
  { name: 'Runner Silhouette', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 640, category: 'Fitness' },
  { name: 'Kettlebell Workout', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 512, category: 'Fitness' },
  { name: 'Yoga Practice', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 420, category: 'Zen' },
  { name: 'Dojo Entrance Gate', url: 'https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 750, category: 'Dojo' },
  { name: 'Healthy Buddha Bowl', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 340, category: 'Nutrition' },
  { name: 'Samurai Mask Display', url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 610, category: 'Manga' },
  { name: 'Gym Interior', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 920, category: 'Fitness' },
  { name: 'Bamboo Grove', url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 810, category: 'Zen' },
  { name: 'Training Session', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 440, category: 'Coaching' },
  { name: 'Green Smoothie', url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 280, category: 'Nutrition' },
  { name: 'Kyoto Pagoda', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 770, category: 'Manga' },
  { name: 'Japanese Garden', url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 850, category: 'Dojo' },
  { name: 'Protein Supplement', url: 'https://images.unsplash.com/photo-1593073196033-973ad478c487?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 310, category: 'Nutrition' },
  { name: 'Dojo Training Area', url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 940, category: 'Dojo' },
  { name: 'Healthy Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 360, category: 'Nutrition' },
  { name: 'Gym Rack', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 830, category: 'Fitness' },
  { name: 'Dumbbells Set', url: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 450, category: 'Fitness' },
  { name: 'Treadmill Workout', url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 620, category: 'Fitness' },
  { name: 'Group Training', url: 'https://images.unsplash.com/photo-1518611012118-29617b0ccd47?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 890, category: 'Fitness' },
  { name: 'Stretching Routine', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 380, category: 'Fitness' },
  { name: 'Muscle Training', url: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 710, category: 'Fitness' },
  { name: 'Park Workout', url: 'https://images.unsplash.com/photo-1599058917233-3583503c989e?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 540, category: 'Fitness' },
  { name: 'Tea Ceremony Set', url: 'https://images.unsplash.com/photo-1544787210-2827448636b2?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 320, category: 'Zen' },
  { name: 'Zen Waterfall', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 810, category: 'Zen' },
  { name: 'Meditation Space', url: 'https://images.unsplash.com/photo-1518191775389-4d69016b3a0a?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 670, category: 'Zen' },
  { name: 'Incense Zen', url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 290, category: 'Zen' },
  { name: 'Tokyo Street Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 980, category: 'Manga' },
  { name: 'Sakura Blossoms', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 640, category: 'Manga' },
  { name: 'Ramen Art', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 420, category: 'Manga' },
  { name: 'Japan Train', url: 'https://images.unsplash.com/photo-1532188978303-4bfac2421d34?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 850, category: 'Manga' },
  { name: 'Fruit Selection', url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 830, category: 'Nutrition' },
  { name: 'Healthy Meal Prep', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 720, category: 'Nutrition' },
  { name: 'Hydration Bottle', url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 240, category: 'Nutrition' },
  { name: 'Mixed Nuts', url: 'https://images.unsplash.com/photo-1511145514263-0220a14a920e?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 360, category: 'Nutrition' },
  { name: 'Salmon Dinner', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 590, category: 'Nutrition' },
  { name: 'Stopwatch Detail', url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 210, category: 'Coaching' },
  { name: 'Coaching Plan', url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 340, category: 'Coaching' },
  { name: 'Team High Five', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1200', type: 'image/jpeg', size: 1024 * 610, category: 'Coaching' }
];
