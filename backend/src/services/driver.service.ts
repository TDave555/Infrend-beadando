import { Request, Response } from "express-serve-static-core";
import { DataSource, MoreThanOrEqual } from "typeorm";
import { Driver } from "../entities/Driver";
import { errorHandler, Service } from "./service";

export class DriverService extends Service {
    constructor(dataSource: DataSource){
        super();
        this.repository = dataSource.getRepository(Driver);
    }

    findAllNotExpired = async (req: Request, res: Response) => {
        if(!req.query.expDate){
            return errorHandler(res, "Neccessary parameters are missing!", 400);
        }

        const expirationDate : string = String(req.query.expDate);
        const validDateRegex = /^([1-2][0-9]{3}[-](([1-9])|([1][0-2]))[-](([1])|([1-2]{0,1}[0-9])|([3][0-1])))$/;
        if(!expirationDate.match(validDateRegex)){
            return errorHandler(res, "The parameter is not a valid date!", 400);
        }

        try {
            const entities = await this.repository.findBy({
                driverLicenseExpiration: MoreThanOrEqual(expirationDate)
            });
            res.status(200).json(entities);
        } catch(err) {
            errorHandler(res);
        }
    }
}