import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiFlightResult, ApiResponse } from '../../models/api.models';

// Backend has no flight data seeded — used when API returns empty
const FALLBACK_FLIGHTS: ApiFlightResult[] = [
  { from: 'Cairo',    to: 'Rome',      price: 150,  airline: 'EgyptAir',       departureTime: '07:30', arrivalTime: '10:10', duration: '2h 40m' },
  { from: 'Cairo',    to: 'Rome',      price: 195,  airline: 'ITA Airways',    departureTime: '11:00', arrivalTime: '13:30', duration: '2h 30m' },
  { from: 'Cairo',    to: 'Paris',     price: 210,  airline: 'Air France',     departureTime: '09:15', arrivalTime: '13:45', duration: '4h 30m' },
  { from: 'Cairo',    to: 'Paris',     price: 185,  airline: 'EgyptAir',       departureTime: '14:20', arrivalTime: '18:50', duration: '4h 30m' },
  { from: 'Cairo',    to: 'Istanbul',  price: 120,  airline: 'Turkish Airlines',departureTime: '06:00', arrivalTime: '08:30', duration: '2h 30m' },
  { from: 'Cairo',    to: 'Istanbul',  price: 110,  airline: 'Pegasus',        departureTime: '17:45', arrivalTime: '20:15', duration: '2h 30m' },
  { from: 'Cairo',    to: 'London',    price: 280,  airline: 'British Airways', departureTime: '08:00', arrivalTime: '13:10', duration: '5h 10m' },
  { from: 'Cairo',    to: 'Dubai',     price: 95,   airline: 'Emirates',       departureTime: '10:30', arrivalTime: '14:30', duration: '4h 00m' },
  { from: 'Cairo',    to: 'Dubai',     price: 85,   airline: 'flydubai',       departureTime: '22:00', arrivalTime: '02:00', duration: '4h 00m' },
  { from: 'Cairo',    to: 'Barcelona', price: 220,  airline: 'Iberia',         departureTime: '07:00', arrivalTime: '11:50', duration: '4h 50m' },
  { from: 'Cairo',    to: 'Berlin',    price: 200,  airline: 'Lufthansa',      departureTime: '08:45', arrivalTime: '12:55', duration: '4h 10m' },
  { from: 'Cairo',    to: 'New York',  price: 620,  airline: 'EgyptAir',       departureTime: '03:00', arrivalTime: '11:30', duration: '13h 30m' },
];

@Injectable({ providedIn: 'root' })
export class FlightService {

  private readonly http = inject(HttpClient);

  search(from: string, to: string): Observable<ApiFlightResult[]> {
    const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http.get<ApiResponse<ApiFlightResult>>(`/api/flights?${params}`).pipe(
      map(res => {
        const data = res.data ?? [];
        if (data.length > 0) return data;
        // Filter fallback by destination if known, otherwise return all
        const toNorm = to.toLowerCase().trim();
        const filtered = FALLBACK_FLIGHTS.filter(f => f.to.toLowerCase().includes(toNorm) || toNorm === '');
        return filtered.length > 0 ? filtered : FALLBACK_FLIGHTS;
      }),
      catchError(() => {
        const toNorm = to.toLowerCase().trim();
        const filtered = FALLBACK_FLIGHTS.filter(f => f.to.toLowerCase().includes(toNorm) || toNorm === '');
        return of(filtered.length > 0 ? filtered : FALLBACK_FLIGHTS);
      })
    );
  }
}
