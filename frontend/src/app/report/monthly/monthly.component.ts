import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthlyReport } from 'src/app/models/MonthlyReport';
import { TravelService } from 'src/app/services/travel.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.component.html',
  styleUrls: ['./monthly.component.css']
})
export class MonthlyComponent implements OnInit {
  monthlyReport !: MonthlyReport;
  reportSlab : {year: string | null, month: string | null, licensePlate: string | null} | null = null;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private travelService : TravelService,
              private userService: UserService) { }

  async ngOnInit() {
    this.reportSlab = {
      year: this.route.snapshot.queryParamMap.get('year'),
      month: this.route.snapshot.queryParamMap.get('month'),
      licensePlate: this.route.snapshot.queryParamMap.get('licensePlate')
    }

    if(this.hasQueryParams()) {
      try{
        this.monthlyReport = await this.travelService.getMonthlyReport(String(this.reportSlab.licensePlate), Number(this.reportSlab.year), Number(this.reportSlab.month));
      } catch(err) {
        console.log(this.userService.logoutCatchFunction(err));
        if(err instanceof HttpErrorResponse){
          alert(err.error === "NO_DATA" ? "There are no data to make a monthly report!" : "Couldn't load report!");
        } else {
          alert("Couldn't load report!");
        }
        this.router.navigate(['report']);
      }
    } else {
      this.router.navigate(['report']);
    }
  }


  private hasQueryParams() {
    return (this.reportSlab === null ||
            this.reportSlab.year === null ||
            this.reportSlab.month === null ||
            this.reportSlab.licensePlate === null) ? false : true;
  }
}
