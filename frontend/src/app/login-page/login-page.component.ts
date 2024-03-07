import { Component } from '@angular/core';
import { BackendApiService } from '../backend-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {


  loading:boolean=false
  email_field:string=''
  password_field:string=''

  loginForm!: FormGroup;
  errorMessage!: string;
  
  constructor(private formBuilder: FormBuilder,private backend_service:BackendApiService, private router:Router){
    if(localStorage.getItem('username')){
      router.navigateByUrl('home')
    }
  }

  rotating_questions = ["questions regarding Pakistan's corporate law?", "an issue with setting up your company?", "no clue what the SECP expects from you?", "no corporate lawyer to consult?"]
  roitating_question_index:number=0

  ngOnInit() {
    // Use setInterval to update the number every 3 seconds
    setInterval(() => {
      this.roitating_question_index = (this.roitating_question_index+1)%this.rotating_questions.length;
    }, 3000); // 3000 milliseconds (3 seconds)

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async login_using_stored_profile(){
    let request = {
      'email': this.email_field,
      'password': this.password_field
    }
    console.log(request);
    this.loading = true;
    //let response = await this.backend_service.login_using_stored_profile(request)
    this.loading = false;

    //console.log(response);

  }
  login_using_gmail(){

  }
  login_using_facebook(){

  }

  login(){
    if (this.loginForm.invalid) {
      return;
    }

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    // Call your login service function here and handle the response
    this.backend_service.authenticateUser(username, password).subscribe(
      (response) => {
        if (response.result) {
          // Successful login, you can redirect or perform other actions
          console.log('Login successful');
          localStorage.setItem('username',username)
          localStorage.setItem('password',password)
          AppComponent.notify('success','Login Successful','Welcome to LegalBOT');
          this.router.navigateByUrl('home')
          
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred while logging in';
      }
    );
  }
}
