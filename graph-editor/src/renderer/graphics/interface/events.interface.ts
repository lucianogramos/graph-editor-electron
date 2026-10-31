import { Event } from "./event.interface";

export interface PointerEvent extends Event {
    readonly domEvent: globalThis.PointerEvent;
}

export interface MouseEvent extends Event {
    readonly domEvent: globalThis.MouseEvent;
}

export interface DragEvent extends Event {
    readonly domEvent: globalThis.DragEvent;
}
