import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SaveTravel, Travel } from '../models/Travel';
import { TravelService } from '../services/travel.service';
import { UserService } from '../services/user.service';
import { AddTravelComponent } from './add-travel/add-travel.component';

@Component({
  selector: 'app-travel-list',
  templateUrl: './travel-list.component.html',
  styleUrls: ['./travel-list.component.css']
})
export class TravelListComponent implements OnInit, OnDestroy {
  private dialogSub !: Subscription;
  travels : Travel[] = [];
  text: string = "There are no travels in the database!";

  constructor(private dialog: MatDialog,
              private travelService: TravelService,
              private userService: UserService) {};

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  async ngOnInit() {
    try {
      this.travels = await this.travelService.getTravels();
    }catch(err){
      this.text = this.userService.logoutCatchFunction(err);
    }
  }

  addTravel() {
    const dialogRef = this.dialog.open(AddTravelComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container'
    });

    this.dialogSub = dialogRef.afterClosed().subscribe(async (value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("ADDED");
        try {
          await this.travelService.saveTravel(value);
          this.travels = await this.travelService.getTravels();
        } catch(err) {
          console.log("Couldn't save travel!");
          console.log(err);
        }
      }
    });
  }

  async editTravel(travelWrap: {id: number, travel : SaveTravel}) {
    try {
      await this.travelService.updateTravel(travelWrap.id, travelWrap.travel);
      this.travels = await this.travelService.getTravels();
    } catch(err) {
      console.log("Couldn't update travel!");
          console.log(err);
    }
  }

  async deleteTravel(id: number) {
    try {
      await this.travelService.deleteTravel(id);
    } catch(err) {
      console.log("Couldn't delete travel!");
          console.log(err);
    }
    try {
      this.travels = await this.travelService.getTravels();
    } catch(err) {
      console.log("Couldn't load travel!");
          console.log(err);
    }

  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
