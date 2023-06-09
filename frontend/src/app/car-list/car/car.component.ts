import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Car } from 'src/app/models/Car';
import { UserService } from 'src/app/services/user.service';
import { AddCarComponent } from '../add-car/add-car.component';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css']
})
export class CarComponent implements OnInit, OnDestroy {
  private dialogSub !: Subscription;
  @Input() car !: Car;
  @Output() carEdited = new EventEmitter<{id: number, car: Car}>();
  @Output() carDeleted = new EventEmitter<number>();

  constructor(private dialog: MatDialog,
              private userService: UserService) { }

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  deleteCar() {
    this.carDeleted.emit(this.car.id);
  }

  editCar() {
    const dialogRef = this.dialog.open(AddCarComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container',
      data: this.car
    });

    this.dialogSub = dialogRef.afterClosed().subscribe((value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("EDITED");
        this.carEdited.emit({id: this.car.id, car: value});
      }
      console.log(value);
    });
  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
