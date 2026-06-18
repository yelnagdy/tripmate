export interface BookingData {
  date: string;
  from: string;
  to: string;
  flight: string;
  pricePerPerson: number;
  destinationId?: number;
  durationDays?: number;
}

export interface Amenity {
  icon: string;
  label: string;
}

export interface DiscoverCard {
  id: number;
  name: string;
  image: string;
}

export interface HotelDetailData {
  id: number;
  name: string;
  type: string;
  heroImage: string;
  sideImages: string[];
  about: string;
  pricePerNight: number;
  amenities: Amenity[];
  discoverCards: DiscoverCard[];
}

export interface IdeaPost {
  id: number;
  image: string;
  authorAvatar: string;
  authorName: string;
  timeAgo: string;
  readTime: string;
  title: string;
  excerpt: string;
}

export interface Review {
  id: number;
  authorAvatar: string;
  authorName: string;
  timeAgo: string;
  rating: number;
  text: string;
}

export interface RatingBar {
  stars: number;
  percentage: number;
}

export interface DestinationDetailData {
  id: number;
  name: string;
  heroImage: string;
  destination: string;
  duration: string;
  bestTrip: string;
  pricePerNight: number;
  ideas: IdeaPost[];
  overallRating: number;
  ratingBars: RatingBar[];
  reviews: Review[];
}
