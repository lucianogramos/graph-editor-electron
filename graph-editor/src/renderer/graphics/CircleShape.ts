import type { Shape } from "./Shape";

export interface CircleShape extends Shape {
    readonly radius: number;

    setRadius(radius: number): void;
}