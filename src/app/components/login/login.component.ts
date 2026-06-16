import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading: boolean = false
  restext!: string
  restoken!: string
  LoginForm: FormGroup;

  constructor(private _formBuilder: FormBuilder, private _authService: AuthService , private _router: Router) {
    this.LoginForm = this._formBuilder.group({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }


  LoginUser(): void{
  if(this.LoginForm.valid){
    this.loading = true;
    this._authService.loginuser(this.LoginForm.value).subscribe({
      next:(res)=>{
        console.log('[Auth] Login response received:', res);
        this.restext = res.message;
        this.loading = false;

        const token = res.data.token;
        sessionStorage.setItem('token', token);
        console.log('[Auth] Token saved to sessionStorage:', token ? '✔ token exists' : '✘ token is empty');

        // ✅ setTimeout fires ONCE after 2s — setInterval fires forever
        setTimeout(() => {
          console.log('[Auth] Navigating to /main/home ...');
          this._router.navigate(['/main/home']);
        }, 2000);
      },

      error:(err)=>{
        this.loading = false;
        console.error('[Auth] Login error:', err);
        this.restext = err?.error?.message;
      },
      complete:()=>{this.loading = false;}
    })
  }
  else{
    this.LoginForm.markAllAsTouched();
  }
  }

}
