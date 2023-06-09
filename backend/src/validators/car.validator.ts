import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../services/service";
import { Fuel } from "../entities/Car";

export function allPropertyValid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body.licensePlate || !licensePlateValid(req.body.licensePlate)) {
    return errorHandler(
      res,
      "Given 'licensePlate' parameter is not valid!",
      400
    );
  }
  if (!req.body.type) {
    return errorHandler(res, "Given 'type' parameter is not valid!", 400);
  }
  if (!req.body.fuel || !fuelValid(req.body.fuel)) {
    return errorHandler(res, "Given 'fuel' parameter is not valid!", 400);
  }
  if (
    req.body.consumption < 0 ||
    (!req.body.consumption && req.body.fuel !== Fuel.ELECTRIC) ||
    (req.body.consumption > 0 && req.body.fuel === Fuel.ELECTRIC)
  ) {
    return errorHandler(
      res,
      "Given 'consumption' parameter is not valid!",
      400
    );
  }
  if (req.body.mileage === undefined || req.body.mileage < 0) {
    return errorHandler(res, "Given 'mileage' parameter is not valid!", 400);
  }

  next();
}

export function givenPropertyValid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.body.licensePlate !== undefined && (!licensePlateValid(req.body.licensePlate) || dataEmpty(req.body.licensePlate))) {
    return errorHandler(
      res,
      "Given 'licensePlate' parameter is not valid!",
      400
    );
  }
  if(req.body.type !== undefined && (dataEmpty(req.body.type))) {
    return errorHandler(res, "Given 'type' parameter is not valid!", 400);
  }
  if (req.body.fuel !== undefined && !fuelValid(req.body.fuel)) {
    return errorHandler(res, "Given 'fuel' parameter is not valid!", 400);
  }
  if (
    req.body.consumption !== undefined &&
    (  dataEmpty(req.body.consumption) ||
       req.body.consumption < 0 ||
      (req.body.consumption === 0 && req.body.fuel !== Fuel.ELECTRIC) ||
      (req.body.consumption > 0 && req.body.fuel === Fuel.ELECTRIC))
  ) {
    return errorHandler(
      res,
      "Given 'consumption' parameter is not valid!",
      400
    );
  }
  if (req.body.mileage !== undefined && ( dataEmpty(req.body.mileage) || req.body.mileage < 0)) {
    return errorHandler(res, "Given 'mileage' parameter is not valid!", 400);
  }

  next();
}

function licensePlateValid(plate: string) {
  const regex =
    /[epvz]-[\d]{5}$|[a-zA-Z]{3}-[\d]{3}$|[a-zA-Z]{4}-[\d]{2}$|[a-zA-Z]{5}-[\d]{1}$|[mM][\d]{2} [\d]{4}$|(ck|dt|hc|cd|hx|ma|ot|rx|rr) [\d]{2}-[\d]{2}$|(c-x|x-a|x-b|x-c) [\d]{4}$/;
  return plate.match(regex);
}

function dataEmpty(dataParam: string) {
    return (dataParam.trim() === '')
}

function fuelValid(fuel: string) {
  for (let fuelType in Fuel) {
    if (isNaN(Number(fuelType))) {
      if (fuelType === fuel.toUpperCase()) return true;
    }
  }
  return false;
}
