import { Component } from '@angular/core';
import { BackagesComponent } from "../../components/backages/backages.component";
import { HomeComponent } from "../../components/home/home.component";
import { PlaceComponent } from "../../components/place/place.component";
import { FavouriteComponent } from "../../components/favourite/favourite.component";
import { MyTripComponent } from "../../components/my-trip/my-trip.component";
import { MyProfileComponent } from "../../components/my-profile/my-profile.component";
import { NavMainComponent } from "../../components/nav-main/nav-main.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [NavMainComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
