import type { EventKeyMap } from "./EventKeyMap.interface";

export interface Listener {
    on<K extends keyof EventKeyMap>(
        type: K,
        callback: (event: EventKeyMap[K]) => void
    ): void;

    off<K extends keyof EventKeyMap>(type: K): void;

    processEvent<K extends keyof EventKeyMap>(
        type: K,
        event: EventKeyMap[K]
    ): void;
}