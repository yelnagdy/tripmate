export interface TripFilter {
  maxPrice: number | null;    // null = no limit
  onlyPromotional: boolean;
  onlyFavorites: boolean;
}

export interface Language {
  code: string;
  label: string;
}

export interface PromoDeal {
  id: number;
  title: string;
  description: string;
  ctaLabel: string;
  backgroundImage: string;
}

export interface Trip {
  id: number;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  badgeColor?: 'teal' | 'orange' | 'blue';
  image: string;
  isFavorite: boolean;
  isPromotional?: boolean;
  endsAt?: Date;
}

export interface AppFeature {
  id: number;
  title: string;
  description: string;
  icon: string;       // Font Awesome class e.g. "fas fa-paper-plane"
  cardBg: string;     // CSS color string
  image?: string;     // optional decorative photo
}

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  icon: string;       // Font Awesome class
  iconBg: string;     // CSS color for icon circle background
}

export interface Testimonial {
  id: number;
  name: string;
  role?: string;
  avatar: string;     // image path
  rating: number;     // 1–5
  text: string;
}

export interface Article {
  id: number;
  category: string;
  categoryColor: 'teal' | 'orange' | 'blue';
  date: string;
  readTime: string;
  comments: number;
  title: string;
  image: string;
  author: { name: string; avatar: string; };
}
