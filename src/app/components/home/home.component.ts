import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { HeroBannerComponent }    from './hero-banner/hero-banner.component';
import { DealsSectionComponent }  from './deals-section/deals-section.component';
import { TripsSearchBarComponent } from './trips-search-bar/trips-search-bar.component';
import { SpecialOffersComponent } from './special-offers/special-offers.component';
import { WhyChooseUsComponent }   from './why-choose-us/why-choose-us.component';
import { HowItWorksComponent }    from './how-it-works/how-it-works.component';
import { TestimonialsComponent }  from './testimonials/testimonials.component';
import { NewsGuidesComponent }    from './news-guides/news-guides.component';
import { NewsletterComponent }    from './newsletter/newsletter.component';
import { Language, TripFilter, PromoDeal, Trip, AppFeature, HowItWorksStep, Testimonial, Article } from '../../models/home.models';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroBannerComponent,
    DealsSectionComponent,
    TripsSearchBarComponent,
    SpecialOffersComponent,
    WhyChooseUsComponent,
    HowItWorksComponent,
    TestimonialsComponent,
    NewsGuidesComponent,
    NewsletterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

  /* ── Language ───────────────────────────────────────────── */
  readonly languages = signal<Language[]>([
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
  ]);
  readonly selectedLanguage = signal<Language>({ code: 'en', label: 'English' });

  onLanguageChange(lang: Language): void { this.selectedLanguage.set(lang); }

  /* ── Hot Deals ──────────────────────────────────────────── */
  readonly deals = signal<PromoDeal[]>([
    {
      id: 1,
      title: 'Discover Turkey',
      description: 'Save up to 25% on Flight + Hotels',
      ctaLabel: 'Book Now',
      backgroundImage: 'assets/images/destination-turkey.jpeg',
    },
    {
      id: 2,
      title: 'Explore Egypt',
      description: 'Save up to 30% on Flight + Hotels',
      ctaLabel: 'Book Now',
      backgroundImage: 'assets/images/destination-egypt.jpeg',
    },
    {
      id: 3,
      title: 'Visit Dubai',
      description: 'Save up to 20% on Flight + Hotels',
      ctaLabel: 'Book Now',
      backgroundImage: 'assets/images/destination-dubai.jpeg',
    },
  ]);

  onBookDeal(deal: PromoDeal): void {
    // TODO: navigate to booking with deal context
    console.log('Booking deal:', deal.title);
  }

  /* ── Trips ──────────────────────────────────────────────── */
  readonly trips = signal<Trip[]>([
    {
      id: 1,
      title: 'California Sunset/Twilight Boat Cruise',
      location: 'Santa Cruz, Monterey',
      price: 35.62,
      originalPrice: 55.00,
      badge: 'Gorgeous',
      badgeColor: 'teal',
      image: 'assets/images/destination-turkey.jpeg',
      isFavorite: false,
      isPromotional: true,
      endsAt: new Date(Date.now() + (209 * 86400 + 9 * 3600 + 58 * 60 + 44) * 1000),
    },
    {
      id: 2,
      title: 'California Sunset/Twilight Boat Cruise',
      location: 'Santa Cruz, Monterey',
      price: 49.25,
      image: 'assets/images/destination-egypt.jpeg',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'NYC: Food Tastings and Culture Tour',
      location: 'United States',
      price: 17.22,
      image: 'assets/images/destination-dubai.jpeg',
      isFavorite: false,
    },
  ]);

  readonly searchQuery  = signal('');
  readonly activeFilter = signal<TripFilter>({ maxPrice: null, onlyPromotional: false, onlyFavorites: false });

  readonly filteredTrips = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const f = this.activeFilter();

    return this.trips().filter(trip => {
      const matchesSearch = !q ||
        trip.title.toLowerCase().includes(q) ||
        trip.location.toLowerCase().includes(q);

      const matchesPrice = f.maxPrice === null || trip.price <= f.maxPrice;
      const matchesPromo = !f.onlyPromotional || !!trip.isPromotional;
      const matchesFavs  = !f.onlyFavorites  || trip.isFavorite;

      return matchesSearch && matchesPrice && matchesPromo && matchesFavs;
    });
  });

  onSearch(q: string): void { this.searchQuery.set(q); }
  onFilterChange(f: TripFilter): void { this.activeFilter.set(f); }

  onBookTrip(trip: Trip): void {
    // TODO: navigate to booking with trip context
    console.log('Booking trip:', trip.title);
  }

  onToggleFavorite(tripId: number): void {
    this.trips.update(list =>
      list.map(t => t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t)
    );
  }

  /* ── Why Choose Us features ─────────────────────────────── */
  readonly features = signal<AppFeature[]>([
    {
      id: 1,
      title: '500+ Destinations',
      description: 'Explore hundreds of amazing places worldwide',
      icon: 'fas fa-paper-plane',
      cardBg: '#f57c00',
    },
    {
      id: 2,
      title: 'Great 24/7 Support',
      description: 'Our team is always here to help you anytime',
      icon: 'fas fa-headset',
      cardBg: '#f5f0e6',
      image: 'assets/images/feature-support.jpeg',
    },
    {
      id: 3,
      title: 'Fast Booking',
      description: 'Book your perfect trip in just a few clicks',
      icon: 'fas fa-bolt',
      cardBg: '#1565c0',
      image: 'assets/images/feature-booking.jpeg',
    },
    {
      id: 4,
      title: 'Best Price',
      description: 'Guaranteed best deals at unbeatable prices',
      icon: 'fas fa-tag',
      cardBg: '#00897b',
    },
  ]);

  /* ── How It Works ───────────────────────────────────────── */
  readonly steps = signal<HowItWorksStep[]>([
    {
      id: 1,
      title: 'Find Your Destination',
      description: 'Browse hundreds of hand-picked destinations worldwide and pick the one that sparks your wanderlust.',
      icon: 'fas fa-map-marker-alt',
      iconBg: '#f59e0b',
    },
    {
      id: 2,
      title: 'Book a Ticket',
      description: 'Choose your dates, compare the best flight and hotel bundles, and secure your booking in minutes.',
      icon: 'fas fa-ticket-alt',
      iconBg: '#0891b2',
    },
    {
      id: 3,
      title: 'Fly and Go',
      description: 'Pack your bags and take off — everything is ready, your adventure starts now!',
      icon: 'fas fa-paper-plane',
      iconBg: '#f57c00',
    },
  ]);

  /* ── Testimonials ───────────────────────────────────────── */
  readonly testimonials = signal<Testimonial[]>([
    {
      id: 1,
      name: 'Sara Mohammed',
      role: 'Travel Blogger',
      avatar: 'assets/images/testimonial-1.jpeg',
      rating: 5,
      text: 'TripMate made planning our family vacation so easy. The deals were unbeatable and the booking process was smooth from start to finish. Highly recommended!',
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      role: 'Adventure Traveler',
      avatar: 'assets/images/testimonial-2.jpeg',
      rating: 5,
      text: 'I found an incredible last-minute deal to Istanbul through TripMate. The support team was incredibly helpful when I needed to change my dates. 10 out of 10!',
    },
    {
      id: 3,
      name: 'Lina Youssef',
      role: 'Digital Nomad',
      avatar: 'assets/images/testimonial-3.jpeg',
      rating: 4,
      text: 'Great platform with a huge selection of destinations. The countdown deals push you to act fast — I saved 30% on my Cairo trip. Will definitely use again.',
    },
  ]);

  /* ── News, Tips & Guides ────────────────────────────────── */
  readonly articles = signal<Article[]>([
    {
      id: 1,
      category: 'Cultural',
      categoryColor: 'teal',
      date: '11 Sep 2024',
      readTime: '4 min',
      comments: 36,
      title: 'Ultimate Travel Planning Guide: 10 Tips for a Seamless Journey',
      image: 'assets/images/article-1.jpeg',
      author: { name: 'Annie Evan', avatar: 'assets/images/author-1.jpeg' },
    },
    {
      id: 2,
      category: 'Travel',
      categoryColor: 'orange',
      date: '11 Sep 2024',
      readTime: '4 min',
      comments: 36,
      title: 'Top 15 Travel Hacks for Budget-Conscious Adventurers',
      image: 'assets/images/article-2.jpeg',
      author: { name: 'John Chris', avatar: 'assets/images/author-2.jpeg' },
    },
    {
      id: 3,
      category: 'Discover',
      categoryColor: 'blue',
      date: '11 Sep 2024',
      readTime: '4 min',
      comments: 36,
      title: 'Discovering Hidden Gems: 10 Off-the-Beaten-Path Travel Tips',
      image: 'assets/images/article-3.jpeg',
      author: { name: 'Emma Grey', avatar: 'assets/images/author-3.jpeg' },
    },
  ]);

  onViewMoreArticles(): void {
    // TODO: navigate to /blog
    console.log('View all articles');
  }

  onNewsletterSubscribe(email: string): void {
    // TODO: call newsletter API
    console.log('Newsletter subscribe:', email);
  }
}
