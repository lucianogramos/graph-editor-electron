import { contextBridge, ipcRenderer } from 'electron';
import { Api, Themes } from '../types/ipc';
import { IPC_CHANNELS } from '../shared/channels';

const api: Api = {
    quit: () => ipcRenderer.send(IPC_CHANNELS.QUIT),
    getTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_THEME) as Promise<Themes>,
    changeTheme: (theme) => ipcRenderer.send(IPC_CHANNELS.CHANGE_THEME, theme),
    addVertex: (label) => ipcRenderer.invoke(IPC_CHANNELS.ADD_VERTEX, label) as Promise<number>,
    removeVertex: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMOVER_VERTEX, id) as Promise<boolean>,
    addEdge: (uId, vId, weight, directed) => ipcRenderer.invoke(IPC_CHANNELS.ADD_EDGE, uId, vId, weight, directed) as Promise<boolean>
};

contextBridge.exposeInMainWorld('api', api);
