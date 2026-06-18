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
  maxGuests?: number | null;
}

export interface ApiPackageCreateRequest {
  destinationId: number;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  imageUrl: string;
  startDate: string;
  endDate: string;
  maxGuests: number;
}

export interface ApiPackageCreateResponse {
  packageId: number;
}

export interface ApiExternalPackage {
  destination: ApiDestination;
  hotels:      ApiHotel[];
  flights:     ApiFlightResult[];
  id:          number;
  title:       string | null;
  price:       number;
  durationDays: number;
  imageUrl:    string | null;
}

export interface ApiExternalPackageResponse {
  success: boolean;
  message: string;
  data:    ApiExternalPackage;
}

export interface ApiCategory {
  id:   number;
  name: string;
}

export interface ApiBookingCreateRequest {
  destinationId:  number;
  numberOfPeople: number;
}

export interface ApiBooking {
  id:              number;
  userId:          number;
  destinationId:   number;
  bookingDate:     string;
  numberOfPeople:  number;
  status:          string;
  bookingNumber:   string;
  bookingType:     string;
  totalPrice:      number;
  currency:        string;
  paymentStatus:   string;
  destinationName: string | null;
  packageName:     string | null;
}

export interface ApiBookingDetails {
  bookingId:     number;
  userId:        number;
  packageId?:    number;
  packageTitle?: string;
  destination?:  string;
  startDate?:    string;
  endDate?:      string;
  guests?:       number;
  totalPrice?:   number;
  status?:       string;
}

export interface ApiPost {
  postId:      number;
  title:       string;
  location:    string;
  description: string;
  imageUrl:    string;
  rating:      number;
  userId:      number;
}

export interface ApiPostCreateRequest {
  title:       string;
  location:    string;
  description: string;
  imageUrl:    string;
  rating:      number;
  userId:      number;
}

export interface ApiPostCreateResponse {
  message: string;
  postId:  number;
}

export interface ApiCategoryCreateResponse {
  message:    string;
  categoryId: number;
}

export interface ApiDestinationCreateRequest {
  name:        string;
  country:     string;
  description: string;
  imageUrl:    string;
  price:       number;
  durationDays: number;
  itinerary:   string;
  activities:  string;
  categoryId:  number;
}

export interface ApiFavorite {
  favoriteId: number;
  userId:     number;
  itemId:     number;
  itemType:   string;
  createdAt:  string;
}

export interface ApiHomeResponse {
  recommended: ApiDestination[];
  popular:     ApiDestination[];
}

export interface ApiSmartFlight {
  airline:  string;
  from:     string;
  to:       string;
  price:    string;   // e.g. "388" — string, not number
  duration: string;   // e.g. "575 min"
}

export interface ApiSmartPackage {
  destination:  ApiDestination;
  hotels:       ApiHotel[];
  flights:      ApiSmartFlight[];
  id:           number;
  title:        string | null;
  price:        number;
  durationDays: number;
  imageUrl:     string | null;
}
