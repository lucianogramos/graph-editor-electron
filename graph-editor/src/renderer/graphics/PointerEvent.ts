
import type { Event } from "./Event";

export interface PointerEvent extends Event {
    readonly domEvent: globalThis.PointerEvent;
}
