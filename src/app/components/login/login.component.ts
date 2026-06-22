import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    private readonly _router:      Router,
    private readonly _http:        HttpClient,
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

    // Use observe:'response' to inspect HTTP status, headers AND body for debugging
    this._http.post('/api/auth/login', this.LoginForm.value, { observe: 'response' }).subscribe({
      next: (httpRes) => {
        this.loading = false;

        console.log('[Login] HTTP status :', httpRes.status);
        console.log('[Login] Content-Type :', httpRes.headers.get('content-type'));
        console.log('[Login] Raw body     :', JSON.stringify(httpRes.body));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res  = httpRes.body as any;

        // Backend always returns HTTP 200 even on wrong credentials.
        // Success: body = { success:true, data:{ email, fullName, token, refreshToken } }
        // Failure: body = { success:true, data:"Invalid credentials" }
        // Null body means the proxy is misconfigured (double /api/api path) — restart ng serve.
        if (res === null || res === undefined) {
          console.error('[Login] Body is null — proxy may be misconfigured. Restart ng serve.');
          this.errorMsg = 'Server returned an empty response. Please restart the dev server and try again.';
          return;
        }

        const data = res?.data;

        if (!data || typeof data === 'string') {
          this.errorMsg = 'Invalid email or password. Please try again.';
          return;
        }

        const token        = data.token        ?? null;
        const refreshToken = data.refreshToken ?? null;

        if (!token) {
          console.error('[Login] No token in data:', JSON.stringify(data));
          this.errorMsg = 'Login succeeded but no token was returned. Please try again.';
          return;
        }

        // userId is NOT in the login response — decode it from the JWT payload
        let userId = '';
        try {
          const jwt   = JSON.parse(atob(token.split('.')[1]));
          const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
          userId = jwt[claim] ?? '';
        } catch { /* malformed token — userId stays blank */ }

        localStorage.setItem('token', token);
        if (refreshToken)  localStorage.setItem('refreshToken', refreshToken);
        if (userId)        localStorage.setItem('userId',       userId);
        if (data.email)    localStorage.setItem('userEmail',    data.email);
        if (data.fullName) localStorage.setItem('userFullName', data.fullName);

        console.log('[Login] Success — userId:', userId, 'token saved ✔');
        this.successMsg = 'Login successful! Redirecting…';
        this._router.navigate(['/main/home']);
      },

      error: (err) => {
        this.loading = false;
        console.error('[Login] HTTP error:', err.status, err.error);

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
