import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelListComponent } from './travel-list.component';

describe('TravelListComponent', () => {
  let component: TravelListComponent;
  let fixture: ComponentFixture<TravelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
