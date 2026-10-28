import { BrowserWindow } from "electron";
import { themeService } from "./components/themes/theme-gateway";
import path from "node:path";

export class AppWindow {
    private readonly preloadFilePath = '../preload/preload.js';
    private readonly indexFilePath = '../renderer/index.html';
    private mainWindow: BrowserWindow | null = null;

    public createWindow(width = 800, height = 800, min_width = 480, min_height = 270): void {
        const currentThemeColors = themeService.getCurrentThemeColors();

        this.mainWindow = new BrowserWindow({
                width: width,
                height: height,
                minWidth: min_width,
                minHeight: min_height,
                titleBarStyle: 'hidden',
                titleBarOverlay: {
                    color: currentThemeColors.titleBarColor,
                    symbolColor: currentThemeColors.titleBarSymbolColor,
                    height: 35
                },
                webPreferences: {
                preload: path.join(__dirname, this.preloadFilePath),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        this.mainWindow.loadFile(path.join(__dirname, this.indexFilePath));
    }

    public updateTheme() {
        if (this.mainWindow === null) return;
        
        const themeColors = themeService.getCurrentThemeColors();
        this.mainWindow.setTitleBarOverlay({
            color: themeColors.titleBarColor,
            symbolColor: themeColors.titleBarSymbolColor
        });
    }
}
