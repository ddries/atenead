import { ipcMain, IpcMainEvent } from "electron";
import { win as _window } from './window';
import { version } from './index'

import logger from 'electron-log';
import { login, user, courses, AteneaCourse } from "./atenea";
const log = logger.scope('ipc');

const download = (_: IpcMainEvent, coursesStr: string) => {
    const courses: AteneaCourse[] = JSON.parse(coursesStr);
};
ipcMain.on('download', download);

const onLogin = async (_: IpcMainEvent, username: string, password: string) => {
    const b = await login(username, password);
    log.info("login request=" + username + ", response=" + b.toString());
    
    _window?.webContents.send('login-response', !b ? null : JSON.stringify(user));
    _window?.webContents.send('load', JSON.stringify(courses));
};
ipcMain.on('login-request', onLogin);

ipcMain.on('win-close', (_: IpcMainEvent) => {
    _window?.close();
});

ipcMain.on('win-maximize', (_: IpcMainEvent) => {
    _window?.isMaximized() ? 
        _window?.unmaximize() :
        _window?.maximize();
});

ipcMain.on('win-minimize', (_: IpcMainEvent) => {
    _window?.minimize();
});

export const loadFrontend = (): void => {
    if (!_window) return;
    _window?.webContents.send('set-version', version);
};