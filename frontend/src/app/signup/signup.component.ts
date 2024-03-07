import { Component } from '@angular/core';
import { BackendApiService } from '../backend-api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  signupForm!: FormGroup;
  errorMessage!: string;

  constructor(private formBuilder: FormBuilder, private dataService: BackendApiService, private router:Router) {}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      password2:['', Validators.required],
      email: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    const username = this.signupForm.get('username')?.value;
    const password = this.signupForm.get('password')?.value;
    const password2 = this.signupForm.get('password2')?.value;
    const email = this.signupForm.get('email')?.value;
    const name = this.signupForm.get('name')?.value;

    if(password!=password2){
      this.errorMessage='Passwords need to match';
      return;
    }

    // Call your login service function here and handle the response
    this.dataService.createUser(
      username,
      email,
      password
    ).subscribe(
      (response) => {
        if (response.result) {
          // Successful login, you can redirect or perform other actions
          console.log('Sign up successful');
          localStorage.setItem('username',username)
          localStorage.setItem('password',password)
          this.router.navigateByUrl('home')
        } else {
          this.errorMessage = '';
        }
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred while logging in. Username is taken!';
      }
    );
  }
}
