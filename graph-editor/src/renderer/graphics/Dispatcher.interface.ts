import type { EventKeyMap } from "./EventKeyMap.interface";
import type { Listener } from "./Listener.interface";

export interface Dispatcher {
    dispatchEvent<K extends keyof EventKeyMap>(
        type: K,
        event: EventKeyMap[K]
    ): void;

    addListener(listener: Listener): void;
}
