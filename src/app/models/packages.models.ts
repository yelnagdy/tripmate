export interface Package {
  id: number;
  title: string;
  category: string;
  image: string;
  rating: number;       // 1–5
  reviewCount: number;
  hotelStars: number;   // e.g. 2 or 3
  days: number;
  groupSize: string;    // e.g. "Small Group"
  tags: string[];
  price: number;
  originalPrice?: number;
  isFavorite: boolean;
}
