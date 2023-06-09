import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  users : User[] = [];
  dialogSub !: Subscription;
  nickname !: string;

  constructor(private userService: UserService,
              private dialog: MatDialog) {}

  ngOnDestroy(): void {
    if(this.dialogSub){
      this.dialogSub.unsubscribe();
    }
  }

  async ngOnInit() {
    if(this.isAdmin()) {
      try {
        this.users = await this.userService.getAllUser();
      } catch(err) {
        console.log(err);
      }
    }
    this.nickname = this.userService.currentUserNick();
  }

  isAdmin() {
    return this.userService.isAdmin();
  }

  async deleteUser(id: number) {
    const index = this.indexOfUser(id);
    try {
      await this.userService.removeUser(id);
      this.users.splice(index, 1);
    } catch(err) {
      console.log(err);
    }
  }

  async addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '35%',
      panelClass: 'custom-dialog-container'
    });

    this.dialogSub = dialogRef.afterClosed().subscribe(async (value) => {
      if(value === null || value === undefined){
        return;
      }
      console.log(value);

      await this.userService.signup(value);
      this.users = await this.userService.getAllUser();
    });
  }

  private indexOfUser(id: number) {
    let index = -1;
    for(let i = 0; i < this.users.length; i++) {
      if(this.users[i].id == id){
        index = i;
        break;
      }
    }
    return index;
  }
}
