import type { Layer } from "./Layer";

export interface Canvas {
    addLayer(layer: Layer): void;
    setSize(width: number, height: number): void;
    destroy(): void;
}