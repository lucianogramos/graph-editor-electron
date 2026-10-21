import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { themeService } from './components/themes/theme-gateway';

const createWindow = (): void => {
    const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            titleBarStyle: 'hidden',
            // Mantém os botões nativos, mas permite estilizar a barra de fundo e os ícones
            titleBarOverlay: {
                color: themeService.getCurrentThemeColors().titleBarColor,
                symbolColor: themeService.getCurrentThemeColors().titleBarSymbolColor,
                height: 35
            },
            webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.webContents.on('before-input-event', (_, input) => {
        if (input.type == 'keyDown' && input.key.toLowerCase() === 'e') {
            themeService.toggleCurrentTheme();
            mainWindow.setTitleBarOverlay({
                color: themeService.getCurrentThemeColors().titleBarColor,
                symbolColor: themeService.getCurrentThemeColors().titleBarSymbolColor 
            })
        }
    })

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
