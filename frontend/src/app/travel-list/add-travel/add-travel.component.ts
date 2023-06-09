import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Car } from 'src/app/models/Car';
import { Driver } from 'src/app/models/Driver';
import { Purpose, SaveTravel, Travel } from 'src/app/models/Travel';
import { CarService } from 'src/app/services/car.service';
import { DriverService } from 'src/app/services/driver.service';

@Component({
  selector: 'app-add-travel',
  templateUrl: './add-travel.component.html',
  styleUrls: ['./add-travel.component.css']
})
export class AddTravelComponent implements OnInit {
  travelForm !: FormGroup;
  editMode : boolean = false;
  title : string = "Add a new travel";
  handleButton : string = "Add";
  purposes !: string[];
  drivers !: Driver[];
  cars !: Car[];

  constructor(private fb: FormBuilder,
              private driverService: DriverService,
              private carService: CarService,
              private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: Travel) {}

  async ngOnInit() {
    this.travelForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      purpose: ['', Validators.required],
      startDate: ['', Validators.required],
      travelledDistance: ['', [Validators.required, Validators.min(0)]],
      car: ['', Validators.required],
      driver: ['', Validators.required]
    });

    if(this.data){
      this.editMode = true;
      this.title = "Edit travel";
      this.handleButton = "Edit";
      this.resetForm();
    }

    this.purposes = this.getPurposes();
    try {
      this.drivers = await this.driverService.getDriversLicenseNotExpired(new Date());
      this.cars = await this.carService.getCars();
    }catch(err) {
      console.log("Couldn't load drivers and cars!");
      this.drivers = [];
      this.cars = [];
    }
  }

  handleDriver() {
    if(!this.travelForm.valid) {
      return console.log("Form is not valid!");
    }

    const result = this.editMode ? this.editTravel() : this.addTravel();
    this.dialogRef.close(result);
  }


  resetForm() {
    this.travelForm.setValue({from: this.data.from, to: this.data.to,
                              purpose: this.data.purpose, startDate: this.data.startDate,
                              travelledDistance: this.data.travelledDistance, car: this.data.car,
                              driver: this.data.driver});
  }

  cancel() {
    this.dialogRef.close(null);
  }

  private addTravel() {
    let travel : Travel = this.travelForm.value;

    travel.startDate = this.transformDateToAcceptable(travel.startDate);

    return travel;
  }

  private editTravel() {
    return this.getChangedValues(this.data);
  }

  private getChangedValues(travel : Travel) {
    let changedValues : SaveTravel = {};

    if(this.travelForm.get('from')!.value !== travel.from){
      changedValues.from = this.travelForm.get('from')!.value;
    }
    if(this.travelForm.get('to')!.value !== travel.to){
      changedValues.to = this.travelForm.get('to')!.value;
    }
    if(this.travelForm.get('purpose')!.value !== travel.purpose){
      changedValues.purpose = this.travelForm.get('purpose')!.value;
    }
    if(this.travelForm.get('startDate')!.value !== travel.startDate){
      changedValues.startDate = this.transformDateToAcceptable(this.travelForm.get('startDate')!.value);
    }
    if(this.travelForm.get('travelledDistance')!.value !== travel.travelledDistance){
      changedValues.travelledDistance = this.travelForm.get('travelledDistance')!.value;
    }
    if(this.travelForm.get('car')!.value !== travel.car){
      changedValues.carId = this.travelForm.get('car')!.value.id;
    }
    if(this.travelForm.get('driver')!.value !== travel.driver){
      changedValues.driverId = this.travelForm.get('driver')!.value.id;
    }

    return changedValues;
  }

  private getPurposes() {
    let purposes: string[] = [];
    for(let purpose in Purpose){
      purposes.push(purpose.toLowerCase());
    }

    return purposes;
  }

  private transformDateToAcceptable(paramDate: string | Date) : string {
    const preDate : Date = new Date(paramDate);

    return `${preDate.getFullYear()}-${preDate.getMonth()+1}-${preDate.getDate()}`;
  }
}
