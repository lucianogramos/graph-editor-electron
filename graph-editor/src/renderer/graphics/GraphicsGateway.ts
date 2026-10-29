import type { Canvas } from "./Canvas";
import type { CircleShape } from "./CircleShape";
import type { LineShape } from "./LineShape";

import { CanvasImpl } from "./CanvasImpl";
import { CircleShapeImpl } from "./CircleShapeImpl";
import { LineShapeImpl } from "./LineShapeImpl";
import { Vector2 } from "./Vector2";

export function createCanvas<T>(container: string, width: number, height: number): Canvas<T> {
    return new CanvasImpl<T>(container, width, height);
}

export function createCircle(x: number, y: number, radius: number): CircleShape {
    return new CircleShapeImpl(x, y, radius);
}

export function createLine(points: Vector2[]): LineShape {
    return new LineShapeImpl(points);
}