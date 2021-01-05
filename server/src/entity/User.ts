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
 * @module entity/User
 */

import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm";
import {ObjectType, Field, Int} from "type-graphql";
import {Post} from "./Post";

@ObjectType()
@Entity("users")
export class User extends BaseEntity{

    /**
     * @param { number } id is the users id, can be queried for
     */

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @param { string } email is the users email, can be queried for
     */

    @Field(() => String)
    @Column("text")
    email: string;

    /**
     * @param { string } password is the users password, can't be queried for
     */

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @Column("text")
    password: string;

    @Column("int", { default: 0})
    tokenVersion: number;

    @Field()
    @Column('bool', { default: false })
    confirmed: boolean;

}
