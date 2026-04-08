export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  kanji: string;
  price?: number;
  duration?: string;
  image: string;
  category?: string;
  featured: boolean;
  order: number;
}

export interface Reservation {
  id: string;
  clientName: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string;
  duration: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  desiredDate: string;
  createdAt: string;
}

export interface LeSaviezVous {
  id: string;
  title: string;
  content: string;
  image?: string;
  active: boolean;
  createdAt: string;
}

export interface Verbatim {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  category?: string;
  storagePath?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AppSettings {
  heroImage?: string;
}
