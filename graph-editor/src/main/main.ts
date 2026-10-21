import { app, BrowserWindow } from 'electron';
import path from 'node:path';

type Theme = 'light' | 'dark';
interface ThemeColors {
    titleBarColor: string;
    titleBarSymbolColor: string;
}

let theme: Theme = 'light';
const colors: Record<Theme, ThemeColors> = {
    light: {
        titleBarColor: '#F5FBFF',
        titleBarSymbolColor: '#1D1D1D'
    },
    dark: {
        titleBarColor: '#1D1D1D',
        titleBarSymbolColor: '#F5FBFF'
    }
}

const createWindow = (): void => {
    const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            titleBarStyle: 'hidden',
            // Mantém os botões nativos, mas permite estilizar a barra de fundo e os ícones
            titleBarOverlay: {
                color: colors[theme].titleBarColor,
                symbolColor: colors[theme].titleBarSymbolColor,
                height: 35
            },
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
