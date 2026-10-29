import type { Layer } from "./Layer";

export interface Canvas {
    readonly width: number;
    readonly height: number;
    readonly draggable: boolean;

    setWidth(width: number): void;
    setHeight(height: number): void;
    setSize(width: number, height: number): void;
    setDraggable(draggable: boolean): void;
    addLayer(layer: Layer): void;
    removeLayer(layer: Layer): void;
}