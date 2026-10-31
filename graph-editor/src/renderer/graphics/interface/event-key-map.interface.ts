import type { DragEvent, MouseEvent, PointerEvent } from "./events.interface"; 

export interface EventKeyMap {
    click: PointerEvent;
    dblclick: MouseEvent;
    dragmove: DragEvent;
}
