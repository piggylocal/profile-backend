import {Strategy} from "passport";
import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";

import MongoManager from "./mongo";

const createJwtStrategy = (usernameCheck?: (username: string) => boolean): Strategy => new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string
}, async (jwtPayload, done) => {
    try {
        const user = await MongoManager.getUserByName(jwtPayload.username);
        if (user === null) {
            return done(null, false);
        }
        if (usernameCheck && !usernameCheck(user.username)) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
});

export {createJwtStrategy};