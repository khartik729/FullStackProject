
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
 *@module resolvers/PostResolver
 */

 import {Arg, Field, InputType, Int, Mutation, Query, Resolver} from "type-graphql";
 import {Post} from "../entity/Post";
import {getConnection} from "typeorm";

@InputType()
class PostFields {
  @Field()
  title: string;

  @Field()
  body: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field()
  featured: boolean;

  @Field()
  author: number;
}

@Resolver()
export class PostResolver {


  /**
   * @function getPosts
   *@return { [Post] }
   */

  @Query(() => [Post])
  getPosts() {
    return Post.find();
  }

  @Query(() => Post, { nullable: true})
  getAPost(@Arg('id', () => Int) id: number): Promise<Post | undefined>{
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("input") input: PostFields): Promise<Post> {

    // try {
    //   await Post.insert({
    //     title: title,
    //     description: description,
    //     body: body,
    //     category: category,
    //     featured: featured,
    //     author: author
    //   })
    // } catch (err) {
    //   console.error(err);
    // }

    return Post.create({
      ...input,
    }).save();
  }

  @Mutation(() => Post)
  async updatePost(@Arg('id', () => Int) id: number, @Arg('description', () => String) description: string, @Arg('body', () => String) body: string, @Arg('featured', () => Boolean) featured: boolean) {
    const result = await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({description, body, featured})
        .where('id = :id', {id})
        .returning("*")
        .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => Int) id: number): Promise<boolean>{
    try{
      await Post.delete({ id });
    }catch (err){
      console.error(err);
      return false;
    }
    return true;
  }
}
