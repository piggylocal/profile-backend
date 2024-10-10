// Not used in the project, just to get m3u8 links.

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import MongoManager from '../mongo';

puppeteer.use(StealthPlugin());

async function addLangYaBang2Mappings() {
    const browser = await puppeteer.launch();
    for (let i = 1; i <= 50; i++) {
        const url = `https://xiaoxintv.com/index.php/vod/play/id/650/sid/1/nid/${i}.html`
        const page = await browser.newPage();
        const timeout = setTimeout(async () => {
            page.off('request');
            await page.close();
        }, 5000);
        page.on('request', async request => {
            if (request.url().trim().endsWith(".m3u8")) {
                await page.close();
                clearTimeout(timeout);
                await MongoManager.postM3U8Mapping(url, request.url());
                page.off('request');
            }
        });
        try {
            await page.goto(url);
        } catch (err) {
            console.error(err);
        }
    }
}

async function addDungeonMeshi() {
    const browser = await puppeteer.launch();
    for (let i = 1; i <= 24; i++) {
        const url = `https://www.yinhuadm.cc/p/24819-3-${i}.html`
        const page = await browser.newPage();
        const timeout = setTimeout(async () => {
            console.error("Failed to get m3u8 for episode", i);
            page.off('request');
            await page.close();
        }, 5000);
        page.on('request', async request => {
            if (request.url().trim().endsWith(".m3u8")) {
                await page.close();
                clearTimeout(timeout);
                await MongoManager.postM3U8Mapping(url, request.url());
                page.off('request');
                console.log("Got m3u8 for episode", i);
            }
        });
        try {
            await page.goto(url);
        } catch (_) {
        }
    }
}

export {addLangYaBang2Mappings, addDungeonMeshi};