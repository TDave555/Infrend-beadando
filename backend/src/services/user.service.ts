import { Request, Response } from "express";
import { DataSource, Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { User } from "../entities/User";
import { errorHandler } from "./service";
import { config } from "../jwt-config";


export class UserService {
    private repository: Repository<User>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(User);
    }

    getAll = async(req: Request, res: Response) => {
        try{
            const entites = (await this.repository.find()).map((value) => {
                return {
                    id: value.id,
                    nickname: value.nickname,
                    email: value.email,
                    role: value.role
                }
            });
            res.json(entites);
        } catch(err) {
            errorHandler(res);
        }
    }

    login = async(req: Request, res: Response) => {
        const user = await this.repository.findOneBy({email: req.body.email});
        if(!user) {
            return errorHandler(res, "User doesn't exists!", 404);
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash("password", salt);
        console.log("hashPassword:",hashPassword);

        const isPasswordOk : boolean = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordOk) {
            return errorHandler(res, "Password is not correct!", 400);
        }

        const token = jwt.sign({id: user.id, role: user.role}, config.secret, {expiresIn: config.expiration});
        res.json({
            message: "Login is successful!", 
            auth_token: token, 
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                role: user.role
            }
        });
    };

    signup = async(req: Request, res: Response) => {
        const email = await this.repository.findOneBy({email: req.body.email});
        if(email) {
            return errorHandler(res, "Email is already under use!", 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const newUser : User = {
            id: 0,
            nickname: req.body.nickname,
            email: req.body.email,
            password: hashPassword,
            role: req.body.role
        };

        const createdUser = this.repository.create(newUser);
        try {
            const userFromDb = await this.repository.save(createdUser);
            res.json({message: "Sign up is completed!", user: {
                id: userFromDb.id,
                nickname: userFromDb.nickname,
                email: userFromDb.email,
                role: userFromDb.role
            }});
        } catch(err) {
            errorHandler(res, "Couldn't registrate new user!", 500);
        }
    };

    remove = async(req: Request, res: Response) => {
        const userId = req.params.id;
        if(!userId || isNaN(Number(userId)) || Number(userId) < 1) {
            return errorHandler(res, "User id is required to delete one user!", 400);
        }

        const userExists = await this.repository.findOneBy({id: Number(userId)});
        if(!userExists) {
            return errorHandler(res, "User doesn't exists!", 404);
        }

        try {
            const result = await this.repository.delete(userExists);
            console.log("\nResult:",result);
            res.json({message: "USer is deleted from the database!"});
        } catch(err) {
            return errorHandler(res, "Couldn't delete user!", 500);
        }
    };

    changePassword = async(req: Request, res: Response) => {
        res.json({message: "in change password node", reqbody: req.body});
    };
}