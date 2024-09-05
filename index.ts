import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {NextFunction, Request, Response} from "express";
import StatusCodes from "http-status-codes";

import MongoManager from './managers/mongo';
import NoteRouter from './routers/note';

void MongoManager.init()
dotenv.config();
const app = express();

const corsOptions = {
    origin: 'https://acst.me',
    optionsSuccessStatus: 200
}

// Middlewares.
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// Routes.
app.use("/note", NoteRouter);

// Default error handler.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
    console.error(err);
});

const port = process.env.PORT || 8080;
// Start the server.
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

async function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    await MongoManager.close();
    process.exit(0);
}
