import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DestinationDetailData, BookingData } from '../../models/detail.models';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, BookingDialogComponent],
  templateUrl: './destination-detail.component.html',
  styleUrl: './destination-detail.component.css',
})
export class DestinationDetailComponent {

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

  readonly visibleReviews = () =>
    this.showAllReviews()
      ? this.destination().reviews
      : this.destination().reviews.slice(0, 2);

  readonly dialogOpen    = signal(false);
  readonly activeBooking = signal<BookingData | null>(null);

  onBookNow(): void {
    this.activeBooking.set({
      date:           'Today',
      from:           'Your Location',
      to:             this.destination().name,
      flight:         'Direct Booking',
      pricePerPerson: this.destination().pricePerNight || 299,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void { this.dialogOpen.set(false); }
}
