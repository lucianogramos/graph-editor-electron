import type { ThemeColors, Themes } from "../types/ipc";

interface Theme {
    currentTheme: Themes;
    colors: ThemeColors;
}

let theme: Theme;

const callbacks: Map<number, (theme: Theme) => void> = new Map();
let callbackId = 0;

export async function updateTheme() {
    theme = {
        currentTheme: await window.api.getTheme(),
        colors: await window.api.getThemeColors()
    }

    for (const [, callback] of callbacks) {
        callback(theme);
    } 
}

export function onChangeTheme(callback: (theme: Theme) => void): number {
    callbacks.set(callbackId, callback);
    return callbackId++;
}

export function removeCallback(id: number) {
    callbacks.delete(id);
}

export function getCurrentTheme(): Themes {
    return theme.currentTheme;
}

export function getCurrentThemeColors(): ThemeColors {
    return theme.colors;
}
