import { QueryFailedError, Repository } from "typeorm";
import { NextFunction, Request, Response} from 'express';


export abstract class Service {
    repository: Repository<any>;

    findAll = async (req: Request, res: Response) => {
        try {
            const entities = await this.repository.find();
            res.json(entities);
        } catch(err) {
            console.log(err);
            errorHandler(res);
        }
    }

    save = async (req: Request, res: Response) => {
        if(req.body.id) {
            const data = this.repository.findOneBy({id: req.body.id});
            if(data){
                return errorHandler(res, "Can't save this data with an already existing id!", 400);
            }
        }

        const entity = this.repository.create(req.body);
        if(!entity) {
            return errorHandler(res, "Data properties do not match!", 404);
        }

        try {
            await this.repository.save(entity);
            res.status(201).json({id: entity.id, saved: true});
        }catch(err) {
            if(err instanceof QueryFailedError) {
                if(err.message.includes("Duplicate entry")){
                    return errorHandler(res, "Data with similar properties already exists!", 400);
                } 
            }
            console.log(err);
            errorHandler(res);
        }
    }

    //Paraméterben ID
    update = async (req: Request, res: Response) => {
        const data = await this.repository.findOneBy({id: req.params.id});
        if(!data){
            return errorHandler(res, "Data does not exists with the given id!", 404);
        }
        
        req.body.id = Number(req.params.id);
        const entity = this.repository.create(req.body);
        if(!entity) {
            return errorHandler(res, "Data properties do not match!", 406);
        }
        
        try{
            await this.repository.save(entity);
            res.status(200).json({id: entity.id, updated: true});
        }catch(err) {
            console.log(err);
            errorHandler(res);
        }
    }

    //Paraméterben ID
    patch = async (req: Request, res: Response) => {
        if(!req.body) {
            return errorHandler(res, "Necesary informations are not given!", 400);
        }

        const data = await this.repository.findOneBy({id: req.params.id});
        if(!data){
            return errorHandler(res, "Data not found with the given id!", 404);
        }
        
        const entity = this.repository.create(req.body);
        if(!entity) {
            return errorHandler(res, "Data properties do not match!", 406);
        }

        try {
            await this.repository.update({id: req.params.id}, entity);
            res.status(200).json({id: entity.id, patched: true});
        } catch(err) {
            console.log(err);
            errorHandler(res);
        }
    }

    //Paraméterben ID
    delete = async (req: Request, res: Response) => {
        const data = await this.repository.findOneBy({id: req.params.id});
        if(!data){
            return errorHandler(res, "Data not found with the given id!", 404);
        }
        try {
            await this.repository.delete(data);
            res.status(200).json({id: data.id, deleted: true});
        } catch(err) {
            console.log(err);
            errorHandler(res);
        }
    }

    checkParamId(req: Request, res: Response, next: NextFunction) {
        if(!req.params.id || isNaN(Number(req.params.id))){
            return errorHandler(res, "Parameter 'id' is not given!", 400);
        }
        next();
    }
}

export function errorHandler(res: Response, message : string = 'Error occurred in the server!', status : number = 500) {
    console.log("Message:",message,"\n\tStatus code:",status,"\n");
    res.status(status).send(message);
}