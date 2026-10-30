import { EventKeyMap } from "./event-key-map.interface";
import { Listener } from "./listener.interface";

export interface Dispatcher {
    dispatchEvent<K extends keyof EventKeyMap>(
        type: K,
        event: EventKeyMap[K]
    ): void;

    addListener(listener: Listener): void;
}
