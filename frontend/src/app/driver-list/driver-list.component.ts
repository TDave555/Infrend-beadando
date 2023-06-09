import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Driver } from '../models/Driver';
import { DriverService } from '../services/driver.service';
import { UserService } from '../services/user.service';
import { AddDriverComponent } from './add-driver/add-driver.component';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.css']
})
export class DriverListComponent implements OnInit, OnDestroy {
  private dialogSub !: Subscription;
  drivers: Driver[] = [];
  text: string = "There are no drivers in the database!";

  constructor(private dialog: MatDialog,
              private driverService: DriverService,
              private userService: UserService) {}

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  async ngOnInit() {
    try {
      this.drivers = await this.driverService.getDrivers();
    }catch(err) {
      this.text = this.userService.logoutCatchFunction(err);
    }
  }

  addDriver() {
    const dialogRef = this.dialog.open(AddDriverComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container'
    });

    this.dialogSub = dialogRef.afterClosed().subscribe(async (value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("ADDED");
        if(!this.drivers.find((driver) => driver.driverLicense === value.driverLicense)){
          try {
            await this.driverService.saveDriver(value);

            value.birthdate = this.convertToAcceptableDate(value.birthdate);
            value.driverLicenseExpiration = this.convertToAcceptableDate(value.driverLicenseExpiration);
            this.drivers.push(value);
          }catch(err) {
            console.log("Couldn't save driver!");
            console.log(err);
          }
        } else {
          alert('Driver with such driver license already exists!');
        }
      }
    });
  }

  async editDriver(driverWrap: {id: number, driver: any}) {
    let index : number = -1;
    for(let i = 0; i < this.drivers.length; i++) {
      if(this.drivers[i].id === driverWrap.id) {
        index = i;
        break;
      }
    }

    if(index !== -1){
      try {
        await this.driverService.updateDriver(driverWrap.id, driverWrap.driver);
        this.drivers[index] = {
          id: driverWrap.id,
          name: driverWrap.driver.name,
          birthdate: this.convertToAcceptableDate(driverWrap.driver.birthdate),
          address: driverWrap.driver.address,
          driverLicense: driverWrap.driver.driverLicense,
          driverLicenseExpiration: this.convertToAcceptableDate(driverWrap.driver.driverLicenseExpiration)
        }
      }catch(err) {
        console.log("Couldn't edit driver!");
        console.log(err);
      }
      return;
    }

    alert('Edited driver doesn\'t exists in the list!');
  }

  async deleteDriver(id: number) {
    let index : number = -1;
    for(let i = 0; i < this.drivers.length; i++) {
      if(this.drivers[i].id === id) {
        index = i;
        break;
      }
    }

    if(index !== 1) {
      try {
        await this.driverService.deleteDriver(id);
        this.drivers.splice(index, 1);
      }catch(err) {
        console.log("Couldn't delete driver!");
        console.log(err);
      }
      return;
    }

    alert("Couldn't delete driver, because it isn't on the list!");
  }

  private convertToAcceptableDate(dateParam: string){
    const date : Date = new Date(dateParam);
    const month: string = (date.getMonth() + 1) < 10 ? "0"+(date.getMonth() + 1) : String(date.getMonth() + 1);
    const day: string = (date.getDate()) < 10 ? "0"+(date.getDate()) : String(date.getDate());

    return date.getFullYear()+"-"+ month + "-" + day;
  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
