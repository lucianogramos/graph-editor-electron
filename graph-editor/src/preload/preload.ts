import { contextBridge } from 'electron';
import { IElectronVersions } from '../types/global';

const versionsApi: IElectronVersions = {
  node: () => process.versions.node,
  electron: () => process.versions.electron,
  chrome: () => process.versions.chrome
};

// Expõe a API de forma segura para o objeto 'window'
contextBridge.exposeInMainWorld('versions', versionsApi);