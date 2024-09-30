import dotenv from 'dotenv';
import {MongoClient, Collection} from 'mongodb';

import {Note, NoteInfo} from '../dto/note';
import {User, VisitorLog} from '../dto/user';

dotenv.config();

const collectionNotes = process.env.MONGO_COLLECTION_NOTES as string;
const collectionVisitorLogs = process.env.MONGO_COLLECTION_VISITOR_LOGS as string;
const collectionUsers = process.env.MONGO_COLLECTION_USERS as string;

class Manager {
    static async init(): Promise<null> {
        if (Manager.initStarted) {
            return null;
        }
        Manager.initStarted = true;
        Manager.collections = {};
        await Manager.client.connect();
        const dbNotes = Manager.client.db(process.env.MONGO_DB_NOTES);
        const dbUsers = Manager.client.db(process.env.MONGO_DB_USERS);
        Manager.collections[collectionNotes] = dbNotes.collection(collectionNotes);
        Manager.collections[collectionVisitorLogs] = dbUsers.collection(collectionVisitorLogs);
        Manager.collections[collectionUsers] = dbUsers.collection(collectionUsers);
        console.log("Connected to MongoDB");
        return null;
    }

    static async close(): Promise<null> {
        if (!Manager.initStarted) {
            return null;
        }
        Manager.collections = {};
        await Manager.client.close();
        Manager.initStarted = false;
        console.log("Disconnected from MongoDB");
        return null;
    }

    static async getNoteById(noteId: number): Promise<Note | null> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected");
            return null;
        }
        const findQuery = {id: noteId};
        try {
            const result = await collection.findOne(findQuery);
            if (result === null) {
                return null;
            }
            return result as unknown as Note;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async postNote(note: Note): Promise<boolean> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected");
            return false;
        }
        try {
            await collection.insertOne(note);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getAllNoteInfos(): Promise<NoteInfo[]> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected")
            return [];
        }
        try {
            const result = await collection.find().project({
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

    static async getNoteMaxId(): Promise<number> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected");
            return -1;
        }
        try {
            const result = await collection.find().project({id: 1}).sort({id: -1}).limit(1).toArray();
            if (result.length === 0) {
                return 0;
            }
            return result[0].id;
        } catch (err) {
            console.error(err);
            return -1;
        }
    }

    static async postVisitorLog(visitorLog: VisitorLog): Promise<boolean> {
        const collection = Manager.collections[collectionVisitorLogs];
        if (!collection) {
            console.error("Collection visitorLogs is not connected");
            return false;
        }
        try {
            await collection.insertOne(visitorLog);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getUserByName(username: string): Promise<User | null> {
        const collection = Manager.collections[collectionUsers];
        if (!collection) {
            console.error("Collection users is not connected");
            return null;
        }
        const findQuery = {username};
        try {
            const result = await collection.findOne(findQuery);
            if (result === null) {
                console.log(`User with username ${username} not found`);
                return null;
            }
            return result as unknown as User;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async postUser(user: User): Promise<boolean> {
        const collection = Manager.collections[collectionUsers];
        if (!collection) {
            console.error("Collection users is not connected");
            return false;
        }
        try {
            await collection.insertOne(user);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getPV(): Promise<number> {
        const collection = Manager.collections[collectionVisitorLogs];
        if (!collection) {
            console.error("Collection visitorLogs is not connected");
            return -1;
        }
        try {
            return await collection.estimatedDocumentCount();
        } catch (err) {
            console.error(err);
            return -1;
        }
    }

    private static initStarted = false;
    private static client = new MongoClient(process.env.MONGO_URI as string);
    private static collections: { [key: string]: Collection | null } = {};

    // This class should not be instantiated. We only need the static methods.
    private constructor() {
    }
}

export default Manager;