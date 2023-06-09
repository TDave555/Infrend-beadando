import { Car } from "./Car";
import { Driver } from "./Driver";

export interface Travel {
  id: number;
  from: string;
  to: string;
  purpose: Purpose;
  startDate: string;
  travelledDistance: number;
  newMileage: number;
  driver: Driver;
  car: Car;
}

export interface SaveTravel {
  from ?: string;
  to ?: string;
  purpose ?: Purpose;
  startDate ?: string;
  travelledDistance ?: number;
  newMileage ?: number;
  carId ?: number;
  driverId ?: number;
}

export enum Purpose {PRIVATE = "private", BUSINESS = "business"};
