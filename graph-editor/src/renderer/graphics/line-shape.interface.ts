import type { Shape } from "./Shape.interface";
import { Vector2 } from "./Vector2";

export interface LineShape extends Shape {
    readonly points: Vector2[];
    readonly tension: number;
    readonly loop: boolean;

    setPoints(points: Vector2[]): void;
    addPoint(point: Vector2): void;
    setTension(tension: number): void;
    setLoop(loop: boolean): void;
}