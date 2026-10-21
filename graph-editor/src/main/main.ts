import { app, BrowserWindow } from 'electron';
import path from 'node:path';

const createWindow = (): void => {
    const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Carrega o arquivo HTML localizado na raiz do projeto
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
