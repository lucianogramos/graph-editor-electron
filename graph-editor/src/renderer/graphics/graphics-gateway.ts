import type { Canvas } from "./canvas.interface"; 
import type { CircleShape } from "./circle-shape.interface"; 
import type { LineShape } from "./line-shape.interface";
import { Layer } from "./layer.interface"; 

import { CanvasImpl } from "./canvas-impl"; 
import { CircleShapeImpl } from "./circle-shape-impl"; 
import { LineShapeImpl } from "./line-shape-impl"; 
import { Vector2 } from "./Vector2";
import { LayerImpl } from "./layer-impl";

export function createCanvas<T>(container: string, width: number, height: number): Canvas {
    return new CanvasImpl(container, width, height);
}

export function createCircle(x: number, y: number, radius: number): CircleShape {
    return new CircleShapeImpl(x, y, radius);
}

export function createLine(points: Vector2[]): LineShape {
    return new LineShapeImpl(points);
}

export function createLayer(): Layer {
    return new LayerImpl();
}