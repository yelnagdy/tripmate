import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  loading    = false;
  successMsg = '';
  errorMsg   = '';

  RegisterForm: FormGroup = new FormGroup({
    name:     new FormControl(null, [Validators.required, Validators.minLength(3),  Validators.maxLength(20)]),
    email:    new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6),  Validators.maxLength(20)]),
    tel:      new FormControl(null, [Validators.required]),
  });

  constructor(
    private readonly _authService: AuthService,
    private readonly _router:      Router,
  ) {}

  RegisterUser(): void {
    if (!this.RegisterForm.valid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this._authService.RegisterUser(this.RegisterForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        console.log('[Register] raw response:', JSON.stringify(res));

        // Registration response returns token at the ROOT level (no .data wrapper)
        // Shape: { email, fullName, token, refreshToken }
        const token        = res?.token        ?? res?.data?.token        ?? null;
        const refreshToken = res?.refreshToken ?? res?.data?.refreshToken ?? null;
        const fullName     = res?.fullName     ?? res?.data?.fullName     ?? null;
        const email        = res?.email        ?? res?.data?.email        ?? null;

        if (!token) {
          // No token — registration may have failed silently; send to login
          this.successMsg = 'Account created! Please log in.';
          this._router.navigate(['/auth/login']);
          return;
        }

        // Extract userId from JWT payload
        let userId = '';
        try {
          const jwt   = JSON.parse(atob(token.split('.')[1]));
          const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
          userId = jwt[claim] ?? '';
        } catch { /* malformed token */ }

        // Always use localStorage — sessionStorage is wiped on tab close
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (userId)       localStorage.setItem('userId',       userId);
        if (email)        localStorage.setItem('userEmail',    email);
        if (fullName)     localStorage.setItem('userFullName', fullName);

        console.log('[Register] Success — auto-login, userId:', userId);
        this.successMsg = 'Account created! Taking you in…';
        this._router.navigate(['/main/home']);
      },

      error: (err) => {
        this.loading  = false;
        this.errorMsg =
          err?.error?.message && err.error.message !== 'Success'
            ? err.error.message
            : err.status === 409
              ? 'An account with this email already exists.'
              : `Registration failed (${err.status}). Please try again.`;
      },
    });
  }
}
