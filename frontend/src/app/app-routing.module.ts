import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CarListComponent } from './car-list/car-list.component';
import { DriverListComponent } from './driver-list/driver-list.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { MonthlyComponent } from './report/monthly/monthly.component';
import { ReportComponent } from './report/report.component';
import { AuthUserService } from './services/auth-user.service';
import { SignupComponent } from './signup/signup.component';
import { TravelListComponent } from './travel-list/travel-list.component';

const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
    canActivate: [AuthUserService],
    children: [
      {
        path: '',
        component: SignupComponent
      },
      {
        path: 'car',
        component: CarListComponent
      },
      {
        path: 'driver',
        component: DriverListComponent
      },
      {
        path: 'travel',
        component: TravelListComponent
      },
      {
        path: 'report',
        component: ReportComponent
      },
      {
        path: 'report/monthly',
        component: MonthlyComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
