import { NextFunction, Request, Response } from "express";
import { Role } from "../entities/User";
import { errorHandler } from "../services/service";
import * as jwt from 'jsonwebtoken';
import { config } from "../jwt-config";

export function isAdmin(req, res: Response, next: NextFunction) {
    const auth = req.auth;
    if(!auth) {
        return errorHandler(res, "Acces_denied!", 401);
    }

    if(auth.role !== "admin") {
        return errorHandler(res, "ACCES_DENIED!", 401);
    }

    next();
}

export function validSignUpUser(req: Request, res: Response, next: NextFunction) {
    if(!req.body.nickname ||
        req.body.nickname.length < 2 ||
        req.body.nickname.length > 64) {
        return errorHandler(res, "Nickname is required!", 400);
    }
    if(!isEmailValid(String(req.body.email))) {
        return errorHandler(res, "Email is required and must be valid!", 400);
    }
    if(!isPasswordValid(String(req.body.password))) {
        return errorHandler(res, "Password is required and must be at least 6 character long!", 400);
    }
    if(!req.body.role ||
       !validRole(String(req.body.role))) {
        return errorHandler(res, "Role is required and must be an already existing one!", 400);
    }

    next();
}

export function validLoginUser(req: Request, res: Response, next: NextFunction) {
    if(!isEmailValid(String(req.body.email))) {
        return errorHandler(res, "Email is required and must be valid!", 400);
    }
    if(!isPasswordValid(String(req.body.password))) {
        return errorHandler(res, "Password is required and must be at least 6 character long!", 400);
    }

    next();
}

export function isLogedIn(req, res: Response, next: NextFunction) {
    const token = req.header('auth_token');             //Token the user got when signed in
    const userId = Number(req.header('auth_ext'));      //Current user's id
    if(!token) {
        return errorHandler(res, "Acces denied!", 401);
    }

    try {
        const payload : any = jwt.verify(token, config.secret);
        if(payload.id !== userId) {
            return errorHandler(res, "Acces Denied!", 401); 
        }
        
        req.auth = payload;
        next();
    } catch(err) {
        return errorHandler(res, "Couldn't grant access!", 401);
    }
}

function isEmailValid(email: string) {
    return (email && validEmail(email));
}

function isPasswordValid(password: string) {
    return (password && password.length >= 6 && password.length <= 128);
}

function validRole(role: string) {
    for(let enumRole in Role){
        if(role === enumRole.toLowerCase()){
            return true;
        }
    }

    return false;
}

function validEmail(email: string) {
    const regex = /^([a-zA-Z\d._\-áÁéÉíÍóÓüÜöÖűŰúÚőŐ]{4,})@([a-zA-Z._\-]{3,}).([a-zA-Z]{2,4})$/;
    if(email.match(regex)){
        return true;
    }

    return false;
}