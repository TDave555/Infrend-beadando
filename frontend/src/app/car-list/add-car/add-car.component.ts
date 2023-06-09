import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Car } from 'src/app/models/Car';
import { Fuel } from 'src/app/models/Car';

@Component({
  selector: 'app-add-car',
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.css']
})
export class AddCarComponent implements OnInit, OnDestroy {
  carForm !: FormGroup;
  validatorSub ?: Subscription;
  fuels : string[] = [];
  editMode : boolean = false;
  title : string = "Add a new car";
  handleButton : string = "Add";
  consumptionErrorMsg : string = "Consumption is required and must be above 0!";

  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: Car) { }

  //unsubscribe from every observable
  ngOnDestroy(): void {
    this.validatorSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.carForm = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.pattern(/[epvz]-[\d]{5}$|[a-zA-Z]{3}-[\d]{3}$|[a-zA-Z]{4}-[\d]{2}$|[a-zA-Z]{5}-[\d]{1}$|[mM][\d]{2} [\d]{4}$|(ck|dt|hc|cd|hx|ma|ot|rx|rr) [\d]{2}-[\d]{2}$|(c-x|x-a|x-b|x-c) [\d]{4}$/)]],
      type: ['', Validators.required],
      fuel: ['', Validators.required],
      consumption: ['', [Validators.required, Validators.min(0.001)]],
      mileage: ['', [Validators.required, Validators.min(0)]]
    });

    if(this.data){
      this.editMode = true;
      this.title = "Edit car";
      this.handleButton = "Edit";
      this.resetForm();
    }

    this.fuels = this.fillFuels()
    this.handleValidators();
  }

  handleCar() {
    if(!this.carForm.valid) {
      return alert("Form is not valid!");
    }

    let car : Car = this.carForm.value;
    this.dialogRef.close(car);
  }

  resetForm() {
    this.carForm.setValue({licensePlate: this.data.licensePlate, type: this.data.type,
                          fuel: this.data.fuel, consumption: this.data.consumption,
                          mileage: this.data.mileage});
  }

  cancel() {
    this.dialogRef.close(null);
  }

  private fillFuels() {
    let fuels: string[] = [];
    for(let fuel in Fuel){
      if(fuel) {
        fuels.push(fuel.toLowerCase());
      }
    }

    return fuels;
  }

  private handleValidators() {
    const consumptionControl = this.carForm.get('consumption');

    this.validatorSub = this.carForm.get('fuel')!.valueChanges.subscribe((fuelContr) => {
      if(fuelContr === 'electric') {
        consumptionControl!.setValidators([Validators.required, Validators.min(0),Validators.max(0)]);
        this.consumptionErrorMsg = "Consumption must be 0, if the car is electric!"
      } else {
        consumptionControl!.setValidators([Validators.required, Validators.min(0.001)]);
        this.consumptionErrorMsg = "Consumption is required and must be above 0!"
      }

      consumptionControl?.updateValueAndValidity();
    });
  }
}
