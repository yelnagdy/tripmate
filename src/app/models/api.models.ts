export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface ApiDestination {
  id: number;
  name: string;
  country: string;
  city: string;
  airportCode: string;
  description: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  itinerary: string;
  activities: string;
  rating: number;
}

export interface ApiHotel {
  name: string;
  price: string;
  rating: number;
}

export interface ApiFlightResult {
  from: string;
  to: string;
  price: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export interface ApiPackage {
  id: number;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  imageUrl: string;
  startDate: string;
  endDate: string;
  maxGuests: number;
}
