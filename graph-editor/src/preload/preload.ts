import { contextBridge } from 'electron';

// Expõe a API de forma segura para o objeto 'window'
// contextBridge.exposeInMainWorld('versions', versionsApi);