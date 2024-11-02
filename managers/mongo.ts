import dotenv from 'dotenv';
import {MongoClient, Collection} from 'mongodb';

import {Note, NoteInfo} from '../dto/note';
import {User, VisitorLog} from '../dto/user';
import {M3U8Mapping, SyncLog} from '../dto/ex/watch';
import {ImgurCredentials} from "../dto/auth";

dotenv.config();

const collectionNotes = "notes";
const collectionVisitorLogs = "visitorLogs";
const collectionUsers = "users";
const collectionM3U8Mappings = "m3u8Mappings";
const collectionSyncLogs = "syncLogs";
const collectionImgur = "imgur";

class Manager {
    static async init(): Promise<null> {
        if (Manager.initStarted) {
            return null;
        }
        Manager.initStarted = true;
        Manager.collections = {};
        await Manager.client.connect();
        const dbNotes = Manager.client.db("notes");
        const dbUsers = Manager.client.db("users");
        const dbWatch = Manager.client.db("watch");
        const dbAuth = Manager.client.db("auth");
        Manager.collections[collectionNotes] = dbNotes.collection(collectionNotes);
        Manager.collections[collectionVisitorLogs] = dbUsers.collection(collectionVisitorLogs);
        Manager.collections[collectionUsers] = dbUsers.collection(collectionUsers);
        Manager.collections[collectionM3U8Mappings] = dbWatch.collection(collectionM3U8Mappings);
        Manager.collections[collectionSyncLogs] = dbWatch.collection(collectionSyncLogs);
        Manager.collections[collectionImgur] = dbAuth.collection(collectionImgur);
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

    static async deleteNoteById(noteId: number): Promise<boolean> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected");
            return false;
        }
        const deleteQuery = {id: noteId};
        try {
            const result = await collection.deleteOne(deleteQuery);
            return result.deletedCount === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getNoteInfos(category?: string): Promise<NoteInfo[]> {
        const collection = Manager.collections[collectionNotes];
        if (!collection) {
            console.error("Collection notes is not connected")
            return [];
        }
        try {
            const result = await collection.find(category ? {categories: category} : {}).project({
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

    static async postM3U8Mapping(url: string, m3u8Url: string, title: string, episode: number): Promise<boolean> {
        const collection = Manager.collections[collectionM3U8Mappings];
        if (!collection) {
            console.error("Collection m3u8Mappings is not connected");
            return false;
        }
        try {
            await collection.insertOne({url, m3u8Url, title, episode});
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getM3U8(url: string): Promise<string | null> {
        const collection = Manager.collections[collectionM3U8Mappings];
        if (!collection) {
            console.error("Collection m3u8Mappings is not connected");
            return null;
        }
        const findQuery = {url};
        try {
            const result = await collection.findOne(findQuery);
            if (result === null) {
                console.log(`M3U8 mapping for ${url} not found`);
                return null;
            }
            return result.m3u8Url;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getM3U8All(): Promise<M3U8Mapping[]> {
        const collection = Manager.collections[collectionM3U8Mappings];
        if (!collection) {
            console.error("Collection m3u8Mappings is not connected");
            return [];
        }
        try {
            const result = await collection.find().toArray();
            return result as unknown as M3U8Mapping[];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    static async getLatestSyncLog(): Promise<SyncLog | null> {
        const collection = Manager.collections[collectionSyncLogs];
        if (!collection) {
            console.error("Collection syncLogs is not connected");
            return null;
        }
        try {
            const result = await collection.find().sort({time: -1}).limit(1).toArray();
            if (result.length === 0) {
                console.log("No sync logs found");
                return null;
            }
            return result[0] as unknown as SyncLog;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async postSyncLog(syncLog: SyncLog): Promise<boolean> {
        const collection = Manager.collections[collectionSyncLogs];
        if (!collection) {
            console.error("Collection syncLogs is not connected");
            return false;
        }
        try {
            await collection.insertOne(syncLog);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getImgurCredentials(): Promise<ImgurCredentials | null> {
        const collection = Manager.collections[collectionImgur];
        if (!collection) {
            console.error("Collection imgur is not connected");
            return null;
        }
        try {
            const result = await collection.findOne();
            if (result === null) {
                return null;
            }
            return result as unknown as ImgurCredentials;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async updateImgurCredentials(credentials: ImgurCredentials): Promise<boolean> {
        const collection = Manager.collections[collectionImgur];
        if (!collection) {
            console.error("Collection imgur is not connected");
            return false;
        }
        try {
            await collection.findOneAndUpdate({}, {$set: credentials}, {upsert: true});
            return true;
        } catch (err) {
            console.error(err);
            return false;
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