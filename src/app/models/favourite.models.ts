export interface FavouriteItem {
  id: number;
  destinationId?: number;
  itemType: string;
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
}
