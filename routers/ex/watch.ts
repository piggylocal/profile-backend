import passport from "passport";
import StatusCodes from "http-status-codes";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizePlugin from "puppeteer-extra-plugin-anonymize-ua";

import router from "../user";
import MongoManager from "../../managers/mongo";

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizePlugin());

// This does not work on Render.com.
/*router.post(
    "/m3u8",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res) => {
        const url = req.body.url;
        const browser = await puppeteer.launch({
            headless: "shell"
        });
        const page = await browser.newPage();
        const timeoutId = setTimeout(async () => {
            await browser.close();
            res.status(StatusCodes.BAD_REQUEST).json({message: "Timeout"});
        }, 10000);
        page.on('request', async request => {
            console.log(request.url());
            if (request.url().trim().endsWith(".m3u8")) {
                await browser.close();
                clearTimeout(timeoutId);
                res.status(StatusCodes.OK).json({url: request.url()});
            }
        });
        try {
            await page.goto(url);
        } catch (err) {
            console.error(err);
        }
    }
);*/

router.get(
    "/m3u8",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res) => {
        const url = req.query.url as string;
        const m3u8 = await MongoManager.getM3U8(url);
        if (m3u8 === null) {
            res.status(StatusCodes.NOT_FOUND).json({message: "M3U8 not found"});
        } else {
            res.status(StatusCodes.OK).json({url: m3u8});
        }
    }
);

router.get(
    "/syncLog",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res, next) => {
        try {
            const syncLog = await MongoManager.getLatestSyncLog();
            if (syncLog === null) {
                return res.status(StatusCodes.NOT_FOUND).json({message: "Sync log not found"});
            } else {
                res.status(StatusCodes.OK).json(syncLog);
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    }
)

router.post(
    "/syncLog",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res, next) => {
        const {time, url, position} = req.body;
        const syncLog = {time: new Date(time), url, position};
        try {
            const success = await MongoManager.postSyncLog(syncLog);
            if (success) {
                res.status(StatusCodes.CREATED).json({message: "Sync log posted"});
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to post sync log"});
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    }
)

export default router;