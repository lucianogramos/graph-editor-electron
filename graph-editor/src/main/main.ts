import { app, ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import { AppWindow } from './app-window';
import { Themes } from './components/themes/types';
import { themeService } from './components/themes/theme-gateway';
import { createGraph } from './components/graph/graph-gateway';

const appWindow = new AppWindow();
const graph = createGraph();

app.whenReady().then(() => {
    appWindow.createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            appWindow.createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle(IPC_CHANNELS.GET_THEME, () => {
    return themeService.getCurrentTheme();
})

ipcMain.on(IPC_CHANNELS.QUIT, () => {
    app.quit();
});

ipcMain.on(IPC_CHANNELS.CHANGE_THEME, (_, theme: Themes) => {
    themeService.setCurrentTheme(theme);
    appWindow.updateTheme();
});

// Graph Channels

ipcMain.handle(IPC_CHANNELS.ADD_VERTEX, (_, label?: string) => {
    return graph.createVertex(label);
});

ipcMain.handle(IPC_CHANNELS.REMOVER_VERTEX, (_, id: number) => {
    return graph.removeVertex(id);
});

ipcMain.handle(IPC_CHANNELS.ADD_EDGE, (_, uId: number, vId: number, weight: number, directed: boolean) => {
    return graph.connectVertices(uId, vId, weight, directed) !== null;
});
