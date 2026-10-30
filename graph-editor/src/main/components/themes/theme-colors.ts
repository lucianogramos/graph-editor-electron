import { Themes } from "./types";

export interface ThemeColors {
    titleBarColor: string;
    titleBarSymbolColor: string;
    vertexColor: string;
    vertexBorderColor: string;
    edgeColor: string;
    edgeBorderColor: string;
    vertexLabelColor: string;
}

export const themeColors: Record<Themes, ThemeColors> = {
    light: {
        titleBarColor: '#F5FBFF',
        titleBarSymbolColor: '#1D1D1D',
        vertexColor: '#1D1D1D',
        vertexBorderColor: '#BFC4C7',
        edgeColor: '#BFC4C7',
        edgeBorderColor: '#BFC4C7',
        vertexLabelColor: '#F5FBFF'
    },
    dark: {
        titleBarColor: '#1D1D1D',
        titleBarSymbolColor: '#F5FBFF',
        vertexColor: 'F5FBFF',
        vertexBorderColor: '#BFC4C7',
        edgeColor: '#BFC4C7',
        edgeBorderColor: '#BFC4C7',
        vertexLabelColor: '#1D1D1D'
    }
}