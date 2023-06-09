import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Driver } from 'src/app/models/Driver';

@Component({
  selector: 'app-add-driver',
  templateUrl: './add-driver.component.html',
  styleUrls: ['./add-driver.component.css']
})
export class AddDriverComponent implements OnInit {
  driverForm !: FormGroup;
  editMode : boolean = false;
  title : string = "Add a new driver";
  handleButton : string = "Add";

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: Driver) {}

  ngOnInit(): void {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(256)]],
      birthdate: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.maxLength(256)]],
      driverLicense: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/[A-Z]{2}[1-9][0-9]{5}/)]],
      driverLicenseExpiration: ['', [Validators.required]]
    });

    if(this.data){
    this.editMode = true;
    this.title = "Edit driver";
    this.handleButton = "Edit";
    this.resetForm();
    }

    console.log(this.driverForm.value);
  }

  handleDriver() {
    if(!this.driverForm.valid) {
      return console.log("Form is not valid!");
    }

    let driver : Driver = this.driverForm.value;
    driver.birthdate = this.transformDateToAcceptable(driver.birthdate);
    driver.driverLicenseExpiration = this.transformDateToAcceptable(driver.driverLicenseExpiration);

    this.dialogRef.close(driver);
  }

  resetForm() {
    this.driverForm.setValue({name: this.data.name, birthdate: this.data.birthdate,
                              address: this.data.address, driverLicense: this.data.driverLicense,
                              driverLicenseExpiration: this.data.driverLicenseExpiration});
  }

  cancel() {
    this.dialogRef.close(null);
  }

  private transformDateToAcceptable(paramDate: string) : string {
    const preDate : Date = new Date(paramDate);

    return `${preDate.getFullYear()}-${preDate.getMonth()+1}-${preDate.getDate()}`;
  }
}
