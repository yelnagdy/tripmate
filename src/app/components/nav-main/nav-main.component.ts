import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-nav-main',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent {
[x: string]: any;
  constructor(private _router: Router) {}
    logout():void{
      sessionStorage.removeItem('token');
      this._router.navigate(['/auth/login']);
    }
   }


