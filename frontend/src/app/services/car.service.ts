import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Car } from '../models/Car';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private url: string = 'http://localhost:3000/api/car';
  constructor(private http: HttpClient,
              private userService: UserService) {}

  getCars() {
    return lastValueFrom(this.http.get<Car[]>(this.url, {
      headers: this.userService.getHeader()
    }));
  }

  saveCar(car: Car) {
    return lastValueFrom(this.http.post(`${this.url}`, car, {
      headers: this.userService.getHeader()
    }));
  }

  updateCar(id: number, car: Car){
    return lastValueFrom(this.http.put(`${this.url}/${id}`, car, {
      headers: this.userService.getHeader()
    }));
  }

  deleteCar(id: number) {
    return lastValueFrom(this.http.delete(`${this.url}/${id}`, {
      headers: this.userService.getHeader()
    }));
  }
}
