import { Routes } from '@angular/router';
import { AuthComponent } from './layouts/auth/auth.component';
import { MainComponent } from './layouts/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { BackagesComponent } from './components/backages/backages.component';
import { PlaceComponent } from './components/place/place.component';
import { FavouriteComponent } from './components/favourite/favourite.component';
import { MyTripComponent } from './components/my-trip/my-trip.component';
import { MyProfileComponent }    from './components/my-profile/my-profile.component';
import { FlightDetailComponent }      from './components/flight-detail/flight-detail.component';
import { HotelDetailComponent }       from './components/hotel-detail/hotel-detail.component';
import { DestinationDetailComponent } from './components/destination-detail/destination-detail.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

       { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
        {path : 'auth',component:AuthComponent,children:[
        {path : '', redirectTo : 'login', pathMatch : 'full'},
        {path : 'login',component:LoginComponent, title : 'Login'},
        {path : 'signup',component:SignUpComponent, title : 'Sign Up'}
    ]},
    {path : 'main',component:MainComponent, title : 'Main',canActivate:[authGuard], children:[
        {path : '', redirectTo : 'home', pathMatch : 'full'},
        {path : 'home',component:HomeComponent, title : 'Home'},
        {path : 'backages',component:BackagesComponent, title : 'Backages'},
        {path : 'place',component:PlaceComponent, title : 'Place'},        
        {path : 'favourite',component:FavouriteComponent, title : 'Favourite'},
        {path : 'my-trip',component:MyTripComponent, title : 'My Trip'},
        {path : 'my-profile',component:MyProfileComponent, title : 'My Profile'},
        {path : 'flight-detail/:id', component:FlightDetailComponent,     title : 'Flight Detail'},
        {path : 'hotel-detail',      component:HotelDetailComponent,      title : 'Hotel Detail'},
        {path : 'destination-detail',component:DestinationDetailComponent, title : 'Destination Detail'}
    ]}

];