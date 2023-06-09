import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm !: FormGroup;
  constructor(private fb: FormBuilder,
              private router: Router,
              private userService: UserService) { }

  ngOnInit(): void {
    if(this.userService.loginFromSStorage()){
      const urltoVisit = this.userService.urlToVisit;
      this.userService.urlToVisit = '';
      this.router.navigateByUrl(urltoVisit);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(128), Validators.minLength(6)]]
    });
  }

  async login() {
    if(this.loginForm.valid){
      const email = this.loginForm.get("email")?.value;
      const password = this.loginForm.get("password")?.value;

      try {
        await this.userService.login(email,password);
        this.router.navigate(['']);
      } catch(err) {
        if(err instanceof HttpErrorResponse){
          if(err.status === 404 && err.error === "User doesn't exists!"){
            return alert("User with such email doesn't exists!");
          }
          if(err.status === 400 && err.error === "Password is not correct!") {
            return alert("Given password is not correct!");
          }
        } else {
          console.log(err);
          alert("Can't log in now, some problems occured on the server!");
        }
      }
    }
  }
}
