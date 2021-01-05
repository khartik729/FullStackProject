/**
 * @license
 * Copyright (c) 2015 Khartik Uppalapati.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { UserResolver } from './resolvers/UserResolver';
import { buildSchema } from "type-graphql";
import {createConnection} from "typeorm";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import {verify} from "jsonwebtoken";
import {createAccessToken, createRefreshToken} from "./auth";
import {User} from "./entity/User";
import {sendRefreshToken} from "./sendRefreshToken";
import {PostResolver} from "./resolvers/PostResolver";

(async () => {

    const app = express();
    app.use(cookieParser());
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid;
        if(!token) {
            return res.send({ok: false, accessToken: ''})
        }

        let payload: any = null

        try{
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        }catch (err){
            console.error(err);
            return res.send({ ok: false, accessToken: "" });
        }

        const user = await User.findOne({ id: payload.userId });

        if(!user){
            return res.send({ ok: false, accessToken: ""});
        }

        if(user.tokenVersion !== payload.tokenVersion){
            return res.send({ ok: false, accessToken: "" });
        }

        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user)});
    });

    await createConnection();


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
          resolvers: [UserResolver, PostResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log(`Server started on ${process.env.PORT || 4000}`);
    });
})()
