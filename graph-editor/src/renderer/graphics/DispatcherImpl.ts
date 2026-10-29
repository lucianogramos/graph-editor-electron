import { Dispatcher } from "./Dispatcher";
import { EventKeyMap } from "./EventKeyMap";
import { Listener } from "./Listener";

export class DispatcherImpl implements Dispatcher {
    private listerners: Listener[] = [];

    addListener(listener: Listener): void {
        if (!this.listerners.includes(listener)) {
            this.listerners.push(listener);
        }
    }

    dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        for (const listener of [...this.listerners]) {
            if (event.cancel) {
                break;
            }
            listener.processEvent(type, event);
        }
    }
}