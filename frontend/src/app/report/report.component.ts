import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reportForm !: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router) {

  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      yearMonth: ['', [Validators.required]],
      licensePlate: ['', [Validators.required, Validators.minLength(7), Validators.pattern(/[epvz]-[\d]{5}$|[a-zA-Z]{3}-[\d]{3}$|[a-zA-Z]{4}-[\d]{2}$|[a-zA-Z]{5}-[\d]{1}$|[mM][\d]{2} [\d]{4}$|(ck|dt|hc|cd|hx|ma|ot|rx|rr) [\d]{2}-[\d]{2}$|(c-x|x-a|x-b|x-c) [\d]{4}$/)]]
    });
  }

  requestMonthlyReport() {
    if(this.reportForm.valid) {
      const dates = this.reportForm.value.yearMonth.split('-');
      this.router.navigate(
        ['report','monthly'],
        { queryParams: {
          licensePlate : this.reportForm.value.licensePlate,
          year: Number(dates[0]),
          month: Number(dates[1])
      }});
    }
  }
}
