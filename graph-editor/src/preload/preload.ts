import { contextBridge, ipcRenderer } from 'electron';
import { Api } from '../types/ipc';
import { IPC_CHANNELS } from '../shared/channels';

const api: Api = {
    quit: () => ipcRenderer.send(IPC_CHANNELS.QUIT)
};

contextBridge.exposeInMainWorld('api', api);