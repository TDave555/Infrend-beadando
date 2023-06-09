import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Driver } from '../models/Driver';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private url: string = 'http://localhost:3000/api/driver';
  constructor(private http: HttpClient,
              private userService: UserService) {}

  getDrivers() {
    return lastValueFrom(this.http.get<Driver[]>(this.url, {
      headers: this.userService.getHeader()
    }));
  }

  getDriversLicenseNotExpired(expirationDate: Date | string) {
    const expDate = this.transformDateToAcceptable(expirationDate);

    return lastValueFrom(this.http.get<Driver[]>(`${this.url}/notexpired`, {
      params: {
        expDate: expDate
      },
      headers: this.userService.getHeader()
    }));
  }

  saveDriver(driver: Driver) {
    return lastValueFrom(this.http.post(this.url, driver, {
      headers: this.userService.getHeader()
    }));
  }

  updateDriver(id: number, driver: Driver) {
    return lastValueFrom(this.http.put(`${this.url}/${id}`, driver, {
      headers: this.userService.getHeader()
    }));
  }

  deleteDriver(id: number) {
    return lastValueFrom(this.http.delete(`${this.url}/${id}`, {
      headers: this.userService.getHeader()
    }));
  }

  private transformDateToAcceptable(paramDate: string | Date) : string {
    const preDate : Date = new Date(paramDate);

    return `${preDate.getFullYear()}-${preDate.getMonth()+1}-${preDate.getDate()}`;
  }
}
