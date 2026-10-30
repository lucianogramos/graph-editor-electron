export type Themes = 'light' | 'dark';

export interface ThemeColors {
    titleBarColor: string;
    titleBarSymbolColor: string;
    vertexColor: string;
    vertexBorderColor: string;
    edgeColor: string;
    edgeBorderColor: string;
    vertexLabelColor: string;
}

export interface Api {
    quit: () => void;
    getTheme: () => Promise<Themes>;
    getThemeColors: () => Promise<ThemeColors>;
    changeTheme: (theme: Themes) => void;
    addVertex: (label?: string) => Promise<number>;
    removeVertex: (id: number) => Promise<boolean>;
    addEdge: (uId: number, vId: number, weight: number, directed: boolean) => Promise<number>;
    removeEdge: (id: number) => Promise<boolean>;
}
