import { contextBridge, ipcRenderer } from 'electron';
import { Api, ThemeColors, Themes } from '../types/ipc';
import { IPC_CHANNELS } from '../shared/channels';

const api: Api = {
    quit: () => ipcRenderer.send(IPC_CHANNELS.QUIT),
    getTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME),
    getThemeColors: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME_COLORS),
    changeTheme: (theme) => ipcRenderer.invoke(IPC_CHANNELS.CHANGE_THEME, theme),
    addVertex: (label) => ipcRenderer.invoke(IPC_CHANNELS.ADD_VERTEX, label),
    removeVertex: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMOVER_VERTEX, id),
    addEdge: (uId, vId, weight, directed) => ipcRenderer.invoke(IPC_CHANNELS.ADD_EDGE, uId, vId, weight, directed),
    removeEdge: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMOVE_EDGE, id)
};

contextBridge.exposeInMainWorld('api', api);
