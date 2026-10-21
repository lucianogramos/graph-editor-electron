import { NoParamCallback } from 'node:fs';

export type types = 'string' | 'int' | 'float' | 'object';

export interface FileService {
    existsSync: (path: string) => boolean;
    readSync: (path: string, type?: types) => string | number | object;
    writeSync: (path: string, data: string) => void;
    writeAsync: (path: string, data: string, callback: NoParamCallback) => void;
    joinPathToUserPath: (path: string) => string;
}