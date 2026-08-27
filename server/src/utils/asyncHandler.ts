import type { Request, Response, NextFunction } from "express";

export const asyncHandler = (requestHandler : any) =>{
    return(req: Request, res: Response, next: NextFunction) =>{  
        Promise.resolve(requestHandler(req, res, next))     //it returns a promise
        .catch((err) => next(err));                         // if everything went right then ok not pass the err
    }
}
