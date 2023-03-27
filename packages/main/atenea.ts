import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { session } from 'electron';

import url from 'url';
import { getPage, injectHtmlToPage } from './scrapper';

import logger from 'electron-log';
const log = logger.scope("atenea");

const SSO_URL = "https://sso.upc.edu/CAS/login?service=https%3A%2F%2Fatenea.upc.edu%2Flogin%2Findex.php%3FauthCAS%3DCAS";

type LoggedUser = {
    username: string,
    name: string,
    avatarUrl: string,

    moodleCookie: string,
    ssoCookie: string
}

type AteneaCourse = {
    name: string,
    id: string,
    url: string,
}

export let user: LoggedUser | null = null;
export let courses: AteneaCourse[] = [];

export const login = async (username: string, password: string): Promise<boolean> => {
    const params = {
        "adAS_mode": "authn",
        "adAS_username": username,
        "adAS_password": password
    };

    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

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
        const name = (document.querySelector("span .usertext") as HTMLSpanElement).innerHTML!;
        const avatar = (document.querySelector(".userpicture") as HTMLImageElement).src!.replace("f2", "f1");

        return { name, avatar };
    });

    const a = await p.evaluate(() => {
        let r = [];
        const q = document.querySelectorAll('#page-wrapper #page #page-content #region-main-box #region-main div #block-region-content .block_mycourses .card-body div .mycourses_mymoodle .mycourse_course_container .courses-view-course-item');
        for (const s of q) {
            const urlEl = s.querySelector('div div .media div h4 a') as HTMLLinkElement;
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