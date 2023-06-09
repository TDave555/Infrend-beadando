import { DataSource} from "typeorm";
import { Router } from "express";
import { DriverService } from "../services/driver.service";
import { allPropertyValid, givenPropertyValid } from "../validators/driver.validator"
import { isAdmin } from "../validators/user.validator";

export function getDriverRoute(dataSource : DataSource) : Router {
    const router = Router();
    const driverService = new DriverService(dataSource);

    router.get('/', driverService.findAll);
    router.get('/notexpired', driverService.findAllNotExpired);
    router.post('/', isAdmin, allPropertyValid, driverService.save);
    router.put('/:id', isAdmin, driverService.checkParamId, allPropertyValid, driverService.update);
    router.patch('/:id', isAdmin, driverService.checkParamId, givenPropertyValid, driverService.patch);
    router.delete('/:id', isAdmin, driverService.checkParamId, driverService.delete);

    return router;
}