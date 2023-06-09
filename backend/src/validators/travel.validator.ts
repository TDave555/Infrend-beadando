import { NextFunction, Request, Response } from "express";
import { Purpose } from "../entities/Travel";
import { errorHandler } from "../services/service";

export function allPropertyValid(req: Request, res: Response, next: NextFunction) {
    if(!req.body.from) {
        return errorHandler(res, "Given 'from' parameter is not valid!", 400);
    }
    if(!req.body.to) {
        return errorHandler(res, "Given 'to' parameter is not valid!", 400);
    }
    if(!req.body.purpose ||
       !purposeValid(req.body.purpose)) {
        return errorHandler(res, "Given 'purpose' parameter is not valid!", 400);
    }
    if(!req.body.startDate ||
       !validDate(req.body.startDate)) {
        return errorHandler(res, "Given 'startDate' parameter is not valid!", 400);
    }
    if(!req.body.travelledDistance ||
       req.body.travelledDistance <= 0) {
        return errorHandler(res, "Given 'travelledDistance' parameter is not valid!", 400);
    }
    if(req.body.newMileage) {
        return errorHandler(res, "Can't give 'newMileage' property as an input parameter!", 400);
    }
    if(!req.body.driverId) {
        return errorHandler(res, "Given 'driverId' parameter must be given!", 400);
    }
    if(!req.body.carId) {
        return errorHandler(res, "Given 'carId' parameter must be given!", 400);
    }

    next();
}

export function givenPropertyValid(req: Request, res: Response, next: NextFunction) {
    if(req.body.from !== undefined &&
        (dataEmpty(req.body.from))) {
        return errorHandler(res, "Given 'from' parameter is not valid!", 400);
    }
    if(req.body.to !== undefined &&
        (dataEmpty(req.body.to))) {
        return errorHandler(res, "Given 'to' parameter is not valid!", 400);
    }
    if(req.body.purpose !== undefined &&
       (dataEmpty(req.body.purpose) || !purposeValid(req.body.purpose))) {
        return errorHandler(res, "Given 'purpose' parameter is not valid!", 400);
    }
    if(req.body.startDate !== undefined &&
       (dataEmpty(req.body.startDate) || !validDate(req.body.startDate))) {
        return errorHandler(res, "Given 'startDate' parameter is not valid!", 400);
    }
    if(req.body.travelledDistance !== undefined &&
        (dataEmpty(req.body.travelledDistance) || req.body.travelledDistance <= 0)) {
        return errorHandler(res, "Given 'travelledDistance' parameter is not valid!", 400);
    }
    if(req.body.newMileage) {
        return errorHandler(res, "Can't give 'newMileage' property as an input parameter!", 400);
    }
    if(req.body.driverId !== undefined &&
        (dataEmpty(req.body.driverId))) {
        return errorHandler(res, "Given 'driverId' parameter must be given!", 400);
    }
    if(req.body.carId !== undefined &&
        (dataEmpty(req.body.carId))) {
        return errorHandler(res, "Given 'carId' parameter must be given!", 400);
    }

    next();
}

function purposeValid(purpose: string) {
    for(let purposeType in Purpose) {
        if(isNaN(Number(purposeType))){
            if(purposeType === purpose.toUpperCase())
                return true;
        }
    }
    return false;
}

function dataEmpty(dataParam: string) {
    const data : string = String(dataParam);
    return data === '' ||
           data === ' ' ||
           data.includes('  ');
}

function validDate(date: string): boolean {
    const regex = /^([1-2][0-9]{3}[-](([1-9])|([1][0-2]))[-](([1])|([1-2]{0,1}[0-9])|([3][0-1])))$/;

    if(date.match(regex))
        return true;
    return false;
}