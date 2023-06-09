import { DataSource } from "typeorm"
import { Car } from "./entities/Car"
import { Driver } from "./entities/Driver"
import { Travel } from "./entities/Travel"
import { User } from "./entities/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3308,
    username: "root",
    password: "",
    database: "infrend_beadando",
    synchronize: true,
    logging: false,
    entities: [
      Driver,
      Car,
      Travel,
      User
    ],
    migrations: [],
    subscribers: [],
})
