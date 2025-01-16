import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { session } from 'electron';
import { https } from 'follow-redirects';

import url from 'url';
import { getPage, injectHtmlToPage } from './scrapper';

import logger from 'electron-log';
import { ok } from 'assert';
import { sendItemText, sendStatusText } from './ipcMain';
const log = logger.scope("atenea");

const SSO_URL = "https://sso.upc.edu/CAS/login?service=https%3A%2F%2Fatenea.upc.edu%2Flogin%2Findex.php%3FauthCAS%3DCAS";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

type LoggedUser = {
    username: string,
    name: string,
    avatarUrl: string,

    moodleCookie: string,
    ssoCookie: string
}

export type AteneaCourse = {
    name: string,
    id: string,
    url: string,
}

export type ResourceType = "pdf" | "txt" | "media" | "unk";
export type ResourceDir = string;

export type AteneaResource = {
    name: string,
    type: ResourceType,
    directory: ResourceDir,
    url: string,
    course: AteneaCourse
}

export let user: LoggedUser | null = null;
export let courses: AteneaCourse[] = [];

export const login = async (username: string, password: string): Promise<boolean> => {
    const params = {
        "adAS_mode": "authn",
        "adAS_username": username,
        "adAS_password": password
    };

    const { data } = await client.post(SSO_URL, new url.URLSearchParams(params).toString());

    const ssoCookie = await jar.getCookieString("https://sso.upc.edu/CAS/login");
    const moodleCookie = await jar.getCookieString("https://atenea.upc.edu/my");

    const body = data as string;

    const isValid = body.includes('Tauler');
    
    if (!isValid) {
        return false;
    }

    const p = await getPage();

    if (!p) {
        return false;
    }

    await injectHtmlToPage(body, p);

    const d = await p.evaluate(() => {
        // const name = (document.querySelector("span .usertext") as HTMLSpanElement).innerHTML!;
        const el = document.querySelector("#page-header div div.align-items-center h1") as HTMLElement;
        const name = el.innerHTML.split(", ")[1].split("!")[0];
        const avatar = (document.querySelector(".userpicture") as HTMLImageElement).src!.replace("f2", "f1");

        return { name, avatar };
    });

    // get courses
    const coursesGet = await client.get("https://atenea.upc.edu/blocks/mycourses/view.php");
    const coursesData = coursesGet.data;

    await injectHtmlToPage(coursesData as string, p);

    const a = await p.evaluate(() => {
        let r = [];
        const q = document.querySelectorAll('#page-wrapper #page #page-content #region-main-box #region-main div div.mycourses_mymoodle div.mycourse_course_container div.mycourses_course');
        for (const s of q) {
            const urlEl = s.querySelector('div div div div h4 a') as HTMLLinkElement;
            const url = urlEl.href;

            r.push({
                name: urlEl.textContent?.split("(")[0].trim()!,
                id: url.split('?id=')[1],

                url
            });
        }
        return r;
    });

    log.debug("found " + a.length + " courses");
    courses = a;

    user = {
        name: d.name,//.split(" ").reverse().join(" "),
        avatarUrl: d.avatar,

        username,
        ssoCookie,
        moodleCookie
    };

    // Inject session cookie to atenea requests
    session.defaultSession.webRequest.onBeforeSendHeaders({
        urls: [
            "https://atenea.upc.edu/*"
        ]
    }, (details, cb) => {
        if (details.requestHeaders["Cookie"]) {
            details.requestHeaders["Cookie"] += user?.moodleCookie;
        } else {
            details.requestHeaders["Cookie"] = user?.moodleCookie!;
        }


        cb({
            requestHeaders: details.requestHeaders
        })
    });

    return true;
};

export const getResourcesFromCourse = async (course: AteneaCourse): Promise<{ size: number, list: AteneaResource[] }> => {
    const result: AteneaResource[] = [];

    // Fetch root resources
    const { data } = await client.get(course.url);
    const body = data as string;

    const p = await getPage();
    ok(p != null);

    await injectHtmlToPage(body, p);

    const rootResources: AteneaResource[] = await p.evaluate((course: AteneaCourse) => {
        const res: AteneaResource[] = [];
        const resources = document.querySelectorAll("li.resource div div.activity-basis div div.activity-instance div div.media-body div a");
        for (const r of resources) {
            const name = r.querySelector("span")?.firstChild?.nodeValue!;
            const url = (r as HTMLLinkElement).href;

            res.push({
                directory: "./",
                type: url.includes(".pdf") ? "pdf" : "unk",
                name: name,
                url,
                course
            });
        }
        return res;
    }, course);

    result.push(...rootResources);

    // Fetch subdir resources
    const subdirs: string[] = await p.evaluate(() => {
        const res: string[] = [];
        const folders = document.querySelectorAll("li.folder");
        for (const f of folders) {
            const urlEl = f.querySelector("div div.activity-basis div div.activity-instance div div.media-body div a") as HTMLLinkElement;
            const url = urlEl!.href;
            res.push(url);
        }
        return res;
    });

    // For each subdir url, fetch its internal resources
    for (const subdirUrl of subdirs) {
        const subdirReq = await client.get(subdirUrl);
        const subdirBody = subdirReq.data as string;

        const subdirPage = await getPage();
        ok(subdirPage != null);

        await injectHtmlToPage(subdirBody, subdirPage)
        const subresources: AteneaResource[] = await subdirPage.evaluate((course: AteneaCourse) => {
            const result: AteneaResource[] = [];
            const h2Name = document.querySelector("header#page-header div div:nth-child(2) div:nth-child(1) div.page-context-header div.page-header-headings h1") as HTMLElement;
            const folderName = h2Name.innerText;
            const items = document.querySelectorAll("span.fp-filename-icon");
            for (const item of items) {
                const a = item.children[0] as HTMLLinkElement;
                const span = a.querySelector("span.fp-filename") as HTMLSpanElement;
                const name = span.innerText;
                const url = a.href;
                result.push({
                    directory: folderName.replaceAll(" ", "_"),
                    type: url.includes(".pdf") ? "pdf" : "unk",
                    name: name,
                    url,
                    course
                });
            }
            return result;
        }, course);

        result.push(...subresources);
    }

    return { size: result.length, list: result };
}

export const ensureOk = async (resources: AteneaResource[]): Promise<void> => {
    // Check that resource names do not collide
    for (let i = 0; i < resources.length; i++) {
        const name = resources[i].name;
        const dir = resources[i].directory;
        let k = 1;
        for (let j = 0; j < resources.length; j++) {
            if (i == j) {
                continue;
            }

            // On collision, change current name
            if (resources[j].name == name && resources[j].directory == dir) {
                resources[j].name += k++;
            }
        }
    }
}