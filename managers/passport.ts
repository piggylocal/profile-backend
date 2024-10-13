import passport, {Strategy} from "passport";
import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";

import MongoManager from "./mongo";

const jwtAdmin = "jwt-admin";
const jwtWatch = "jwt-watch";

const createJwtStrategy = (usernameCheck?: (username: string) => boolean): Strategy => new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string
}, async (jwtPayload, done) => {
    try {
        const user = await MongoManager.getUserByName(jwtPayload.username);
        if (user === null) {
            return done(null, false);
        }
        // The admin user has the top-level access.
        if (user.username === process.env.USER_ADMIN) {
            return done(null, user);
        }
        if (usernameCheck && !usernameCheck(user.username)) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
});

passport.use(jwtAdmin, createJwtStrategy((username) => username === process.env.USER_ADMIN));
passport.use(jwtWatch, createJwtStrategy((username) => username === process.env.USER_WATCH));

export {jwtAdmin, jwtWatch};