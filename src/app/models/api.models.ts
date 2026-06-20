/* ── Generic wrappers ────────────────────────────────────── */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface ApiSingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ══════════════════════════════════════════════════════════
   AUTH  — /api/auth/*
══════════════════════════════════════════════════════════ */
export interface RegisterRequest {
  name:     string | null;
  email:    string | null;
  password: string | null;
  tel:      string | null;
}

export interface LoginRequest {
  email:    string;  // required, minLength: 1
  password: string;  // required, minLength: 6
}

export interface LogoutRequest {
  refreshToken: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string | null;
}

export interface ForgotPasswordRequest {
  email: string | null;
}

export interface ResetPasswordRequest {
  email:       string | null;
  otp:         string | null;
  newPassword: string | null;
}

export interface VerifyOtpRequest {
  email: string | null;
  otp:   string | null;
}

export interface AuthTokenResponse {
  token:        string;
  refreshToken: string;
  userId:       number;
  expiresAt?:   string;
}

/* ══════════════════════════════════════════════════════════
   USERS  — /api/users/*
══════════════════════════════════════════════════════════ */
export interface UpdateUserProfileRequest {
  fullName:          string | null;
  phone:             string | null;
  profileImageUrl:   string | null;
  preferredLanguage: string | null;
  preferredCurrency: string | null;
}

export interface UpdateUserPreferenceRequest {
  preferredTripTypeId: number | null;
  minBudget:           number | null;
  maxBudget:           number | null;
  preferredSeason:     string | null;
  preferredAirlines:   string | null;
}

export interface ApiUserProfile {
  userId:            number;
  fullName:          string;
  email:             string;
  phone:             string | null;
  profileImageUrl:   string | null;
  preferredLanguage: string | null;
  preferredCurrency: string | null;
  preferredTripType: string | null;
  minBudget:         number | null;
  maxBudget:         number | null;
  preferredSeason:   string | null;
  totalFavorites:    number;
  totalBookings:     number;
}

export interface ApiRecentItem {
  id:          number;
  name:        string;
  country:     string;
  city:        string | null;
  description: string | null;
  imageUrl:    string | null;
  price:       number;
  durationDays: number | null;
  activities:  string | null;
  rating:      number;
}

/* ══════════════════════════════════════════════════════════
   DESTINATIONS  — /api/destinations/*
══════════════════════════════════════════════════════════ */
export interface ApiDestination {
  id:          number;
  name:        string;
  country:     string;
  city:        string;
  airportCode: string;
  description: string;
  imageUrl:    string;
  price:       number;
  durationDays: number;
  itinerary:   string;
  activities:  string;
  rating:      number;
}

export interface CreateDestinationRequest {
  name:        string | null;
  country:     string | null;
  description: string | null;
  imageUrl:    string | null;
  price:       number;
  durationDays: number;
  itinerary:   string | null;
  activities:  string | null;
  categoryId:  number;
}

/** @deprecated  Use CreateDestinationRequest */
export type ApiDestinationCreateRequest = CreateDestinationRequest;

/* ══════════════════════════════════════════════════════════
   CATEGORIES  — /api/Categories
══════════════════════════════════════════════════════════ */
export interface ApiCategory {
  id:   number;
  name: string;
}

export interface CreateCategoryRequest {
  name: string | null;
}

export interface ApiCategoryCreateResponse {
  message:    string;
  categoryId: number;
}

/* ══════════════════════════════════════════════════════════
   PACKAGES  — /api/packages/*
══════════════════════════════════════════════════════════ */
export interface ApiPackage {
  id:          number;
  title:       string;
  description: string;
  price:       number;
  durationDays: number;
  imageUrl:    string;
  startDate:   string;
  endDate:     string;
  maxGuests?:  number | null;
}

export interface CreatePackageRequest {
  destinationId: number;
  title:         string | null;
  description:   string | null;
  price:         number;
  durationDays:  number;
  imageUrl:      string | null;
  startDate:     string;
  endDate:       string;
  maxGuests:     number;
}

export interface UpdatePackageRequest {
  destinationId: number;
  title:         string | null;
  description:   string | null;
  price:         number;
  durationDays:  number;
  imageUrl:      string | null;
  startDate:     string;
  endDate:       string;
  maxGuests:     number;
}

/** @deprecated  Use CreatePackageRequest */
export type ApiPackageCreateRequest = CreatePackageRequest;

export interface ApiPackageCreateResponse {
  packageId: number;
}

export interface ApiExternalPackage {
  destination:  ApiDestination;
  hotels:       ApiHotel[];
  flights:      ApiFlightResult[];
  id:           number;
  title:        string | null;
  price:        number;
  durationDays: number;
  imageUrl:     string | null;
}

export interface ApiExternalPackageResponse {
  success: boolean;
  message: string;
  data:    ApiExternalPackage;
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

/* ══════════════════════════════════════════════════════════
   BOOKINGS  — /api/Bookings/*
══════════════════════════════════════════════════════════ */
export interface CreateBookingRequest {
  destinationId:  number;
  numberOfPeople: number;
}

/** @deprecated  Use CreateBookingRequest */
export type ApiBookingCreateRequest = CreateBookingRequest;

export interface BookingItemRequest {
  itemType: string | null;
  itemId:   number;
  price:    number;
}

export interface CreatePaymentRequest {
  userId:    number;
  amount:    number;
  email:     string | null;
  firstName: string | null;
  lastName:  string | null;
  bookingId: number;
  items:     BookingItemRequest[] | null;
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

/* ══════════════════════════════════════════════════════════
   FAVORITES  — /api/favorites/*
══════════════════════════════════════════════════════════ */
export interface ApiFavorite {
  favoriteId: number;
  userId:     number;
  itemId:     number;
  itemType:   string;
  createdAt:  string;
}

/* ══════════════════════════════════════════════════════════
   HOTELS  — /api/hotels
══════════════════════════════════════════════════════════ */
export interface ApiHotel {
  name:   string;
  price:  string;
  rating: number;
}

/* ══════════════════════════════════════════════════════════
   FLIGHTS  — /api/flights
══════════════════════════════════════════════════════════ */
export interface ApiFlightResult {
  from:          string;
  to:            string;
  price:         number;
  airline:       string;
  departureTime: string;
  arrivalTime:   string;
  duration:      string;
}

export interface ApiSmartFlight {
  airline:  string;
  from:     string;
  to:       string;
  price:    string;   // returned as string from API e.g. "388"
  duration: string;   // e.g. "575 min"
}

/* ══════════════════════════════════════════════════════════
   POSTS  — /api/Posts/*
══════════════════════════════════════════════════════════ */
export interface ApiPost {
  postId:      number;
  title:       string;
  location:    string;
  description: string;
  imageUrl:    string;
  rating:      number;
  userId:      number;
}

export interface CreatePostRequest {
  postId?:     number;    // optional — server assigns on create
  title:       string | null;
  location:    string | null;
  description: string | null;
  imageUrl:    string | null;
  rating:      number;
  userId:      number;
}

/** @deprecated  Use CreatePostRequest */
export type ApiPostCreateRequest = CreatePostRequest;

export interface ApiPostCreateResponse {
  message: string;
  postId:  number;
}

/* ══════════════════════════════════════════════════════════
   HOME  — /api/Home
══════════════════════════════════════════════════════════ */
export interface ApiHomeResponse {
  recommended: ApiDestination[];
  popular:     ApiDestination[];
}
