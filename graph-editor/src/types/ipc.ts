export type Themes = 'light' | 'dark';

export interface Api {
    quit: () => void;
    getTheme: () => Promise<Themes>;
    changeTheme: (theme: Themes) => void;
}
