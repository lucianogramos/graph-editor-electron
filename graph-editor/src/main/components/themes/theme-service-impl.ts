import { fileService } from "../files/file-gateway";
import { themeColors, ThemeColors } from "./theme-colors";
import { ThemeService } from "./theme-service.interface";
import { Themes } from "./types";

interface ThemeConfig {
    theme: Themes;
}

export class ThemeServiceImpl implements ThemeService {
    private theme: Themes;
    private readonly CONFIG_FILE_NAME = fileService.joinPathToUserPath('themes.config.json');

    public constructor() {
        if (!fileService.existsSync(this.CONFIG_FILE_NAME)) {
            const defaultConfig = {
                theme: 'light'
            };
            fileService.writeSync(this.CONFIG_FILE_NAME, JSON.stringify(defaultConfig));
            this.theme = 'light';
            return;
        }
        const config = fileService.readSync(this.CONFIG_FILE_NAME, 'object') as ThemeConfig;
        this.theme = config.theme;
    }

    public getCurrentTheme(): Themes {
        return this.theme;
    }

    public getCurrentThemeColors(): ThemeColors {
        return themeColors[this.theme];
    }

    public setCurrentTheme(theme: Themes): void {
        this.theme = theme;
        fileService.writeAsync(this.CONFIG_FILE_NAME, JSON.stringify({ theme: theme }), (err) => {
            if (err) throw err;
        });
    }

    public toggleCurrentTheme(): void {
        if (this.theme === 'light') {
            this.setCurrentTheme('dark');
            return;
        }
        this.setCurrentTheme('light');
    }
}