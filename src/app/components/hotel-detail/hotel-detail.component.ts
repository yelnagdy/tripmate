import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HotelDetailData, BookingData } from '../../models/detail.models';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BookingDialogComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.css',
})
export class HotelDetailComponent {

  readonly hotel = signal<HotelDetailData>({
    id: 1,
    name: 'Water Hotel',
    type: 'BOUTIQUE HOTEL',
    heroImage: 'assets/images/hotel-water.jpeg',
    sideImages: [
      'assets/images/hotel-water-room.jpeg',
      'assets/images/hotel-water-bath.jpeg',
    ],
    about: `Nestled along the tranquil shoreline, Water Hotel is a luxury boutique
    escape that seamlessly blends contemporary design with natural beauty.
    Each room offers breathtaking panoramic views of the crystal-clear waters,
    with floor-to-ceiling windows that bring the outside in. Our world-class
    restaurant serves locally sourced cuisine, complemented by an infinity pool
    that appears to merge with the horizon. Whether you're seeking adventure
    or serenity, Water Hotel provides the perfect sanctuary for every traveller.`,
    pricePerNight: 20,
    amenities: [
      { icon: 'fas fa-bed',          label: 'Bedroom'    },
      { icon: 'fas fa-bath',         label: 'Bathroom'   },
      { icon: 'fas fa-wifi',         label: 'Free WiFi'  },
      { icon: 'fas fa-swimming-pool',label: 'Pool'       },
      { icon: 'fas fa-wind',         label: 'AC'         },
      { icon: 'fas fa-utensils',     label: 'Kitchen'    },
      { icon: 'fas fa-tshirt',       label: 'Laundry'    },
      { icon: 'fas fa-tv',           label: 'Smart TV'   },
    ],
    discoverCards: [
      { id: 1, name: 'Green Lake',      image: 'assets/images/discover-1.jpeg' },
      { id: 2, name: 'Stay Clubs',      image: 'assets/images/discover-2.jpeg' },
      { id: 3, name: 'Labour and Well', image: 'assets/images/discover-3.jpeg' },
      { id: 4, name: 'Snorkelling',     image: 'assets/images/discover-4.jpeg' },
    ],
  });

  readonly dialogOpen   = signal(false);
  readonly bookingData  = signal<BookingData>({
    date:           'Today',
    from:           'Your Location',
    to:             'Water Hotel',
    flight:         'Direct Booking',
    pricePerPerson: this.hotel().pricePerNight,
  });

  onBookNow(): void {
    this.bookingData.set({
      date:           'Today',
      from:           'Your Location',
      to:             this.hotel().name,
      flight:         'Direct Booking',
      pricePerPerson: this.hotel().pricePerNight,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
