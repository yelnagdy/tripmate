import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiRecentItem {
  id: number;
  name: string;
  country: string;
  city: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  durationDays: number | null;
  activities: string | null;
  rating: number;
}

export interface ApiUserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  preferredLanguage: string | null;
  preferredCurrency: string | null;
  preferredTripType: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  preferredSeason: string | null;
  totalFavorites: number;
  totalBookings: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _httpClient: HttpClient) { }

  RegisterUser(userdata: object): Observable<any> {
    return this._httpClient.post('/api/auth/register', userdata);
  }

  loginuser(userdata: object): Observable<any> {
    return this._httpClient.post('/api/auth/login', userdata);
  }

  getMyProfile(): Observable<ApiUserProfile> {
    return this._httpClient.get<ApiUserProfile>('/api/users/profile');
  }

  getProfile(userId: number): Observable<ApiUserProfile> {
    return this._httpClient.get<ApiUserProfile>(`/api/users/profile/${userId}`);
  }

  updatePreferences(userId: number, body: {
    preferredTripTypeId: number | null;
    minBudget: number | null;
    maxBudget: number | null;
    preferredSeason: string;
    preferredAirlines: string;
  }): Observable<string> {
    return this._httpClient.put(`/api/users/preferences/${userId}`, body, { responseType: 'text' });
  }

  updateProfile(userId: number, body: {
    fullName: string;
    phone: string;
    profileImageUrl: string;
    preferredLanguage: string;
    preferredCurrency: string;
  }): Observable<string> {
    return this._httpClient.put(`/api/users/profile/${userId}`, body, { responseType: 'text' });
  }

  getRecentActivity(userId: number): Observable<ApiRecentItem[]> {
    return this._httpClient.get<ApiRecentItem[]>(`/api/users/recent/${userId}`);
  }

  getUserId(): number {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }
}
