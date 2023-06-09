import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Role, User } from '../../models/User';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm !: FormGroup;
  roles : string[] = [];
  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: User) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.maxLength(64)]],
      email: ['', [Validators.required, Validators.email]],
      emailAgain: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      passwordAgain: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      role: ['', [Validators.required]]
    });

    this.userForm.get("emailAgain")?.addValidators((control: AbstractControl)=> {
      return this.userForm.get("email")?.value === control.value ? null : { notMatches : true };
    });
    this.userForm.get("passwordAgain")?.addValidators((control: AbstractControl)=> {
      return this.userForm.get("password")?.value === control.value ? null : { notMatches : true };
    });

    this.userForm.updateValueAndValidity();
    this.loadRoles();
  }

  private loadRoles() {
    for(let role in Role) {
      this.roles.push(role.toLowerCase());
    }
  }

  addUser() {
    if(this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
