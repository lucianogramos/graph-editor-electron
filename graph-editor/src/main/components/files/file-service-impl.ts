import { FileService, types } from "./file-service.interface";
import { app } from "electron";
import fs from 'node:fs';
import nodepath from "node:path";

export class FileServiceImpl implements FileService {
    public existsSync(path: string): boolean {
        return fs.existsSync(path);
    }

    public readSync(path: string, type?: types): string | number | object {
        const data = fs.readFileSync(path, 'utf-8');
        if (type === undefined)
            return data;
        switch (type) {
            case "object":
                return JSON.parse(data);
            case "string":
                return data;
            case "int":
                return Number.parseInt(data, 10);
            case "float":
                return Number.parseFloat(data);
        }
    }

    public writeSync(path: string, data: string): void {
        fs.writeFileSync(path, data, 'utf-8');
    }

    public writeAsync(path: string, data: string, callback: fs.NoParamCallback): void {
        fs.writeFile(path, data, 'utf-8', callback);
    }

    public joinPathToUserPath(path: string): string {
        return nodepath.join(app.getPath('userData'), path);
    }
}