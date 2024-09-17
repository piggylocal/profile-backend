import jwt from 'jsonwebtoken';

const createToken = (username: string): string => {
    return jwt.sign({username}, process.env.JWT_SECRET as string);
};

export {createToken};