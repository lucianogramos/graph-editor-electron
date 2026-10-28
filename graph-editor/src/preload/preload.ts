import { contextBridge, ipcRenderer } from 'electron';
import { Api, Themes } from '../types/ipc';
import { IPC_CHANNELS } from '../shared/channels';

const api: Api = {
    quit: () => ipcRenderer.send(IPC_CHANNELS.QUIT),
    getTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME) as Promise<Themes>,
    changeTheme: (theme) => ipcRenderer.send(IPC_CHANNELS.CHANGE_THEME, theme)
};

contextBridge.exposeInMainWorld('api', api);
