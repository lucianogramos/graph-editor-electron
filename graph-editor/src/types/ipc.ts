export type Themes = 'light' | 'dark';

export interface Api {
    quit: () => void;
    getTheme: () => Promise<Themes>;
    changeTheme: (theme: Themes) => void;
    addVertex: (label?: string) => Promise<number>;
    removeVertex: (id: number) => Promise<boolean>;
    addEdge: (uId: number, vId: number, weight: number, directed: boolean) => Promise<boolean>;
}
