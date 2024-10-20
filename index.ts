import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {NextFunction, Request, Response} from "express";
import StatusCodes from "http-status-codes";

import MongoManager from './managers/mongo';
import NoteRouter from './routers/note';
import UserRouter from './routers/user';
import AuthRouter from './routers/auth';
import WatchRouter from './routers/ex/watch';
import './managers/passport';
// import {addDungeonMeshi} from "./managers/ex/u3m8";
// import {addLangYaBang2Mappings} from "./managers/ex/u3m8";
// import {addTangBoHu} from "./managers/ex/u3m8";

void MongoManager.init()
dotenv.config();
const app = express();

const corsOptions = {
    origin: ['https://acst.me', 'http://localhost:3000'],
    optionsSuccessStatus: 200
}

// Middlewares.
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));

// Routes.
app.use("/note", NoteRouter);
app.use("/user", UserRouter);
app.use("/auth", AuthRouter);
app.use("/watch", WatchRouter);

// Default error handler.
app.use((err: Error, _1: Request, res: Response, _2: NextFunction) => {
    if (err.message === "Unauthorized") {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: err.message});
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
    console.error(err);
});

const port = process.env.PORT || 8080;
// Start the server.
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

    // setTimeout(addLangYaBang2Mappings, 3000);
    // setTimeout(addDungeonMeshi, 3000);
    // setTimeout(addTangBoHu, 3000);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

async function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    await MongoManager.close();
    process.exit(0);
}
