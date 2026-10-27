import { Api } from './ipc'

declare global {
    interface Window {
        api: Api
    }
}

export {};
