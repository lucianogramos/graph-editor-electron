import type { Shape } from "./Shape";
import { Vector2 } from "./Vector2";

export interface LineShape extends Shape {
    readonly points: Vector2[];
    readonly tension: number;

    setPoints(points: Vector2[]): void;
    addPoint(point: Vector2): void;
    setTension(tension: number): void;
}