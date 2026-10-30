import type { Shape } from "./shape.interface";

export interface CircleShape extends Shape {
    readonly radius: number;

    setRadius(radius: number): void;
}