import { Event } from "./event.interface";

export interface PointerEvent extends Event {
    readonly domEvent: globalThis.PointerEvent;
}
