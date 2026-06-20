import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, Location } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { safeUrl } from '../../core/utils/safe-url';
import { DestinationDetailData, BookingData } from '../../models/detail.models';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { DestinationService } from '../../core/services/destination.service';
import { PostService, PostResult } from '../../core/services/post.service';
import { RatingService } from '../../core/services/rating.service';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, BookingDialogComponent],
  templateUrl: './destination-detail.component.html',
  styleUrl: './destination-detail.component.css',
})
export class DestinationDetailComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly destinationService  = inject(DestinationService);
  private readonly postService         = inject(PostService);
  private readonly ratingService       = inject(RatingService);

  ngOnInit(): void {
    const state = (history.state ?? {}) as {
      destinationId?: number;
      name?: string;
      image?: string;
      pricePerNight?: number;
      location?: string;
    };

    const destinationId = state.destinationId ?? this.destination().id;

    if (destinationId) {
      // Apply quick preview from nav state immediately so the page isn't blank
      if (state.name) {
        this.destination.update(d => ({
          ...d,
          id:            destinationId,
          name:          state.name!,
          heroImage:     safeUrl(state.image, d.heroImage),
          destination:   state.location || d.destination,
          pricePerNight: state.pricePerNight ?? d.pricePerNight,
        }));
      }

      // Then load full details from the API
      this.destinationService.getById(destinationId).subscribe(api => {
        if (!api) return;
        this.destination.update(d => ({
          ...d,
          id:            api.id,
          name:          api.name,
          heroImage:     safeUrl(api.imageUrl, d.heroImage),
          destination:   `${api.country}${api.city ? ' → ' + api.city : ''}`,
          duration:      `${api.durationDays} days`,
          pricePerNight: api.price,
          overallRating: api.rating || d.overallRating,
        }));
      });

      const userId = this.getUserId();
      if (userId) {
        this.destinationService.recordView(destinationId, userId).subscribe();
      }
    }

    this.loadPosts();

    // Pre-fill the star rating if the user has already rated this destination
    const destId = state.destinationId ?? this.destination().id;
    if (destId) {
      this.ratingService.getUserRating(destId, 'destination').subscribe(existing => {
        if (existing > 0) {
          this.reviewDraft.update(d => ({ ...d, rating: existing }));
        }
      });
    }
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  readonly destination = signal<DestinationDetailData>({
    id: 2,
    name: 'Romantic Italy',
    heroImage: 'assets/images/hotel-beach.jpeg',
    destination: 'Italy → Venice / Discover',
    duration: 'For minimum 5 Nights',
    bestTrip: 'Best Trip!',
    pricePerNight: 0,
    ideas: [
      {
        id: 1,
        image: 'assets/images/idea-1.jpeg',
        authorAvatar: 'assets/images/author-avatar-1.jpeg',
        authorName: 'Alex Hana',
        timeAgo: '1 month ago',
        readTime: '3 min read',
        title: 'What happens in Goa',
        excerpt: `Goa's pristine beaches, vibrant nightlife, and colonial-era architecture
        make it one of India's most beloved destinations. From water sports to seafood
        feasts, there's something here for every kind of traveller.`,
      },
      {
        id: 2,
        image: 'assets/images/idea-2.jpeg',
        authorAvatar: 'assets/images/author-avatar-2.jpeg',
        authorName: 'Marcus',
        timeAgo: '3 months ago',
        readTime: '2 min read',
        title: 'Death in Burj Khalifa',
        excerpt: `Standing at 828 metres, the Burj Khalifa dominates the Dubai skyline.
        Visiting the observation deck at sunset offers a breathtaking panorama of
        the desert city merging with the Arabian Gulf.`,
      },
    ],
    overallRating: 4.30,
    ratingBars: [
      { stars: 5, percentage: 78 },
      { stars: 4, percentage: 52 },
      { stars: 3, percentage: 30 },
      { stars: 2, percentage: 14 },
      { stars: 1, percentage: 6  },
    ],
    reviews: [
      {
        id: 1,
        authorAvatar: 'assets/images/reviewer-1.jpeg',
        authorName: 'Juan Oui',
        timeAgo: '2 days ago',
        rating: 5,
        text: `Absolutely breathtaking experience! The rolling hills of Tuscany,
        the canals of Venice, and the ancient streets of Rome — Italy exceeded
        every expectation. The guided tours were incredibly informative.`,
      },
      {
        id: 2,
        authorAvatar: 'assets/images/reviewer-2.jpeg',
        authorName: 'Sara Thompson',
        timeAgo: '1 week ago',
        rating: 4,
        text: `A magical trip from start to finish. The hotel accommodations were
        top-notch and the itinerary was perfectly paced. Would highly recommend
        this package to anyone looking for a romantic getaway.`,
      },
      {
        id: 3,
        authorAvatar: 'assets/images/reviewer-3.jpeg',
        authorName: 'Lina Youssef',
        timeAgo: '2 weeks ago',
        rating: 4,
        text: `Italy never disappoints! We loved every moment of the trip.
        The food, the culture, the scenery — it was all wonderful.
        TripMate made everything seamless and stress-free.`,
      },
    ],
  });

  readonly showAllReviews = signal(false);

  readonly stars: number[] = [1, 2, 3, 4, 5];

  readonly visibleReviews = computed(() =>
    this.showAllReviews()
      ? this.destination().reviews
      : this.destination().reviews.slice(0, 2)
  );

  /* ── Live review stats — recomputed whenever communityPosts changes ── */

  private readonly allRatings = computed(() => [
    ...this.destination().reviews.map(r => r.rating),
    ...this.communityPosts().filter(p => p.rating > 0).map(p => p.rating),
  ]);

  readonly liveAverage = computed(() => {
    const all = this.allRatings();
    if (!all.length) return this.destination().overallRating;
    const avg = all.reduce((s, r) => s + r, 0) / all.length;
    return Math.round(avg * 10) / 10;
  });

  readonly liveReviewCount = computed(() => this.allRatings().length);

  readonly liveBars = computed(() => {
    const all = this.allRatings();
    if (!all.length) return this.destination().ratingBars;
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: Math.round((all.filter(r => r === stars).length / all.length) * 100),
    }));
  });

  readonly dialogOpen    = signal(false);
  readonly activeBooking = signal<BookingData | null>(null);

  onBookNow(): void {
    this.activeBooking.set({
      date:           'Today',
      from:           'Your Location',
      to:             this.destination().name,
      flight:         'Direct Booking',
      pricePerPerson: this.destination().pricePerNight || 299,
      destinationId:  this.destination().id,
      durationDays:   5,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void { this.dialogOpen.set(false); }

  goBack(): void { this.location.back(); }

  /* ── Community posts ────────────────────────────────────────── */
  readonly communityPosts = signal<{ id: number; userId: number; name: string; text: string; rating: number; timeAgo: string }[]>([]);

  readonly currentUserId = this.getUserId();

  deletePost(postId: number): void {
    this.communityPosts.update(list => list.filter(p => p.id !== postId));
    this.postService.delete(postId).subscribe(ok => {
      if (!ok) this.loadPosts(); // revert on failure
    });
  }

  private loadPosts(): void {
    const destName = this.destination().name.toLowerCase();
    this.postService.getAll().subscribe(posts => {
      const matched = posts
        .filter(p => p.location.toLowerCase().includes(destName) || destName.includes(p.location.toLowerCase()))
        .map(p => ({
          id:      p.postId,
          userId:  p.userId,
          name:    `User #${p.userId}`,
          text:    `${p.title} — ${p.description}`,
          rating:  p.rating,
          timeAgo: 'Recently',
        }));
      this.communityPosts.set(matched);
    });
  }

  /* ── Review form ────────────────────────────────────────────── */
  readonly reviewDraft      = signal({ title: '', description: '', rating: 0 });
  readonly reviewSubmitting = signal(false);
  readonly reviewSuccess    = signal(false);
  readonly reviewError      = signal('');

  setReviewRating(star: number): void {
    this.reviewDraft.update(d => ({ ...d, rating: star }));
  }

  setReviewTitle(val: string): void {
    this.reviewDraft.update(d => ({ ...d, title: val }));
  }

  setReviewDesc(val: string): void {
    this.reviewDraft.update(d => ({ ...d, description: val }));
  }

  submitReview(): void {
    const draft = this.reviewDraft();
    if (!draft.rating)             { this.reviewError.set('Please select a star rating.'); return; }
    if (!draft.title.trim())       { this.reviewError.set('Please add a title.'); return; }
    if (!draft.description.trim()) { this.reviewError.set('Please write your review.'); return; }

    const userId = this.getUserId();
    if (!userId) { this.reviewError.set('Please log in to submit a review.'); return; }

    this.reviewError.set('');
    this.reviewSubmitting.set(true);

    const optimisticId = -(Date.now());
    const title   = draft.title.trim();
    const desc    = draft.description.trim();
    const rating  = draft.rating;

    // Optimistic update: add to community posts immediately so stats recompute
    this.communityPosts.update(list => [{
      id:      optimisticId,
      userId,
      name:    'You',
      text:    `${title} — ${desc}`,
      rating,
      timeAgo: 'Just now',
    }, ...list]);

    // Reset form immediately — UI is never blocked
    this.reviewSubmitting.set(false);
    this.reviewSuccess.set(true);
    this.reviewDraft.set({ title: '', description: '', rating: 0 });
    setTimeout(() => this.reviewSuccess.set(false), 4000);

    const destId = this.destination().id;

    // Save rating to /api/ratings (drives Community Reviews stats on other users' views)
    if (destId) {
      this.ratingService.submit(destId, 'destination', rating).subscribe();
    }

    // Save review text to /api/Posts (drives the community posts list)
    this.postService.create({
      title,
      location:    this.destination().name,
      description: desc,
      imageUrl:    '',
      rating,
      userId,
    }).pipe(
      catchError((): Observable<PostResult> => of('api-error')),
    ).subscribe({
      next: (result: PostResult) => {
        if (result === null) {
          // Swap optimistic entry for real server data, preserving live stats
          this.loadPosts();
        }
      },
    });
  }
}
