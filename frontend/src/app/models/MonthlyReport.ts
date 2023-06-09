import { Car } from "./Car";
import { Travel } from "./Travel";

export interface MonthlyReport {
  car : Car;
  startingMileage : number;
  finishingMileage : number;
  travels : Travel[];
  privateSummary : Summary;
  businessSummary : Summary;
}

export interface Summary {
  travelledDistance: number;
  consumptionCost: number;
  flatRate: number;
  totalCost: number;
}
