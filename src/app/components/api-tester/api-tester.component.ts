/**
 * ApiTesterComponent
 *
 * Drop this into any route to verify CORS, token flow, and service wiring.
 * Add to app.routes.ts:
 *   { path: 'api-test', component: ApiTesterComponent }
 *
 * Then visit /api-test in the browser.
 */
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DestinationService } from '../../core/services/destination.service';
import { PackageService } from '../../core/services/package.service';
import { BookingService } from '../../core/services/booking.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { RatingService } from '../../core/services/rating.service';

interface TestResult {
  label:   string;
  status:  'idle' | 'loading' | 'pass' | 'fail';
  detail:  string;
}

function result(label: string): TestResult {
  return { label, status: 'idle', detail: '' };
}

@Component({
  selector: 'app-api-tester',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
<div class="at-wrap">
  <h1 class="at-title">TripMate API Integration Tester</h1>
  <p class="at-sub">Run end-to-end checks against the live backend. Results are shown inline.</p>

  <!-- Login credentials -->
  <div class="at-card">
    <h2>Credentials (used for Auth tests)</h2>
    <div class="at-row">
      <label>Email</label>
      <input [(ngModel)]="email" type="email" placeholder="test@example.com" class="at-input" />
    </div>
    <div class="at-row">
      <label>Password</label>
      <input [(ngModel)]="password" type="password" placeholder="••••••" class="at-input" />
    </div>
    <button class="at-btn" (click)="runAll()">▶ Run All Tests</button>
    <button class="at-btn at-btn--outline" (click)="reset()">Reset</button>
  </div>

  <!-- Results table -->
  <div class="at-card">
    <h2>Results</h2>
    <table class="at-table">
      <thead>
        <tr>
          <th>Test</th>
          <th>Status</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        @for (r of results(); track r.label) {
          <tr>
            <td>{{ r.label }}</td>
            <td>
              <span class="at-badge" [ngClass]="'at-badge--' + r.status">
                {{ r.status === 'loading' ? '⏳' : r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '—' }}
                {{ r.status }}
              </span>
            </td>
            <td class="at-detail">{{ r.detail }}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>

  <!-- Token inspector -->
  @if (storedToken()) {
    <div class="at-card">
      <h2>Stored Token (first 60 chars)</h2>
      <code class="at-code">{{ storedToken() }}</code>
      <p class="at-meta">userId decoded from JWT: <strong>{{ resolvedUserId() }}</strong></p>
    </div>
  }
</div>

<style>
.at-wrap { max-width: 860px; margin: 2rem auto; padding: 1rem; font-family: system-ui, sans-serif; }
.at-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.3rem; }
.at-sub   { color: #6b7280; margin: 0 0 1.5rem; }
.at-card  { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
.at-card h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
.at-row   { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
.at-row label { width: 80px; font-size: 0.85rem; color: #374151; }
.at-input { flex: 1; padding: 0.4rem 0.7rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
.at-btn   { padding: 0.5rem 1.25rem; background: #3b5bdb; color: #fff; border: none; border-radius: 7px; font-weight: 600; cursor: pointer; margin-right: 0.5rem; margin-top: 0.5rem; }
.at-btn--outline { background: transparent; color: #3b5bdb; border: 1.5px solid #3b5bdb; }
.at-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.at-table th { text-align: left; padding: 0.5rem; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
.at-table td { padding: 0.5rem; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.at-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.at-badge--idle    { background: #f3f4f6; color: #6b7280; }
.at-badge--loading { background: #fef9c3; color: #854d0e; }
.at-badge--pass    { background: #dcfce7; color: #15803d; }
.at-badge--fail    { background: #fee2e2; color: #b91c1c; }
.at-detail { color: #6b7280; word-break: break-all; max-width: 380px; }
.at-code { display: block; background: #f1f5f9; padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; word-break: break-all; margin-bottom: 0.5rem; }
.at-meta { font-size: 0.85rem; color: #374151; margin: 0; }
</style>
`,
})
export class ApiTesterComponent implements OnInit {

  private readonly authService        = inject(AuthService);
  private readonly destinationService = inject(DestinationService);
  private readonly packageService     = inject(PackageService);
  private readonly bookingService     = inject(BookingService);
  private readonly favoritesService   = inject(FavoritesService);
  private readonly ratingService      = inject(RatingService);

  email    = 'test@example.com';
  password = 'password123';

  readonly storedToken    = signal('');
  readonly resolvedUserId = signal(0);

  readonly results = signal<TestResult[]>([
    result('POST /api/auth/login'),
    result('GET  /api/destinations?page=1&pageSize=5'),
    result('GET  /api/packages'),
    result('GET  /api/users/profile (requires auth)'),
    result('GET  /api/Bookings/{userId} (requires auth)'),
    result('GET  /api/favorites/{userId} (requires auth)'),
    result('GET  /api/ratings/average?itemId=1&itemType=destination'),
    result('GET  /api/packages/external?from=CAI&to=DXB'),
  ]);

  ngOnInit(): void {
    this.refreshToken();
  }

  private refreshToken(): void {
    const t = localStorage.getItem('token') ?? '';
    this.storedToken.set(t ? t.slice(0, 60) + '…' : '');
    this.resolvedUserId.set(this.authService.getUserId());
  }

  private setStatus(index: number, status: TestResult['status'], detail: string): void {
    this.results.update(rs =>
      rs.map((r, i) => i === index ? { ...r, status, detail } : r)
    );
  }

  reset(): void {
    this.results.update(rs => rs.map(r => ({ ...r, status: 'idle', detail: '' })));
  }

  runAll(): void {
    this.reset();
    this.testLogin()
      .then(() => this.testDestinations())
      .then(() => this.testPackages())
      .then(() => this.testProfile())
      .then(() => this.testBookings())
      .then(() => this.testFavorites())
      .then(() => this.testRatingAverage())
      .then(() => this.testExternalPackages());
  }

  /* ── Individual tests ─────────────────────────────────── */

  private testLogin(): Promise<void> {
    this.setStatus(0, 'loading', 'Calling POST /api/auth/login…');
    return new Promise(resolve => {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: res => {
          const token = (res as any)?.data?.token ?? (res as any)?.token;
          if (token) {
            localStorage.setItem('token', token);
            const refresh = (res as any)?.data?.refreshToken ?? (res as any)?.refreshToken;
            if (refresh) localStorage.setItem('refreshToken', refresh);
            this.refreshToken();
            this.setStatus(0, 'pass', `Token received (${token.length} chars). userId=${this.authService.getUserId()}`);
          } else {
            this.setStatus(0, 'fail', 'Login succeeded but no token in response: ' + JSON.stringify(res).slice(0, 120));
          }
          resolve();
        },
        error: err => {
          this.setStatus(0, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testDestinations(): Promise<void> {
    this.setStatus(1, 'loading', 'Fetching…');
    return new Promise(resolve => {
      this.destinationService.getAll(1, 5).subscribe({
        next: list => {
          this.setStatus(1, 'pass', `Received ${list.length} destinations. First: "${list[0]?.name ?? 'none'}"`);
          resolve();
        },
        error: err => {
          this.setStatus(1, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testPackages(): Promise<void> {
    this.setStatus(2, 'loading', 'Fetching…');
    return new Promise(resolve => {
      this.packageService.getAll().subscribe({
        next: list => {
          this.setStatus(2, 'pass', `Received ${list.length} packages. First: "${list[0]?.title ?? 'none'}"`);
          resolve();
        },
        error: err => {
          this.setStatus(2, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testProfile(): Promise<void> {
    this.setStatus(3, 'loading', 'Fetching…');
    return new Promise(resolve => {
      const userId = this.authService.getUserId();
      if (!userId) {
        this.setStatus(3, 'fail', 'No userId in JWT — run Login test first.');
        resolve();
        return;
      }
      this.authService.getProfile(userId).subscribe({
        next: profile => {
          this.setStatus(3, 'pass', `Profile: ${profile.fullName} | ${profile.email} | favs=${profile.totalFavorites} bookings=${profile.totalBookings}`);
          resolve();
        },
        error: err => {
          this.setStatus(3, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testBookings(): Promise<void> {
    this.setStatus(4, 'loading', 'Fetching…');
    return new Promise(resolve => {
      const userId = this.authService.getUserId();
      if (!userId) {
        this.setStatus(4, 'fail', 'No userId in JWT — run Login test first.');
        resolve();
        return;
      }
      this.bookingService.getByUser(userId).subscribe({
        next: list => {
          this.setStatus(4, 'pass', `${list.length} bookings found.${list[0] ? ' Last: ' + (list[0].packageName ?? list[0].destinationName ?? list[0].bookingType) : ''}`);
          resolve();
        },
        error: err => {
          this.setStatus(4, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testFavorites(): Promise<void> {
    this.setStatus(5, 'loading', 'Fetching…');
    return new Promise(resolve => {
      this.favoritesService.getAll().subscribe({
        next: list => {
          this.setStatus(5, 'pass', `${list.length} favorites found. Types: ${[...new Set(list.map(f => f.itemType))].join(', ') || 'none'}`);
          resolve();
        },
        error: err => {
          this.setStatus(5, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testRatingAverage(): Promise<void> {
    this.setStatus(6, 'loading', 'Fetching…');
    return new Promise(resolve => {
      this.ratingService.getAverage(1, 'destination').subscribe({
        next: avg => {
          this.setStatus(6, 'pass', `Average rating for destination #1 = ${avg}`);
          resolve();
        },
        error: err => {
          this.setStatus(6, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }

  private testExternalPackages(): Promise<void> {
    this.setStatus(7, 'loading', 'Fetching…');
    return new Promise(resolve => {
      this.packageService.getExternal('CAI', 'DXB').subscribe({
        next: pkg => {
          if (pkg) {
            this.setStatus(7, 'pass', `External package: "${pkg.title ?? 'unnamed'}" $${pkg.price}, ${pkg.hotels.length} hotels, ${pkg.flights.length} flights`);
          } else {
            this.setStatus(7, 'fail', 'No data returned (null)');
          }
          resolve();
        },
        error: err => {
          this.setStatus(7, 'fail', `HTTP ${err.status}: ${err.message}`);
          resolve();
        },
      });
    });
  }
}
