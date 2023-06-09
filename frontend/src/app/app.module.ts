import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DriverListComponent } from './driver-list/driver-list.component';
import { CarListComponent } from './car-list/car-list.component';
import { TravelListComponent } from './travel-list/travel-list.component';
import { ReportComponent } from './report/report.component';
import { DriverComponent } from './driver-list/driver/driver.component';
import { CarComponent } from './car-list/car/car.component';
import { TravelComponent } from './travel-list/travel/travel.component';
import { AddDriverComponent } from './driver-list/add-driver/add-driver.component';
import { AddCarComponent } from './car-list/add-car/add-car.component';
import { AddTravelComponent } from './travel-list/add-travel/add-travel.component';
import { MonthlyComponent } from './report/monthly/monthly.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserItemComponent } from './signup/user-item/user-item.component';
import { AddUserComponent } from './signup/add-user/add-user.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DriverListComponent,
    CarListComponent,
    TravelListComponent,
    ReportComponent,
    DriverComponent,
    CarComponent,
    TravelComponent,
    AddDriverComponent,
    AddCarComponent,
    AddTravelComponent,
    MonthlyComponent,
    MenuComponent,
    LoginComponent,
    SignupComponent,
    UserItemComponent,
    AddUserComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
