import { Request, Response } from "express";
import { DataSource, LessThanOrEqual, Repository } from "typeorm";
import { Car } from "../entities/Car";
import { Driver } from "../entities/Driver";
import { Purpose, Travel } from "../entities/Travel";
import { MonthlyReport, Summary } from "../models/MontlyReport";
import { errorHandler, Service } from "./service";

export class TravelService extends Service {
    private driverRepository : Repository<Driver>;
    private carRepository : Repository<Car>;

    constructor(dataSource: DataSource){
        super();
        this.repository = dataSource.getRepository(Travel);
        this.driverRepository = dataSource.getRepository(Driver);
        this.carRepository = dataSource.getRepository(Car);
    }

    saveBackAndForth = async (req: Request, res: Response) => {
        if(req.body.id) {
            const travelFromDb = await this.repository.findOneBy({id: req.body.id});
            if(travelFromDb) {
                return errorHandler(res, 'Travel with such id already exists!', 400);
            }
        }

        const driver : Driver = await this.driverRepository.findOneBy({id: req.body.driverId});
        if(!driver) {
            return errorHandler(res, "Driver with the given id does not exists!", 404);
        }
        if(this.licenseExpired(driver.driverLicenseExpiration)){
            return errorHandler(res, "Driver's license is expired!", 400);
        }

        const car : Car = await this.carRepository.findOneBy({id: req.body.carId});
        if(!car) {
            return errorHandler(res, "Car with the given id does not exists!", 404);
        }
        
        const journeyFromDb = await this.repository.findOneBy({
            from: req.body.from,
            purpose: req.body.purpose,
            startDate: req.body.startDate,
            travelledDistance: req.body.travelledDistance,
            driver: { id: req.body.driverId},
            car: { id: req.body.carId}
        });
        if(journeyFromDb) {
            return errorHandler(res, "Travel with similar properties already exists!", 406);
        }

        let carMileage : number;
        try {
            carMileage = await this.getHighestMileage(car.id, car.mileage, new Date(req.body.startDate));
        } catch(err) {
            return errorHandler(res, "Car mileage couldn't be queried!", 500);
        }

        try {
            await this.changeMileageAbove(car.id, (req.body.travelledDistance*2), null, req.body.startDate);
        } catch(err) {
            return errorHandler(res, "Couldn't update subsequent travels!", 500);
        }
        
        req.body.driver = driver;
        req.body.car = car;
        
        //Insert from-to
        req.body.newMileage = req.body.travelledDistance + carMileage;

        const travel1 = this.repository.create(req.body);
        
        //Insert to-from
        if(req.body.id){
            req.body.id = 0;
        }
        const newTo = req.body.from,
        newFrom = req.body.to;
        req.body.newMileage = req.body.travelledDistance + req.body.newMileage;
        req.body.from = newFrom;
        req.body.to = newTo;
        
        const travel2 = this.repository.create(req.body);
        try {
            await this.repository.save([travel1,travel2]);
            res.status(201).send({
                ids : [
                    {id : travel1.id}, 
                    {id : travel2.id}
                ],
                saved: true});
        }catch(err) {
            return errorHandler(res);
        }
    }

    deleteBackAndForth = async (req: Request, res: Response) => {
        const travel1 : Travel = await this.repository.findOneBy({id: req.params.id});
        if(!travel1){
            return errorHandler(res, "Removable travel is not found!", 404);
        }

        const travel2 = await this.repository.findOneBy({
            from: travel1.to,
            purpose: travel1.purpose,
            startDate: travel1.startDate,
            travelledDistance: travel1.travelledDistance,
            driver: { id: travel1.driver.id},
            car: { id: travel1.car.id}
        });
        if(!travel2){
            return errorHandler(res, "Driver with the car don't have a planed backway!", 404);
        }

        //A későbbi utazások ugyan azon autón, ki kell vonni az utazott távolságot mindegyikből
        try {
            await this.changeMileageAbove(travel1.car.id, -(travel1.travelledDistance*2), travel1.newMileage, null);
        }catch(err) {
            return errorHandler(res, "Couldn't update subsequent travels on delete!", 404);
        }

        const ids : number[] = [travel1.id, travel2.id];
        try {
            await this.repository.remove([travel1, travel2]);
            res.status(200).send({
                ids : ids,
                deleted: true,
                decreased: travel1.travelledDistance});
        }catch(err) {
            errorHandler(res);
        }
    }

    patchBackAndForth = async (req: Request, res: Response) => {
        if(!req.body) {
            return errorHandler(res, "Necessary informations are not given!", 400);
        }

        const travel1: Travel = await this.repository.findOneBy({id: req.params.id});
        if(!travel1){
            return errorHandler(res, "Data not found with the given id!", 404);
        }
        
        const travel2: Travel = await this.repository.findOneBy({
            from: travel1.to,
            purpose: travel1.purpose,
            startDate: travel1.startDate,
            travelledDistance: travel1.travelledDistance,
            driver: { id: travel1.driver.id},
            car: { id: travel1.car.id}
        });
        if(!travel2){
            return errorHandler(res, "Driver with the car don't have a planed backway!", 404);
        }

        let travel2PatchProperties: Travel = {
            id: undefined,
            from: undefined,
            to: undefined,
            travelledDistance: undefined,
            newMileage: undefined,
            purpose: undefined,
            startDate: undefined,
            driver: undefined,
            car: undefined
        };
        const travel1SmallerPair = travel1.newMileage < travel2.newMileage;
        let patchableCarId = travel1.car.id;
        let startMileage = (travel1SmallerPair ? travel1.newMileage : travel2.newMileage) - travel1.travelledDistance;

        if(req.body.from && req.body.from !== travel1.from){
            travel2PatchProperties.to = req.body.from;
        }
        if(req.body.to && req.body.to !== travel1.to) {
            travel2PatchProperties.from = req.body.to;
        }
        if(req.body.carId && req.body.carId !== travel1.car.id) {
            const car : Car = await this.carRepository.findOneBy({id: req.body.carId});
            if(!car) {
                return errorHandler(res, "Car with the given id does not exists!", 404);
            }
            patchableCarId = car.id;

            //Update | azok az autók kilóméteróra állását ahonnan kivesszük (csökkenteni)
            try {
                await this.changeMileageAbove(travel1.car.id, -(travel1.travelledDistance*2), travel1.newMileage, null);
            } catch(err){
                return errorHandler(res, "Error at car change (origin change)!", 500);
            }

            //A kilóméteróra állást az új autónál kiszámolni az adott dátumhoz
            try {
                startMileage = await this.getHighestMileage(patchableCarId, car.mileage, travel1.startDate);
            }catch(err) {
                return errorHandler(res, "Error at new Mileage calculation!", 500);
            }
            if(travel1SmallerPair){
                req.body.newMileage = startMileage + travel1.travelledDistance;
                travel2PatchProperties.newMileage = startMileage + (2*travel1.travelledDistance);
            } else {
                req.body.newMileage = startMileage + (2*travel1.travelledDistance);
                travel2PatchProperties.newMileage = startMileage + travel1.travelledDistance;
            }

            //Update | azok az autók kilóméteróra állását ahova berakjuk (növelni)
            try {
                await this.changeMileageAbove(patchableCarId, (travel1.travelledDistance*2), startMileage, null);
            } catch(err){
                return errorHandler(res, "Error at car change (new change)!", 500);
            }

            //Beállítani lementésre
            travel2PatchProperties.car = car;
            req.body.car = car;
        }
        if(req.body.driverId && req.body.driverId !== travel1.driver.id){
            const driver : Driver = await this.driverRepository.findOneBy({id: req.body.driverId});
            if(!driver) {
                return errorHandler(res, "Driver with the given id does not exists!", 404);
            }
            if(this.licenseExpired(driver.driverLicenseExpiration)){
                return errorHandler(res, "Driver's license is expired!", 400);
            }

            travel2PatchProperties.driver = driver;
            req.body.driver = driver;
        }
        if(req.body.startDate && req.body.startDate !== travel1.startDate) {
            //Update azokat, amik a régi és a beállított érték között van
            // Időben előrébb lett rakva az utazás -> csökkenteni kell az utazás hosszával a dolgokat
            if(new Date(travel1.startDate) < new Date(req.body.startDate)){
                try{
                    await this.changeMileageInterval(patchableCarId, -(travel1.travelledDistance*2), travel1.startDate, new Date(req.body.startDate));
                }catch(err) {
                    return errorHandler(res, "Error at start date change (if branch)!", 500);
                }
            }//Időben visszább lett rakva az utazás -> növelni kell az utazás hosszával
            else {
                try{
                    await this.changeMileageInterval(patchableCarId, (travel1.travelledDistance*2), new Date(req.body.startDate), travel1.startDate);
                }catch(err) {
                    return errorHandler(res, "Error at start date change (else branch)!", 500);
                }
            }
            //Kilóméteróra állásokat újraszámolni
            try {
                startMileage = await this.getHighestMileage(patchableCarId, travel1.car.mileage, new Date(req.body.startDate));
            } catch(err) {
                return errorHandler(res, "Error during mileage recalculate at start date change!", 500);
            }
            //Beállítani
            if(travel1SmallerPair){
                req.body.newMileage = startMileage + travel1.travelledDistance;
                travel2PatchProperties.newMileage = startMileage + (2*travel1.travelledDistance);
            } else {
                req.body.newMileage = startMileage + (2*travel1.travelledDistance);
                travel2PatchProperties.newMileage = startMileage + travel1.travelledDistance;
            }
            travel2PatchProperties.startDate = req.body.startDate;
        }
        if(req.body.travelledDistance && req.body.travelledDistance !== travel1.travelledDistance) {
            const mileageDifference = req.body.travelledDistance - travel1.travelledDistance;

            //Update adatbázisba levő értékeket
            try {
                await this.changeMileageAbove(patchableCarId, (mileageDifference*2), startMileage, null);
            }catch(err) {
                return errorHandler(res, "Error during mileage update!", 500);
            }
            
            //Beállítás mentésre

            if(travel1SmallerPair){
                req.body.newMileage = startMileage + req.body.travelledDistance;
                travel2PatchProperties.newMileage = req.body.newMileage + req.body.travelledDistance;
            } else {
                travel2PatchProperties.newMileage = startMileage + req.body.travelledDistance;
                req.body.newMileage = travel2PatchProperties.newMileage + req.body.travelledDistance;
            }
            travel2PatchProperties.travelledDistance = req.body.travelledDistance;
        }
        if(req.body.purpose && req.body.purpose !== travel1.purpose){
            travel2PatchProperties.purpose = req.body.purpose;
        }

        const travel1Patch = this.repository.create(req.body);
        const travel2Patch = this.repository.create(travel2PatchProperties);
        try {
            await this.repository.update({id: travel1.id}, travel1Patch)
            await this.repository.update({id: travel2.id}, travel2Patch);
            res.status(200).send({patched: true});
        }catch(err) {
            errorHandler(res, "BAD_REQUEST_No values to change!",400);
        }
    }

    monthlyReport = async (req: Request, res: Response) => {
        if(!req.query.year || !req.query.month || !req.query.licensePlate) {
            return errorHandler(res, "Required parameters are missing!", 404);
        }

        const licenseNumber : string = String(req.query.licensePlate);

        const unfilteredTravels: Travel[] = await this.repository.findBy(
        {
            car : { 
                licensePlate: licenseNumber
            }
        });
        if(unfilteredTravels.length <= 0){
            return errorHandler(res, "There are no travel information of the car with such license number!", 404);
        }

        let year : number = Number(req.query.year),
            month : number = Number(req.query.month)-1;

        const dateBelowValues = new Date(year, month);
        month++;
        const dateAboveValues = new Date(year, month);
        const travels: Travel[] = unfilteredTravels.filter((value) => {
            return (new Date(value.startDate) > dateBelowValues && new Date(value.startDate) <= dateAboveValues)
        });

        if(travels.length < 1){
            return errorHandler(res,"NO_DATA", 404);
        }

        const car = unfilteredTravels[0].car;
        const lowestHighestMileage = this.lowestHighestPairs(travels);
        const privateSummary: Summary = this.costSummary(travels.filter((value) => {return value.purpose === Purpose.PRIVATE}), travels[0].car);
        const businesSummary: Summary = this.costSummary(travels.filter((value) => {return value.purpose === Purpose.BUSINESS}), travels[0].car);
        /*let travelsFromToLocation: string[] = [];
        for(let travel of travels) {
            travelsFromToLocation.push(travel.from+" - "+travel.to);
        }*/


        
        let monthlyReport : MonthlyReport = {
            car: car,
            startingMileage: lowestHighestMileage[0],
            finishingMileage: lowestHighestMileage[1],
            travels: travels,
            privateSummary: privateSummary,
            businessSummary: businesSummary
        };

        res.json(monthlyReport);
    }

    private lowestHighestPairs(travels: Travel[]) {
        let lowestMileage: number = travels[0].newMileage, highestMileage: number = 0;
        for(let travel of travels) {
            if(travel.newMileage < lowestMileage)
                lowestMileage = travel.newMileage;
            if(travel.newMileage > highestMileage)
                highestMileage = travel.newMileage;
        }
        return [lowestMileage, highestMileage];
    }

    private costSummary(travels: Travel[], car: Car): Summary {
        if(travels.length <= 0) {
            return {
                travelledDistance: 0,
                consumptionCost: 0,
                flatRate: 0,
                totalCost: 0}
        }

        const costOfFuel: number = 480,
              flatRate: number = 10,
              consumption: number = car.consumption;
        let summary: Summary;
        let fuelSum: number = 0;

        let distanceSum : number = 0;
        for(let travel of travels) {
            distanceSum += travel.travelledDistance;
        }
        fuelSum = consumption * (distanceSum / 100)

        summary = {
            travelledDistance: distanceSum,
            consumptionCost: costOfFuel*fuelSum,
            flatRate: flatRate*distanceSum,
            totalCost: (costOfFuel*fuelSum) + (flatRate*distanceSum)
        };

        return summary;
    }

    private licenseExpired(licenseDate: Date): boolean {
        if(new Date() > new Date(licenseDate)) {
            return true;
        }
        return false;
    }

    private changeMileageAbove = (carId: number, changeBy: number, above: number | null, aboveDate: string | null) => {
        if(above !== null && above !== undefined) {
            return this.repository.createQueryBuilder().update(
                {
                    newMileage: () => ("newMileage + "+changeBy)
                }).where("carId = :carId",{carId: carId}).
                andWhere("newMileage > :newMileage",{newMileage: above}).
                execute();
        }
        if(aboveDate !== null && aboveDate !== undefined) {
            return this.repository.createQueryBuilder().update(
                {
                    newMileage: () => ("newMileage + "+changeBy)
                }).where("carId = :carId",{carId: carId}).
                andWhere("startDate > :startDate",{startDate: aboveDate}).
                execute();
        }
    }

    private changeMileageInterval = (carId: number, changeBy: number, lowerLimit: Date, upperLimit: Date) => {
        return this.repository.createQueryBuilder().update(
            {
                newMileage: () => ("newMileage + "+changeBy)
            }).where("carId = :carId",{carId: carId}).
            andWhere("startDate > :lowerLimit",{lowerLimit : lowerLimit}).
            andWhere("startDate < :upperLimit", {upperLimit : upperLimit}).
            execute();
    }

    private getHighestMileage = (carId: number, defaultMileage : number = 0, date?: Date) => {
        if(date){
            return this.repository.find({
                select: ["newMileage"],
                where: {
                    car: {
                        id: carId
                    },
                    startDate: LessThanOrEqual(date),
                }
            }).then((values)=> {
                let highest = -1;
                for(let value of values){
                    if(value.newMileage > highest){
                        highest = value.newMileage;
                    }
                }
                return highest;
            }).then((value) => {
                if(value === -1){
                    return defaultMileage;
                }
                return value;
            });
        }
        return this.repository.find({
            select: ["newMileage"],
            where: {
                car: {
                    id: carId
                }
            }
        }).then((values)=> {
            let highest = -1;
            for(let value of values){
                if(value.newMileage > highest){
                    highest = value.newMileage;
                }
            }
            return highest;
        }).then((value) => {
            if(value === -1){
                return defaultMileage;
            }
            return value;
        });
    }
}