import jwt from 'jsonwebtoken';
import {nanoid} from "nanoid";

export const createToken = (username: string): string => {
    return jwt.sign({username}, process.env.JWT_SECRET as string);
};

export const createOAuthState = (username: string): string => {
    return jwt.sign({username, id: nanoid()}, process.env.JWT_SECRET as string);
}