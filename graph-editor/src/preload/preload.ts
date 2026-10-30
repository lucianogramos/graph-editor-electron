import { contextBridge, ipcRenderer } from 'electron';
import { Api, ThemeColors, Themes } from '../types/ipc';
import { IPC_CHANNELS } from '../shared/channels';

const api: Api = {
    quit: () => ipcRenderer.send(IPC_CHANNELS.QUIT),
    getTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME) as Promise<Themes>,
    getThemeColors: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME_COLORS) as Promise<ThemeColors>,
    changeTheme: (theme) => ipcRenderer.send(IPC_CHANNELS.CHANGE_THEME, theme),
    addVertex: (label) => ipcRenderer.invoke(IPC_CHANNELS.ADD_VERTEX, label) as Promise<number>,
    removeVertex: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMOVER_VERTEX, id) as Promise<boolean>,
    addEdge: (uId, vId, weight, directed) => ipcRenderer.invoke(IPC_CHANNELS.ADD_EDGE, uId, vId, weight, directed) as Promise<number>,
    removeEdge: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMOVE_EDGE, id) as Promise<boolean>
};

contextBridge.exposeInMainWorld('api', api);
