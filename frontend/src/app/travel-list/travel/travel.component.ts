import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SaveTravel, Travel } from 'src/app/models/Travel';
import { UserService } from 'src/app/services/user.service';
import { AddTravelComponent } from '../add-travel/add-travel.component';

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.css']
})
export class TravelComponent implements OnInit, OnDestroy {
  @Input() travel !: Travel;
  @Output() travelEdited = new EventEmitter<{id: number, travel : SaveTravel}>();
  @Output() travelDeleted = new EventEmitter<number>();
  dialogSub !: Subscription;

  constructor(private dialog: MatDialog,
              private userService: UserService) { }

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  editTravel() {
    const dialogRef = this.dialog.open(AddTravelComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container',
      data: this.travel
    });

    dialogRef.afterClosed().subscribe((value) => {
      if(value === null || value === undefined){
        console.log("CLOSED");
      }
      else {
        console.log("EDIT");
        this.travelEdited.emit({id: this.travel.id, travel: value});
      }
    });
  }

  deleteTravel() {
    this.travelDeleted.emit(this.travel.id);
  }

  isAdmin(){
    return this.userService.isAdmin();
  }
}
