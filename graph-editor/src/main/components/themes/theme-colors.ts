import { Themes } from "./types";

export interface ThemeColors {
    titleBarColor: string;
    titleBarSymbolColor: string;
    vertexColor: string;
    vertexBorderColor: string;
    edgeColor: string;
    edgeBorderColor: string;
    vertexLabelColor: string;
    edgeWeightColor: string;
    edgeWeightBgColor: string;
}

export const themeColors: Record<Themes, ThemeColors> = {
    light: {
        titleBarColor: '#F5FBFF',
        titleBarSymbolColor: '#1D1D1D',
        vertexColor: '#1D1D1D',
        vertexBorderColor: '#1D1D1D',
        edgeColor: '#1D1D1D',
        edgeBorderColor: '#1D1D1D',
        vertexLabelColor: '#F5FBFF',
        edgeWeightColor: '#1D1D1D',
        edgeWeightBgColor: '#F5FBFF'
    },
    dark: {
        titleBarColor: '#1D1D1D',
        titleBarSymbolColor: '#F5FBFF',
        vertexColor: '#F5FBFF',
        vertexBorderColor: '#F5FBFF',
        edgeColor: '#F5FBFF',
        edgeBorderColor: '#F5FBFF',
        vertexLabelColor: '#1D1D1D',
        edgeWeightColor: '#F5FBFF',
        edgeWeightBgColor: '#1D1D1D'
    }
}