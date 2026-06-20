import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading    = false;
  successMsg = '';
  errorMsg   = '';

  LoginForm: FormGroup;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _router:      Router,
  ) {
    this.LoginForm = this._formBuilder.group({
      email:    new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    });
  }

  LoginUser(): void {
    if (!this.LoginForm.valid) {
      this.LoginForm.markAllAsTouched();
      return;
    }

    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this._authService.loginuser(this.LoginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        // Login can return token nested under `data` OR at root (backend inconsistency)
        const token        = res?.data?.token        ?? res?.token;
        const refreshToken = res?.data?.refreshToken ?? res?.refreshToken;
        const userId       = res?.data?.userId       ?? res?.userId;

        console.log('[Login] raw response:', JSON.stringify(res));
        console.log('[Login] token:', token ? token.slice(0, 30) + '…' : 'MISSING');

        if (!token) {
          this.errorMsg = 'Login succeeded but no token was returned. Please try again.';
          return;
        }

        sessionStorage.setItem('token', token);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        if (userId)       sessionStorage.setItem('userId', String(userId));

        console.log('[Login] sessionStorage.token set ✔');
        this.successMsg = 'Login successful! Redirecting…';
        this._router.navigate(['/main/home']);
      },

      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.errorMsg = 'Invalid email or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMsg = 'Cannot reach the server. Check your connection.';
        } else {
          this.errorMsg =
            err?.error?.message && err.error.message !== 'Success'
              ? err.error.message
              : `Login failed (${err.status}). Please try again.`;
        }
      },
    });
  }
}
