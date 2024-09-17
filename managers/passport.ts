import passport from "passport";
import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";

import MongoManager from "./mongo";

const useJwtStrategy = () => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string
    }, async (jwtPayload, done) => {
        try {
            const user = await MongoManager.getUserByName(jwtPayload.username);
            if (user === null) {
                return done(null, false);
            }
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));
};

export {useJwtStrategy};