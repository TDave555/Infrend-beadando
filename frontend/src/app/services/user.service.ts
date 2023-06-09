import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url : string = 'http://localhost:3000/api/user';
  private token: string = '';
  private currentUser?: User;
  urlToVisit : string = '';

  constructor(private http: HttpClient,
              private router: Router) {}

  getAllUser() {
    return lastValueFrom(this.http.get<User[]>(`${this.url}/each`,{
      headers: this.getHeader()
    }));
  }

  async login(email: string, password: string) {
    const result = await lastValueFrom(this.http.post<any>(`${this.url}/login`, {email: email, password: password}));
    this.token = result.auth_token;
    this.currentUser = result.user;
    sessionStorage.setItem("user", JSON.stringify(result.user));
    sessionStorage.setItem("token", this.token);

    return new Promise((resolve, reject) => {
      const returnValue = result.message;
      resolve(returnValue);
      reject("Couldn't login!");
    });

  }

  loginFromSStorage() {
    const SSUser = sessionStorage.getItem("user");
    const SSToken = sessionStorage.getItem("token");

    if(SSUser === null || SSToken === null) {
      return false;
    }

    this.currentUser = JSON.parse(SSUser);
    this.token = SSToken;
    return true;
  }

  signup(user: User) {
    return lastValueFrom(this.http.post(`${this.url}/signup`, user, {
      headers: this.getHeader()
    }));
  }

  removeUser(id: number) {
    return lastValueFrom(this.http.delete(`${this.url}/change/remove/${id}`, {
      headers: this.getHeader()
    }));
  }

  getHeader() {
    return new HttpHeaders({
      "auth_token": this.token,
      "auth_ext": String(this.currentUser!.id)
    });
  }

  hasUser() {
    return this.currentUser !== undefined && this.token.trim() !== '';
  }

  isAdmin() {
    return this.currentUser?.role.toLowerCase() == "admin";
  }

  async logoutUser() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    this.currentUser = undefined;
    this.token = '';

    await this.router.navigate(['login']);
  }

  currentUserNick() {
    if(this.currentUser){
      return this.currentUser.nickname;
    }
    return "Sir / Lady"
  }

  logoutCatchFunction(err: unknown) {
    if(err instanceof HttpErrorResponse){
      if(err.status === 401 && err.error === "Couldn't grant access!"){
        this.logoutUser();
        return "Your token has expired!";
      }
    }
    return "Some problem occurred during loading!";
  }
}
