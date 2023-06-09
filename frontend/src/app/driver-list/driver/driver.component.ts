import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Driver } from 'src/app/models/Driver';
import { UserService } from 'src/app/services/user.service';
import { AddDriverComponent } from '../add-driver/add-driver.component';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit, OnDestroy {
  @Input() driver !: Driver;
  @Output() driverEdited = new EventEmitter<{id: number, driver: any}>();
  @Output() driverDeleted = new EventEmitter<number>();
  dialogSub !: Subscription;
  isExpired !: boolean;

  constructor(private dialog: MatDialog,
              private userService: UserService) {}

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.isExpired = this.driverLicenseExpired(this.driver.driverLicenseExpiration);
  }

  deleteDriver() {
    this.driverDeleted.emit(this.driver.id);
  }

  editDriver() {
    const dialogRef = this.dialog.open(AddDriverComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container',
      data: this.driver
    });

    dialogRef.afterClosed().subscribe((value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("EDIT");
        this.driverEdited.emit({id: this.driver.id, driver: value});
      }
    });
  }

  private driverLicenseExpired(driverExp : string | Date) {
    const given = new Date(driverExp);
    const now = new Date(Date.now());
    const calculatedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if(calculatedNow > given){
      return true;
    }
    return false;
  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
