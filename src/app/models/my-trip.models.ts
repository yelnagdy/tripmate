export interface TripPackage {
  id: number;
  name: string;
  location: string;
  image: string;
  imageCount: number;
  hotelStars: number;
  amenities: number;
  reviewScore: number;
  reviewLabel: string;
  reviewCount: number;
  pricePerNight: number;
  isFavorite: boolean;
}

export interface Flight {
  id: number;
  onTimePercent: number;
  departureTime: string;
  departureCity: string;
  arrivalTime: string;
  arrivalCity: string;
  duration: string;
  pricePerPerson: number;
}

export interface Hotel {
  id: number;
  name: string;
  image: string;
  pricePerNight: number;
}
