import "reflect-metadata"
import { AppDataSource } from "./data-source";
import * as express from 'express';
import * as cors from 'cors'; 
import { getDriverRoute } from "./routes/driver.route";
import { DataSource } from "typeorm";
import { getCarRoute } from "./routes/car.route";
import { getTravelRoute } from "./routes/travel.route";
import { getUserRoute } from "./routes/user.route";
import { isLogedIn } from "./validators/user.validator";

AppDataSource.initialize().then(async (dataSource : DataSource) => {
    console.log('Connected to DB!');
    const app = express();
    //const entityManager = AppDataSource.createEntityManager();

    app.use(cors());
    app.use(express.json());
    
    app.use('/api/driver', isLogedIn, getDriverRoute(dataSource));
    app.use('/api/car', isLogedIn, getCarRoute(dataSource));
    app.use('/api/travel', isLogedIn, getTravelRoute(dataSource));
    app.use('/api/user', getUserRoute(dataSource));
    app.get('/', (req, res) => {
        res.status(200).send('<div style="text-align:center; height: 100vh; vertical-align: center"><h1>Root of API</h1></div>');
    })

    const port = process.env.port || 3000;
    app.listen(port, () => {
        console.log('Server listening on port:',port);
    });

}).catch(error => {
    if(error instanceof Error){
        console.log(error.message.includes("ECONNREFUSED") ? "Couldn't connect to the database!" : error);
    } else {
        console.log(error)
    }
});


