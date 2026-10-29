
import type { Listener } from "./Listener";
import type { EventKeyMap } from "./EventKeyMap";

export class ListenerImpl implements Listener {
    private callbacks: {
        [K in keyof EventKeyMap]?: Array<
            (event: EventKeyMap[K]) => void
        >;
    } = {};

    on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks[type] ?? [];

        callbacks.push(callback);
        this.callbacks[type] = callbacks;
    }

    off<K extends keyof EventKeyMap>(type: K): void {
        delete this.callbacks[type];
    }

    processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks[type];

        if (!callbacks) {
            return;
        }

        for (const callback of [...callbacks]) {
            callback(event);

            if (event.cancel) {
                break;
            }
        }
    }
}