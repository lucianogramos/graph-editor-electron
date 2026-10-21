export interface IElectronVersions {
    node: () => string;
    electron: () => string;
    chrome: () => string;
}

declare global {
    interface Window {
        versions: IElectronVersions;
    }
}
