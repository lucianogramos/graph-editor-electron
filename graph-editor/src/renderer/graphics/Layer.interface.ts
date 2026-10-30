import { Shape } from "./Shape.interface";

export interface Layer {
    addShape(shape: Shape): void;
    removeShape(shape: Shape): void;
    draw(): void;
    batchDraw(): void;
}