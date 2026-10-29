import type { EventKeyMap } from "./EventKeyMap";
import type { Listener } from "./Listener";

export interface Dispatcher {
    dispatchEvent<K extends keyof EventKeyMap>(
        type: K,
        event: EventKeyMap[K]
    ): void;

    addListener(listener: Listener): void;
}
