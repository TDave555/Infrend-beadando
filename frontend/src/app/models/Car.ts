export interface Car {
  id: number;
  licensePlate: string;
  type: string;
  fuel: Fuel;
  consumption: number;
  mileage: number;
}

export enum Fuel {PETROL = "petrol", DIESEL = "diesel", ELECTRIC = "electric", HYBRID = "hybrid"};
