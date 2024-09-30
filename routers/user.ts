import express from "express";
import StatusCodes from "http-status-codes";
import passport from "passport";

import MongoManager from '../managers/mongo';
import {hashPasswordSync, comparePasswordSync} from "../managers/bcrypt";
import {VisitorLog} from "../dto/user";
import {createToken} from "../managers/jwt";

const router = express.Router();

router.post("/visitor-log", async (req, res, next) => {
    try {
        const log: VisitorLog = {
            ip: req.body.ip || "",
            pathname: req.body.pathname || "",
            time: new Date(req.body.time) || new Date()
        }
        const ok = await MongoManager.postVisitorLog(log);
        if (ok) {
            res.status(StatusCodes.CREATED).json({message: "Log created"});
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to create log"});
        }
    } catch (err) {
        next(err);
    }
});

// User registration is not allowed.
/* router.post("/register", async (req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Username and password are required"
        });
    }
    try {
        const existingUser = await MongoManager.getUserByName(username);
        if (existingUser !== null) {
            return res.status(StatusCodes.CONFLICT).json({
                message: `User with username ${username} already exists`
            });
        }
    } catch (err) {
        return next(err);
    }
    const user = {
        username,
        ciphertext: hashPasswordSync(password)
    };
    try {
        const ok = await MongoManager.postUser(user);
        if (ok) {
            res.status(StatusCodes.CREATED).json({message: "User created"});
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to create user"});
        }
    } catch (err) {
        next(err);
    }
}); */

router.post("/login", async (req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Username and password are required"
        });
    }
    try {
        const user = await MongoManager.getUserByName(username);
        if (user === null || !comparePasswordSync(password, user.ciphertext)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Username or password is incorrect"
            });
        }
        // Password is correct.
        const token = "Bearer " + createToken(username);
        res.status(StatusCodes.OK).json({token});
    } catch (err) {
        next(err);
    }
});

router.get(
    "/pv",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res, next) => {
        try {
            const pv = await MongoManager.getPV();
            res.status(StatusCodes.OK).json({pv});
        } catch (err) {
            next(err);
        }
    }
);

export default router;