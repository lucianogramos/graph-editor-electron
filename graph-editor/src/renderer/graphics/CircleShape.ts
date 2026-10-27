import type { Shape } from "./Shape";

export interface CircleShape extends Shape {
    setRadius(radius: number): void;
    setPosition(x: number, y: number): void;
}