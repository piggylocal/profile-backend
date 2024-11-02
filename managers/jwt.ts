import jwt from 'jsonwebtoken';
import {nanoid} from "nanoid";

export const createToken = (username: string): string => {
    return jwt.sign({username}, process.env.JWT_SECRET as string);
};

export const createOAuthState = (username: string, origin?: string): string => {
    return jwt.sign({username, id: nanoid(), ...(origin && {origin})}, process.env.JWT_SECRET as string);
}

export const verifyOAuthState = (state: string): {username: string} | undefined => {
    try {
        return jwt.verify(state, process.env.JWT_SECRET as string) as {username: string};
    } catch (err) {
        console.log(err);
        return;
    }
};