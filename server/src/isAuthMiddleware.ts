import {MiddlewareFn} from "type-graphql";
import {MyContext} from "./entity/types";
import {verify} from "jsonwebtoken";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];

    if(!authorization){
        throw new Error("The user is not authenticated");
    }

    try{
        const token = authorization.split(' ')[1]
        const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        context.payload = payload as any;
    }catch (err) {
        console.error(err)
        throw new Error("The user is not authenticated");
    }
    return next()
}
