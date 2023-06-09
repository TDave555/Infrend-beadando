import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../services/service";

export function allPropertyValid(req: Request, res: Response, next: NextFunction) {
    const DRIVER_LICENSE_LENGTH = 8;

    if(!req.body.name) {
        return errorHandler(res, "Given 'name' parameter is not valid!", 400);
    }
    if(!req.body.birthdate ||
        !validDate(req.body.birthdate) ||
        !atLeast17YearsOld(req.body.birthdate)) {
        return errorHandler(res, "Given 'birthdate' parameter is not valid!\nDriver must be at least 17 years old!", 400);
    }
    if(!req.body.address) {
        return errorHandler(res, "Given 'address' parameter is not valid!", 400);
    }
    if(!req.body.driverLicense ||
        req.body.driverLicense.length !== DRIVER_LICENSE_LENGTH ||
        !validDriverLicense(req.body.driverLicense)) {
        return errorHandler(res, "Given 'driverLicense' parameter is not valid!", 400);
    }
    if(!req.body.driverLicenseExpiration ||
        !validDate(req.body.driverLicenseExpiration)) {
        return errorHandler(res, "Given 'driverLicenseExpiration' parameter is not valid!", 400);
    }

    next();
}

export function givenPropertyValid(req: Request, res: Response, next: NextFunction) {
    const DRIVER_LICENSE_LENGTH = 8;
    
    if(req.body.name !== undefined && 
        (dataEmpty(req.body.name))) {
        return errorHandler(res, "Given 'name' parameter is not valid!", 400);
    }
    if(req.body.birthdate !== undefined &&
        (dataEmpty(req.body.birthdate) ||
        !validDate(req.body.birthdate) ||
        !atLeast17YearsOld(req.body.birthdate))) {
        return errorHandler(res, "Given 'birthdate' parameter is not valid!\nDriver must be at least 17 years old!", 400);
    }
    if(req.body.address !== undefined &&
        (dataEmpty(req.body.address))) {
        return errorHandler(res, "Given 'address' parameter is not valid!", 400);
    }
    if(req.body.driverLicense !== undefined &&
        (dataEmpty(req.body.driverLicense) ||
        req.body.driverLicense.length !== DRIVER_LICENSE_LENGTH ||
        !validDriverLicense(req.body.driverLicense))) {
        return errorHandler(res, "Given 'driverLicense' parameter is not valid!", 400);
    }
    if(req.body.driverLicenseExpiration !== undefined &&
        (dataEmpty(req.body.driverLicenseExpiration) || !validDate(req.body.driverLicenseExpiration))) {
        return errorHandler(res, "Given 'driverLicenseExpiration' parameter is not valid!", 400);
    }

    next();
}

function validDate(date: string): boolean {
    const regex = /^([1-2][0-9]{3}[-](([1-9])|([1][0-2]))[-](([1])|([1-2]{0,1}[0-9])|([3][0-1])))$/;

    if(date.match(regex))
        return true;
    return false;
}

function dataEmpty(dataParam: string) {
    return (dataParam.trim() === '')
}

function atLeast17YearsOld(date: string): boolean {
    const birthdate = new Date(date);
    const yearInMillisec = 31556952000;
    let earlier17years = new Date(Date.now() - (yearInMillisec*17));

    if(earlier17years < birthdate){
        return false;
    }
    return true;
}

function validDriverLicense(license: string) {
    const regex = /^([A-Z]{2}[1-9][0-9]{5})$/;
    if(license.match(regex)) {
        return true;
    }
    return false;
}