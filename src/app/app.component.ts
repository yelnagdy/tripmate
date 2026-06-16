import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackagesComponent } from "./components/backages/backages.component";
import { FavouriteComponent } from "./components/favourite/favourite.component";
import { FooterComponent } from "./components/footer/footer.component";
import { LoginComponent } from "./components/login/login.component";
import { MyTripComponent } from "./components/my-trip/my-trip.component";
import { NavMainComponent } from "./components/nav-main/nav-main.component";
import { PlaceComponent } from "./components/place/place.component";
import { HomeComponent } from "./components/home/home.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { MyProfileComponent } from "./components/my-profile/my-profile.component";
import { NavAuthComponent } from "./components/nav-auth/nav-auth.component";
import { AuthComponent } from "./layouts/auth/auth.component";
import { MainComponent } from "./layouts/main/main.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tripmate';
}
