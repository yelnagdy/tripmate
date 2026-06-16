import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackagesComponent } from "./components/backages/backages.component";
import { FavouriteComponent } from "./components/favourite/favourite.component";
import { FooterComponent } from "./components/footer/footer.component";
import { LoginComponent } from "./components/login/login.component";
import { MyTripComponent } from "./components/my-trip/my-trip.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { PlaceComponent } from "./components/place/place.component";
import { HomeComponent } from "./components/home/home.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackagesComponent, FavouriteComponent, FooterComponent, LoginComponent, MyTripComponent, NavBarComponent, PlaceComponent, HomeComponent, SignUpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tripmate';
}
