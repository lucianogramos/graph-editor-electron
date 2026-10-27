import type { Shape } from "./Shape";

export interface LineShape extends Shape {
    setPoints(x1: number, y1: number, x2: number, y2: number): void
    setStrokeWidth(width: number): void
}