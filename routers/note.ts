import express from "express";
import StatusCodes from "http-status-codes";
import passport from "passport";

import MongoManager from '../managers/mongo';
import {Note} from "../dto/note";
import {jwtAdmin} from "../managers/passport";

const router = express.Router();

router.get("/:_id", async (req, res, next) => {
    const {_id} = req.params;
    const noteId = parseInt(_id);
    try {
        const note = await MongoManager.getNoteById(noteId);
        if (note === null) {
            return res.status(StatusCodes.NOT_FOUND).json({message: `Note with id ${noteId} not found`});
        }
        res.status(StatusCodes.OK).json(note);
    } catch (err) {
        next(err);
    }
});

router.get("/", async (_, res, next) => {
    try {
        const notes = await MongoManager.getNoteInfos();
        res.status(StatusCodes.OK).json(notes);
    } catch (err) {
        next(err);
    }
});

router.get("/categories/:category", async (req, res, next) => {
    const {category} = req.params;
    try {
        const notes = await MongoManager.getNoteInfos(category);
        res.status(StatusCodes.OK).json(notes);
    } catch (err) {
        next(err);
    }
});

router.post(
    "/",
    passport.authenticate(jwtAdmin, {session: false, failWithError: true}),
    async (req, res, next) => {
        let {author, title, categories, keywords, content} = req.body;
        const maxId = await MongoManager.getNoteMaxId();
        if (maxId < 0) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to get max note id"});
        }
        const id = maxId + 1;
        if (!author) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Author is required"});
        }
        if (!title) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Title is required"});
        }
        categories ||= [];
        keywords ||= [];
        content ||= "";

        const note: Note = {id, author, title, categories, keywords, content}
        try {
            const success = await MongoManager.postNote(note);
            if (!success) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to post note"});
            }
            res.status(StatusCodes.CREATED).json({message: "Note posted"});
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    "/:_id",
    passport.authenticate(jwtAdmin, {session: false, failWithError: true}),
    async (req, res, next) => {
        const {_id} = req.params;
        const noteId = parseInt(_id);
        try {
            const success = await MongoManager.deleteNoteById(noteId);
            if (!success) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to delete note"});
            }
            res.status(StatusCodes.OK).json({message: "Note deleted"});
        } catch (err) {
            next(err);
        }
    }
);


export default router;