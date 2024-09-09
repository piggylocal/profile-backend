import express from "express";
import StatusCodes from "http-status-codes";

import MongoManager from '../managers/mongo';
import {VisitorLog} from "../dto/user";

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

export default router;