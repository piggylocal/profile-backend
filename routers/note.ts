import express from "express";
import StatusCodes from "http-status-codes";

import MongoManager from '../managers/mongo';

const router = express.Router();

router.get("/:_id", async (req, res, next) => {
    const {_id} = req.params;
    const noteId = parseInt(_id);
    try {
        const note = await MongoManager.getNoteById(noteId);
        if (note === null) {
            res.status(StatusCodes.NOT_FOUND).json({message: `Note with id ${noteId} not found`});
            return;
        }
        res.status(StatusCodes.OK).json(note);
    } catch (err) {
        next(err);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const notes = await MongoManager.getAllNotes();
        res.status(StatusCodes.OK).json(notes);
    } catch (err) {
        next(err);
    }
});

export default router;