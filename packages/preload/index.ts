import { contextBridge, ipcRenderer } from 'electron';

type AcceptedEvents = "login-response";

const bridgeApi = {
    close: () => {
        ipcRenderer.send('win-close');
    },
    maximize: () => {
        ipcRenderer.send('win-maximize');
    },
    minimize: () => {
        ipcRenderer.send('win-minimize');
    },

    login: (username: string, password: string) => {
        ipcRenderer.send('login-request', username, password);
    },

    load: () => {
        ipcRenderer.send('load');
    },

    download: (courses: any[]) => {
        ipcRenderer.send('download', JSON.stringify(courses));
    },

    on: (name: AcceptedEvents, cb: (...a: any[]) => void, once: boolean = false) => {
        const _wrapper = (...args: any[]) => {
            args.shift();
            cb(...args);
        };
        ipcRenderer[once ? 'once' : 'on'](name.toString(), _wrapper);
    }
};
contextBridge.exposeInMainWorld('bridge', bridgeApi);