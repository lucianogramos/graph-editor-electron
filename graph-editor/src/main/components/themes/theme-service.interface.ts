import { ThemeColors } from "./theme-colors";
import { Themes } from "./types";

export interface ThemeService {
    getCurrentTheme: () => Themes;
    getCurrentThemeColors: () => ThemeColors;
    setCurrentTheme: (theme: Themes) => void;
    toggleCurrentTheme: () => void;
}
