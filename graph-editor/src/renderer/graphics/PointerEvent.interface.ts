
import type { Event } from "./Event.interface";

export interface PointerEvent extends Event {
    readonly domEvent: globalThis.PointerEvent;
}
