import { DataSource } from "typeorm";
import { Router } from "express";
import { CarService } from "../services/car.service";
import { allPropertyValid, givenPropertyValid } from "../validators/car.validator";
import { isAdmin } from "../validators/user.validator";

export function getCarRoute(dataSource : DataSource) : Router {
    const router = Router();
    const carService = new CarService(dataSource);

    router.get('/', carService.findAll);
    router.post('/', isAdmin, allPropertyValid, carService.save);
    router.put('/:id', isAdmin, carService.checkParamId, allPropertyValid, carService.update);
    router.patch('/:id', isAdmin, carService.checkParamId, givenPropertyValid, carService.patch);
    router.delete('/:id', isAdmin, carService.checkParamId, carService.delete);

    return router;
}