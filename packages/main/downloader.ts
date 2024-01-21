import { AteneaResource, user } from "./atenea";
import bluebird from 'bluebird';
import { https } from 'follow-redirects';
import fs from 'fs';
import path from 'path'
import { win as _window } from './window';
import sanitize from "sanitize-filename";
import { incrementDownloadCount, sendItemText, sendStatusText, setDownloadTotalCount } from "./ipcMain";
import { dialog } from 'electron';
import logger from 'electron-log';
const log = logger.scope('downloader');

let DOWNLOAD_DIR = "";
let dataMetric = 0;

export const setDownloadDir = (downloadDir: string): void => {
    DOWNLOAD_DIR = downloadDir;
}

function downloadResource(resource: AteneaResource): Promise<void> {
    return new Promise<void>(async (res, rej) => {
        resource.directory = sanitize(resource.directory);
        resource.name = sanitize(resource.name);
    
        let dir = path.join(DOWNLOAD_DIR, resource.course.name, resource.directory);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let fpath = path.join(dir, resource.name);

        const url = resource.url + ( resource.url.includes("?") ? "&redirect=1" : "?redirect=1" );

        const r = https.get(url, { headers: { 'Cookie': user?.moodleCookie } }, resp => {
            const p = resp.responseUrl.split("/");
            const p2 = p[p.length - 1].split(".");
            const ext = p2[p2.length - 1].split("?")[0];
            const f = fs.createWriteStream(fpath + "." + ext);
            resp.pipe(f);
            resp.on('data', d => {
                dataMetric += d.length;
            });
            f.on('finish', () => {
                f.close();
                incrementDownloadCount();
                sendStatusText(resource.name);
                log.info(fpath);
                res();
            });
        }).on("error", err => {
            log.error("Error: " + err);
            rej(err);
        });
    })
}

export const startDownload = async (resources: AteneaResource[]): Promise<void> => {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
        log.info("created dir " + DOWNLOAD_DIR)
    }
    
    const i =setInterval(() => {
        sendItemText("Around " + (dataMetric/(1024*1024)).toFixed(2) + " Mbps");
        dataMetric = 0;
    }, 1000)
    
    await bluebird.Promise.map(resources, downloadResource, { concurrency: 200 });
    clearInterval(i);
}