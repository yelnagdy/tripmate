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
    fullname: new FormControl(null, [Validators.required, Validators.minLength(3),  Validators.maxLength(50)]),
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

        // Registration response returns token at the root level (not under res.data)
        const token        = res?.token;
        const refreshToken = res?.refreshToken;

        if (token) {
          // Auto-login: save credentials and go straight to the app
          sessionStorage.setItem('token', token);
          if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
          this.successMsg = 'Account created! Taking you in…';
          this._router.navigate(['/auth/login']);
        } else {
          // Registration succeeded but no token — send to login
          this.successMsg = 'Account created! Please log in.';
          this._router.navigate(['/auth/login']);
        }
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
