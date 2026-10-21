import { Themes } from "./types";

export interface ThemeColors {
    titleBarColor: string;
    titleBarSymbolColor: string;
}

export const themeColors: Record<Themes, ThemeColors> = {
    light: {
        titleBarColor: '#F5FBFF',
        titleBarSymbolColor: '#1D1D1D'
    },
    dark: {
        titleBarColor: '#1D1D1D',
        titleBarSymbolColor: '#F5FBFF'
    }
}