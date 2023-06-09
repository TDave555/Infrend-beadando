import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Car } from '../models/Car';
import { CarService } from '../services/car.service';
import { AddCarComponent } from './add-car/add-car.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit, OnDestroy {
  private dialogSub !: Subscription;
  cars: Car[] = [];
  text: string = "There are no cars in the database";

  constructor(private dialog: MatDialog,
              private carService: CarService,
              private userService: UserService) { }

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  async ngOnInit() {
    try {
      this.cars = await this.carService.getCars();
    }catch(err) {
      this.text = this.userService.logoutCatchFunction(err);
    }
  }

  addCar() {
    const dialogRef = this.dialog.open(AddCarComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container'
    });

    this.dialogSub = dialogRef.afterClosed().subscribe(async (value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("ADDED");
        if(!this.cars.find((car)=> car.licensePlate.toLowerCase() === value.licensePlate.toLowerCase())){
          try {
            await this.carService.saveCar(value);
            this.cars.push(value);
          }catch(err) {
            console.log("Couldn't save car:\n"+err);
          }
        } else {
          alert('Car with such license plate already exists!');
        }
      }
      console.log(value);
    });
  }

  async editCar(carWrap: {id: number, car: Car}) {
    let index : number = -1;
    for(let i = 0; i < this.cars.length; i++) {
      if(this.cars[i].id === carWrap.id) {
        index = i;
        break;
      }
    }

    if(index !== -1){
      try {
        await this.carService.updateCar(carWrap.id, carWrap.car);
        this.cars[index] = {
          id: carWrap.id,
          licensePlate: carWrap.car.licensePlate,
          type: carWrap.car.type,
          fuel: carWrap.car.fuel,
          consumption: carWrap.car.consumption,
          mileage: carWrap.car.mileage
        }
      } catch(err) {
        console.log("Couldn't edit car:\n"+err);
      }
      return;
    }

    alert('Edited car doesn\'t exists in the list!');
  }

  async deleteCar(id: number) {
    let index : number = -1;
    for(let i = 0; i < this.cars.length; i++) {
      if(this.cars[i].id === id) {
        index = i;
        break;
      }
    }

    if(index !== 1) {
      try {
        await this.carService.deleteCar(id);
        this.cars.splice(index, 1);
      }catch(err) {
        console.log("Couldn't delete car:\n"+err);
      }
      return;
    }

    alert("Couldn't delete car, because it isn't on the list!");
  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
