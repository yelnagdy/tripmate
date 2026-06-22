import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService, ApiRecentItem } from '../../core/services/auth.service';
import { PostService, PostResult } from '../../core/services/post.service';
import { UserStatsService } from '../../core/services/user-stats.service';
import { NavigationService } from '../../core/services/navigation.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { BookingService } from '../../core/services/booking.service';
import { ApiPost } from '../../models/api.models';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../core/utils/safe-url.pipe';

interface PostDraft {
  title: string;
  location: string;
  story: string;
  rating: number;
  savedAt: string;
}

type View = 'profile' | 'add-post' | 'my-posts';

interface ProfileDraft {
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  language: string;
  tripType: string;
  minBudget: string;
  maxBudget: string;
  season: string;
  avatar: string;
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, SafeUrlPipe],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit, OnDestroy {

  private readonly authService      = inject(AuthService);
  private readonly postService      = inject(PostService);
  private readonly navService       = inject(NavigationService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly recentlyViewed   = inject(RecentlyViewedService);
  private readonly bookingService   = inject(BookingService);
  private readonly router           = inject(Router);
  readonly userStats                = inject(UserStatsService);

  /* ── Online / offline detection ─────────────────────────── */
  readonly isOnline = signal(navigator.onLine);

  private readonly onOnline  = () => this.isOnline.set(true);
  private readonly onOffline = () => this.isOnline.set(false);

  /* ── View state ─────────────────────────────────────────── */
  readonly activeView = signal<View>('profile');

  setView(v: View): void {
    this.editingPost.set(null);
    this.activeView.set(v);
    if (v === 'my-posts') this.loadMyPosts();
    if (v === 'add-post') { this.resetPostForm(); this.checkForDraft(); }
  }

  /* ── Local draft persistence ─────────────────────────────── */
  private readonly DRAFT_KEY   = 'tripmate_post_draft';
  private readonly AVATAR_KEY  = 'tripmate_avatar';

  readonly hasPendingDraft  = signal(false);
  readonly draftSavedAt     = signal('');

  checkForDraft(): void {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) { this.hasPendingDraft.set(false); return; }
      const d: PostDraft = JSON.parse(raw);
      this.hasPendingDraft.set(true);
      this.draftSavedAt.set(d.savedAt
        ? new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '');
    } catch { this.hasPendingDraft.set(false); }
  }

  restoreDraft(): void {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return;
      const d: PostDraft = JSON.parse(raw);
      this.postTitle.set(d.title    || '');
      this.postLocation.set(d.location || '');
      this.postStory.set(d.story    || '');
      this.selectedRating.set(d.rating  || 3);
    } catch {}
    this.clearDraft();
  }

  clearDraft(): void {
    try { localStorage.removeItem(this.DRAFT_KEY); } catch {}
    this.hasPendingDraft.set(false);
    this.draftSavedAt.set('');
  }

  private saveDraftLocally(): void {
    // Don't save a blank form
    if (!this.postTitle().trim() && !this.postStory().trim()) return;
    const draft: PostDraft = {
      title:    this.postTitle().trim(),
      location: this.postLocation().trim(),
      story:    this.postStory().trim(),
      rating:   this.selectedRating(),
      savedAt:  new Date().toISOString(),
    };
    try { localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft)); } catch {}
  }

  /* ── Loading ────────────────────────────────────────────── */
  readonly loading = signal(true);

  /* ── User profile ───────────────────────────────────────── */
  readonly profile = signal({
    name:     '',
    email:    '',
    phone:    '',
    joinDate: '',
    avatar:   'assets/images/profile-avatar.jpeg',
  });

  readonly preferences = signal({
    country:    '',
    currency:   '',
    language:   '',
    tripType:   '',
    minBudget:  '',
    maxBudget:  '',
    season:     '',
    airlines:   '',
  });

  // stats now live in UserStatsService — see userStats.totalFavorites / totalBookings
  private readonly _apiRecentItems = signal<ApiRecentItem[]>([]);

  /** Local items (localStorage) shown immediately; API items fill in when local is empty. Always last 3. */
  readonly recentItems = computed<ApiRecentItem[]>(() => {
    const local = this.recentlyViewed.items();
    const source = local.length > 0 ? local : this._apiRecentItems();
    return source.slice(0, 3);
  });

  viewRecentItem(item: ApiRecentItem): void {
    const safeCity    = (item.city    && item.city    !== 'null') ? item.city.trim()    : '';
    const safeCountry = (item.country && item.country !== 'null') ? item.country.trim() : '';
    this.navService.goToDestination({
      destinationId: item.id,
      name:          item.name,
      image:         item.imageUrl ?? '',
      pricePerNight: item.price,
      location:      safeCity ? `${safeCity}, ${safeCountry}` : (safeCountry || 'Unknown'),
    });
  }

  /* ── Profile edit ───────────────────────────────────────── */
  readonly isEditing   = signal(false);
  readonly saving      = signal(false);
  readonly saveError   = signal('');
  readonly saveSuccess = signal(false);
  private saveSuccessTimer?: ReturnType<typeof setTimeout>;

  /* ── Delete account ─────────────────────────────────────── */
  readonly deleteConfirmOpen  = signal(false);
  readonly deleteInProgress   = signal(false);
  readonly deleteError        = signal('');

  openDeleteConfirm(): void  { this.deleteConfirmOpen.set(true);  this.deleteError.set(''); }
  closeDeleteConfirm(): void { this.deleteConfirmOpen.set(false); }

  confirmDeleteAccount(): void {
    this.deleteInProgress.set(true);
    this.deleteError.set('');

    this.authService.deleteAccount().subscribe(ok => {
      if (!ok) {
        this.deleteInProgress.set(false);
        this.deleteError.set('Could not delete account — please try again.');
        return;
      }
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem(this.AVATAR_KEY);
      this.favoritesService.clearStorage();
      this.recentlyViewed.clear();
      this.router.navigate(['/auth/login']);
    });
  }

  readonly draft = signal<ProfileDraft>({
    name: '', email: '', phone: '', country: '', currency: '',
    language: '', tripType: '', minBudget: '', maxBudget: '', season: '', avatar: '',
  });

  /* ── Preferences edit ───────────────────────────────────── */
  readonly isEditingPrefs   = signal(false);
  readonly savingPrefs      = signal(false);
  readonly savePrefsError   = signal('');
  readonly savePrefsSuccess = signal(false);
  private savePrefsTimer?: ReturnType<typeof setTimeout>;

  readonly prefsDraft = signal({
    season:    '',
    minBudget: '',
    maxBudget: '',
    airlines:  '',
  });

  enterEditPrefs(): void {
    const pref = this.preferences();
    this.prefsDraft.set({
      season:    pref.season,
      minBudget: pref.minBudget,
      maxBudget: pref.maxBudget,
      airlines:  pref.airlines,
    });
    this.savePrefsError.set('');
    this.isEditingPrefs.set(true);
  }

  cancelEditPrefs(): void { this.isEditingPrefs.set(false); }

  setPrefsDraft(key: keyof { season: string; minBudget: string; maxBudget: string; airlines: string }, value: string): void {
    this.prefsDraft.update(d => ({ ...d, [key]: value }));
  }

  savePreferences(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const d = this.prefsDraft();
    this.savingPrefs.set(true);
    this.savePrefsError.set('');

    const minBudget = d.minBudget ? parseFloat(d.minBudget) : null;
    const maxBudget = d.maxBudget ? parseFloat(d.maxBudget) : null;

    this.authService.updatePreferences(userId, {
      preferredTripTypeId: null,
      minBudget,
      maxBudget,
      preferredSeason:   d.season.trim(),
      preferredAirlines: d.airlines.trim(),
    }).pipe(
      catchError(() => of(null))
    ).subscribe(result => {
      this.savingPrefs.set(false);
      if (result !== null && !result.toLowerCase().includes('failed')) {
        this.preferences.update(p => ({
          ...p,
          season:    d.season.trim()    || p.season,
          minBudget: d.minBudget.trim() || p.minBudget,
          maxBudget: d.maxBudget.trim() || p.maxBudget,
          airlines:  d.airlines.trim()  || p.airlines,
        }));
        this.isEditingPrefs.set(false);
        this.savePrefsSuccess.set(true);
        clearTimeout(this.savePrefsTimer);
        this.savePrefsTimer = setTimeout(() => this.savePrefsSuccess.set(false), 3000);
      } else {
        this.savePrefsError.set('Could not save preferences. Please try again.');
      }
    });
  }

  ngOnInit(): void {
    window.addEventListener('online',  this.onOnline);
    window.addEventListener('offline', this.onOffline);

    const userId = this.authService.getUserId();
    if (!userId) { this.loading.set(false); return; }

    forkJoin({
      profile: this.authService.getMyProfile().pipe(catchError(() => of(null))),
      recent:  this.authService.getRecentActivity(userId).pipe(catchError(() => of([] as ApiRecentItem[]))),
    }).subscribe(({ profile: p, recent }) => {
      if (p) {
        const cachedAvatar = localStorage.getItem(this.AVATAR_KEY);
        this.profile.set({
          name:     p.fullName  || '',
          email:    p.email     || '',
          phone:    p.phone     || '',
          joinDate: '',
          avatar:   cachedAvatar || p.profileImageUrl || 'assets/images/profile-avatar.jpeg',
        });
        this.preferences.set({
          country:   '',
          currency:  p.preferredCurrency || '',
          language:  p.preferredLanguage || '',
          tripType:  p.preferredTripType || '',
          minBudget: p.minBudget != null ? String(p.minBudget) : '',
          maxBudget: p.maxBudget != null ? String(p.maxBudget) : '',
          season:    p.preferredSeason   || '',
          airlines:  '',
        });
        // Take the higher value: API might return 0/null while the session already has
        // incremented the signal from add/remove actions earlier in the session.
        this.userStats.setStats(
          Math.max(p.totalFavorites ?? 0, this.userStats.totalFavorites()),
          Math.max(p.totalBookings  ?? 0, this.userStats.totalBookings()),
        );
        // Always count local bookings — the API may return 0 if the backend
        // hasn't persisted them yet, but localStorage is authoritative locally.
        this.userStats.seedBookings(this.bookingService.localBookings().length);
      }
      this._apiRecentItems.set(Array.isArray(recent) ? recent : []);
      this.loading.set(false);
    });
  }

  enterEdit(): void {
    const p    = this.profile();
    const pref = this.preferences();
    this.draft.set({
      name:      p.name,
      email:     p.email,
      phone:     p.phone,
      avatar:    p.avatar,
      country:   pref.country,
      currency:  pref.currency,
      language:  pref.language,
      tripType:  pref.tripType,
      minBudget: pref.minBudget,
      maxBudget: pref.maxBudget,
      season:    pref.season,
    });
    this.isEditing.set(true);
  }

  saveProfile(): void {
    const d      = this.draft();
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.saving.set(true);
    this.saveError.set('');

    // Always persist the avatar locally so it survives page refresh.
    // The API only accepts URLs (not base64), so we strip data URIs from the
    // API payload but keep them in localStorage for client-side display.
    const isBase64 = d.avatar.startsWith('data:');
    if (d.avatar && d.avatar !== 'assets/images/profile-avatar.jpeg') {
      localStorage.setItem(this.AVATAR_KEY, d.avatar);
    }
    const imageUrl = isBase64 ? '' : d.avatar;

    this.authService.updateProfile(userId, {
      fullName:          d.name.trim()     || this.profile().name,
      phone:             d.phone.trim(),
      profileImageUrl:   imageUrl,
      preferredLanguage: d.language.trim(),
      preferredCurrency: d.currency.trim(),
    }).pipe(
      catchError(() => of(null))
    ).subscribe(result => {
      this.saving.set(false);
      if (result !== null) {
        this.profile.update(p => ({
          ...p,
          name:   d.name.trim()  || p.name,
          phone:  d.phone.trim(),
          avatar: d.avatar,
        }));
        this.preferences.update(pref => ({
          ...pref,
          currency: d.currency.trim() || pref.currency,
          language: d.language.trim() || pref.language,
        }));
        this.isEditing.set(false);
        this.saveSuccess.set(true);
        clearTimeout(this.saveSuccessTimer);
        this.saveSuccessTimer = setTimeout(() => this.saveSuccess.set(false), 3000);
      } else {
        this.saveError.set('Could not save profile. Please try again.');
      }
    });
  }

  cancelEdit(): void { this.isEditing.set(false); }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.draft.update(d => ({ ...d, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  }

  setDraft<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]): void {
    this.draft.update(d => ({ ...d, [key]: value }));
  }

  /* ── Add Post / Edit Post form ──────────────────────────── */
  readonly postTitle      = signal('');
  readonly postLocation   = signal('');
  readonly postStory      = signal('');
  readonly previewUrl     = signal<string | null>(null);
  readonly selectedRating = signal(3);
  readonly hoveredRating  = signal(0);
  readonly postSubmitting = signal(false);
  readonly postError      = signal('');
  readonly postSuccess    = signal(false);

  /** Non-null when editing an existing post */
  readonly editingPost = signal<ApiPost | null>(null);

  readonly isEditMode = computed(() => this.editingPost() !== null);

  readonly stars: number[] = [1, 2, 3, 4, 5];

  readonly activeRating = computed(() => this.hoveredRating() || this.selectedRating());

  setRating(star: number): void { this.selectedRating.set(star); }
  hoverStar(star: number): void { this.hoveredRating.set(star); }
  clearHover(): void            { this.hoveredRating.set(0); }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  startEditPost(post: ApiPost): void {
    this.editingPost.set(post);
    this.postTitle.set(post.title);
    this.postLocation.set(post.location);
    this.postStory.set(post.description);
    this.previewUrl.set(post.imageUrl || null);
    this.selectedRating.set(post.rating || 3);
    this.postError.set('');
    this.postSuccess.set(false);
    this.activeView.set('add-post');
  }

  cancelPostEdit(): void {
    this.editingPost.set(null);
    this.resetPostForm();
    this.activeView.set('my-posts');
  }

  onSubmitPost(): void {
    const title    = this.postTitle().trim();
    const location = this.postLocation().trim();
    const story    = this.postStory().trim();
    const rating   = this.selectedRating();

    if (!title)    { this.postError.set('Title is required.');              return; }
    if (!location) { this.postError.set('Location is required.');           return; }
    if (!story)    { this.postError.set('Story is required.');              return; }
    if (!rating)   { this.postError.set('Please rate your experience.');    return; }

    const userId = this.authService.getUserId();
    if (!userId)   { this.postError.set('Please log in to share a post.'); return; }

    // Guard: if the browser is offline, save locally and bail out early
    if (!this.isOnline()) {
      this.saveDraftLocally();
      this.postError.set('You\'re offline. Your draft has been saved — come back when you\'re connected.');
      return;
    }

    this.postError.set('');

    // Never send base64 data URIs — the API expects a URL string or empty
    const rawImage = this.previewUrl() ?? (this.editingPost()?.imageUrl ?? '');
    const imageUrl = rawImage.startsWith('data:') ? '' : rawImage;

    const body = { title, location, description: story, imageUrl, rating, userId };
    const editing = this.editingPost();

    // Optimistic UI: update immediately so the user isn't blocked on the API
    if (editing) {
      this.myPosts.update(list =>
        list.map(p => p.postId === editing.postId
          ? { ...p, title, location, description: story, imageUrl, rating }
          : p
        )
      );
    } else {
      const optimistic: ApiPost = {
        postId:      -(Date.now()),
        title, location,
        description: story,
        imageUrl,
        rating,
        userId,
      };
      this.myPosts.update(list => [optimistic, ...list]);
    }

    this.editingPost.set(null);
    this.resetPostForm();
    this.activeView.set('my-posts');

    // Background API call — doesn't block the UI
    const req$ = editing
      ? this.postService.update(editing.postId, body)
      : this.postService.create(body);

    req$.subscribe((result: PostResult) => {
      if (result !== null) {
        // API failed — keep draft for retry; post remains visible optimistically this session
        this.saveDraftLocally();
        return;
      }
      this.clearDraft();
      this.syncPostsSilently(userId);
    });
  }

  private resetPostForm(): void {
    this.postTitle.set('');
    this.postLocation.set('');
    this.postStory.set('');
    this.previewUrl.set(null);
    this.selectedRating.set(3);
    this.hoveredRating.set(0);
    this.postError.set('');
    this.postSuccess.set(false);
  }

  /* ── My Posts ───────────────────────────────────────────── */
  readonly myPosts      = signal<ApiPost[]>([]);
  readonly postsLoading = signal(false);
  readonly deletingPostId = signal<number | null>(null);

  loadMyPosts(): void {
    const userId = this.authService.getUserId();
    this.postsLoading.set(true);
    this.postService.getAll().pipe(
      catchError(() => of(null))
    ).subscribe(posts => {
      if (posts !== null) {
        const filtered = this.filterByUser(posts, userId);
        // Only overwrite if we got real results OR the current list is genuinely empty
        if (filtered.length > 0 || this.myPosts().length === 0) {
          this.myPosts.set(filtered);
        }
      }
      this.postsLoading.set(false);
    });
  }

  /** Fetch in background after create/update — never clears existing optimistic data */
  private syncPostsSilently(userId: number): void {
    this.postService.getAll().pipe(
      catchError(() => of(null))
    ).subscribe(posts => {
      if (posts === null) return;
      const filtered = this.filterByUser(posts, userId);
      if (filtered.length > 0) {
        this.myPosts.set(filtered);
      }
      // If server returns empty (write-lag or filter mismatch), keep the optimistic list
    });
  }

  private filterByUser(posts: ApiPost[], userId: number): ApiPost[] {
    if (!userId) return posts;
    const uid = Number(userId);
    const matched = posts.filter(p => Number(p.userId) === uid);
    // Fallback: if strict userId match returns nothing, show all posts
    // (handles cases where the API doesn't require auth and returns a shared pool)
    return matched.length > 0 ? matched : posts;
  }

  confirmDelete(postId: number): void { this.deletingPostId.set(postId); }
  cancelDelete(): void               { this.deletingPostId.set(null); }

  deleteMyPost(postId: number): void {
    const prev = this.myPosts();
    this.myPosts.update(list => list.filter(p => p.postId !== postId));
    this.deletingPostId.set(null);
    this.postService.delete(postId).subscribe(ok => {
      if (!ok) this.myPosts.set(prev);
    });
  }

  starsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online',  this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
