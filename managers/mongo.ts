import dotenv from 'dotenv';
import {MongoClient, Collection, Document} from 'mongodb';

import {Note, NoteInfo} from '../dto/note';

dotenv.config();

class Manager {
    static async init(): Promise<null> {
        if (Manager.initStarted) {
            return null;
        }
        Manager.initStarted = true;
        await Manager.client.connect();
        const db = Manager.client.db(process.env.MONGO_DB_NAME);
        Manager.collection = db.collection(process.env.MONGO_COLLECTION_NAME as string);
        console.log("Connected to MongoDB");
        return null;
    }

    static async close(): Promise<null> {
        if (!Manager.initStarted) {
            return null;
        }
        Manager.collection = null;
        await Manager.client.close();
        Manager.initStarted = false;
        console.log("Disconnected from MongoDB");
        return null;
    }

    static async getNoteById(noteId: number): Promise<Note | null> {
        if (!Manager.collection) {
            console.error("MongoDB is not connected");
            return null;
        }
        const findQuery = {id: noteId};
        try {
            const result = await Manager.collection.findOne(findQuery);
            if (result === null) {
                console.error(`Note with id ${noteId} not found`);
                return null;
            }
            return result as unknown as Note;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getAllNoteInfos(): Promise<NoteInfo[]> {
        if (!Manager.collection) {
            console.error("MongoDB is not connected");
            return [];
        }
        try {
            const result = await Manager.collection.find().project({
                id: 1,
                author: 1,
                title: 1,
                categories: 1,
                keywords: 1
            }).sort({id: -1}).toArray();
            return result as unknown as NoteInfo[];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    private static initStarted = false;
    private static client = new MongoClient(process.env.MONGO_URI as string);
    private static collection: Collection<Document> | null = null;

    private constructor() {
    }
}

export default Manager;