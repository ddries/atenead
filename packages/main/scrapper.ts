import puppeteer, { Browser, Page } from "puppeteer";
import logger from 'electron-log';
const log = logger.scope('scrapper');

let browser: Browser | null = null;

export const initialize = async () => {
    log.info('creating scrapper');
    browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [ '--disable-setuid-sandbox' ]
    });  
};

export const injectHtmlToPage = async (html: string, page: Page) => {
    await page.setContent(html, {
        waitUntil: "domcontentloaded"
    });
}

export const getPage = async (url: string = "") => {
    log.info("get_page url=" + url);

    if (!browser) {
        log.error("browser is null");
        return null;
    }

    const p = await browser.newPage();

    if (url) {
        p.goto(url, { waitUntil: "domcontentloaded" });
    }

    return p;
}