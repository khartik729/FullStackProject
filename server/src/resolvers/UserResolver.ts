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

/**
 *
 *@module resolvers/UserResolver
 */

import {Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int} from "type-graphql";
import {User} from "../entity/User";
import argon2 from "argon2";
import {MyContext} from "../entity/types";
import {createAccessToken, createRefreshToken} from "../auth";
import {isAuth} from "../isAuthMiddleware";
import {sendRefreshToken} from "../sendRefreshToken";
import {getConnection} from "typeorm";
import {sendEmail} from "../sendEmail";

@ObjectType()
class LoginResponse {

    /**
     * @param { string } accessToken is the accessToken
     */

    @Field()
    accessToken: string;
}

@Resolver()
export class UserResolver{

    /**
     * @function users
     * @return { [User] } an array of all of the users
     */

 @Query(() => [User])
 users(){
   return User.find();
 }

 @Query(() => String)
 @UseMiddleware(isAuth)
 bye(@Ctx() {payload}: MyContext){
     return `jkdhwejklhjklhwdhwelhfcwhljkwhlkhklfhclkwhlefeklf, your user id is ${payload!.userId} `
 }


 @Mutation(() => Boolean)
 async revokeRefreshTokensForUser(@Arg ('userId', () => Int) userId: number){
   await getConnection()
   .getRepository(User)
   .increment({ id: userId }, "tokenVersion", 1);

   return true
 }
  @Mutation(() => LoginResponse)

  /**
   * @async
   * @function login
   * @param { string } email is the users email
   * @param { string } password is the users password
   * @return { Promise<LoginResponse> } which is the accessToken
   */

  async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() { res }: MyContext ): Promise<LoginResponse> {

      /**
       * @param { User } user is the user we are trying to log in
       */

    const user = await User.findOne({ where: { email }});

    if(!user){
      throw new Error("Could not find the user.")
    }

      /**
       * @param { boolean } valid is to see if the password entered by the user matches the real password
       */

    const valid = await argon2.verify(user.password, password);

    if(!valid) {
        throw new Error("The password you entered is incorrect");
    }

    if(!user.confirmed) {
        throw new Error("Please check your email to confirm your email")
    }

    sendRefreshToken(res, createRefreshToken(user));

      /**
       * @returns { LoginResponse } LoginResponse the accessToken means that if they don't go on the website for 240 days as we specified, then it will make them log in again.
       */

    return{
        accessToken: createAccessToken(user)
    };
  }
    /**
     *
     * @async
     * @function register
     * @param { string } email is the users email
     * @param { string } password
     * @return { boolean }
     */

    @Mutation(() => Boolean)
    async register(@Arg('email') email: string, @Arg('password') password: string) {

        /**
         * @param { string } hashedPassword is the hashed password
         */

        const hashedPassword = await argon2.hash(password);

        try{
            await User.insert({
                email: email,
                password: hashedPassword,
            });

            sendEmail(email);

        }catch (err) {
            console.error(err);
            return false;
        }

        return true;
    }

}
