import { AuthService } from './../../core/services/auth.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  constructor(private _authService: AuthService,private _router: Router) {}

loading: boolean = false
restext!: string


  RegisterForm:FormGroup = new FormGroup({
    name: new FormControl(null , [Validators.required , Validators.minLength(3) , Validators.maxLength(20)]),
    fullname: new FormControl(null , [Validators.required , Validators.minLength(3) , Validators.maxLength(50)]),
    email: new FormControl(null , [Validators.required , Validators.email]),
    password: new FormControl(null , [Validators.required]),
    tel: new FormControl(null , [Validators.required]),
  });


  RegisterUser(){
  if(this.RegisterForm.valid){
    this.loading = true;  
    console.log(this.RegisterForm.value);
    this._authService.RegisterUser(this.RegisterForm.value).subscribe({
      next: (response) => {
      console.log(response)
      this.restext = response.message;
      this.loading = false;
      setInterval(() => {
        this._router.navigate(['/auth/login']);
      },2000);

      },
      error: (error) => {
      this.loading = false;
      console.error(error.error.message);
      this.restext = error.error.message;
     
      },
      complete: () => {}
    });
  } else {
    this.RegisterForm.setErrors({'missMatch': true});
    this.RegisterForm.markAllAsTouched();
  }
  } 
}