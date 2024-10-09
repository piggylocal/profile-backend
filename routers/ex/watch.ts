import passport from "passport";
import StatusCodes from "http-status-codes";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import router from "../user";

puppeteer.use(StealthPlugin());
router.post(
    "/m3u8",
    passport.authenticate("jwt", {session: false, failWithError: true}),
    async (req, res) => {
        const url = req.body.url;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const timeoutId = setTimeout(async () => {
            await browser.close();
            res.status(StatusCodes.BAD_REQUEST).json({message: "Timeout"});
        }, 5000);
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
);

export default router;