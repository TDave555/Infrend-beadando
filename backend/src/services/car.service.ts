import { DataSource } from "typeorm";
import { Car } from "../entities/Car";
import { Service } from "./service";

export class CarService extends Service {
    constructor(dataSource: DataSource){
        super();
        this.repository = dataSource.getRepository(Car);
    }
}