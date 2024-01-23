import { dialog, ipcMain, IpcMainEvent } from "electron";
import { win as _window } from './window';
import { version } from './index'
import fs from 'fs';
import logger from 'electron-log';
import { login, user, courses, AteneaCourse, getResourcesFromCourse, AteneaResource, ensureOk } from "./atenea";
import { setDownloadDir, startDownload } from "./downloader";
const log = logger.scope('ipc');

const download = async (_: IpcMainEvent, coursesStr: string) => {
    const allResources: AteneaResource[] = [];
    let total = 0;

    const result = dialog.showOpenDialogSync(_window!, { properties: [ "openDirectory" ], title: "Atenea download directory" });
    if (!result) {
        dialog.showErrorBox("Atenead", "Please select a valid directory to save downloads");
        _window?.webContents.send('view', 2);
        return;
    }

    if (result.length > 1) {
        dialog.showErrorBox("Atenead", "Please select a valid directory to save downloads");
        _window?.webContents.send('view', 2);
        return;
    }

    setDownloadDir(result[0]);

    const courses: AteneaCourse[] = JSON.parse(coursesStr);
    log.info("download request=" + JSON.stringify(courses));

    for (const course of courses) {
        sendStatusText("Fetching " + course.name + "...");
        const result = await getResourcesFromCourse(course);
        total += result.size;

        await ensureOk(result.list);
        allResources.push(...result.list);
    }

    setPbMode("determinate");
    setDownloadTotalCount(total);
    await startDownload(allResources);

    sendStatusText("Completed!");
    sendItemText("");
    setDownloadTotalCount(0);
};
ipcMain.on('download', download);

const onLogin = async (_: IpcMainEvent, username: string, password: string) => {
    const b = await login(username, password);
    log.info("login request=" + username + ", response=" + b.toString());
    
    _window?.webContents.send('login-response', !b ? null : JSON.stringify(user));
};
ipcMain.on('login-request', onLogin);

const load = (_: IpcMainEvent) => {
    _window?.webContents.send('load', JSON.stringify(courses));
};
ipcMain.on('load', load);

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

export const sendStatusText = (text: string): void => {
    if (!_window) return;
    _window?.webContents.send('set-status-text', text);
}

export const sendItemText = (text: string): void => {
    if (!_window) return;
    _window?.webContents.send('set-item-text', text);
}

export const incrementDownloadCount = () => {
    if (!_window) return;
    _window?.webContents.send('increment-download-count');
};

export const setDownloadTotalCount = (count: number) => {
    if (!_window) return;
    _window?.webContents.send('set-download-total-count', count);
};

export const setPbMode = (mode: 'indeterminate' | 'determinate') => {
    if (!_window) return;
    _window?.webContents.send('set-pb-mode', mode);
};

export const setView = (view: number) => {
    if (!_window) return;
    _window?.webContents.send('view', view);
}

export const setUpdatePbMode = (mode: 'indeterminate' | 'determinate') => {
    if (!_window) return;
    _window?.webContents.send('set-update-mode', mode);
}

export const setUpdateProgress = (progress: number) => {
    if (!_window) return;
    _window?.webContents.send('set-update-progress', progress);
}

export const setUpdateLabel = (label: string) => {
    if (!_window) return;
    _window?.webContents.send('set-update-label', label);
}