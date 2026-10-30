import type { Canvas } from "./interface/canvas.interface"; 
import type { CircleShape } from "./interface/circle-shape.interface"; 
import type { LineShape } from "./interface/line-shape.interface"; 
import { Layer } from "./interface/layer.interface";  
import { TextImpl } from "./implementation/text-impl"; 
import { Direction, Text } from "./interface/text.interface"; 

import { CanvasImpl } from "./implementation/canvas-impl";  
import { CircleShapeImpl } from "./implementation/circle-shape-impl"; 
import { LineShapeImpl } from "./implementation/line-shape-impl"; 
import { Vector2 } from "./vector2";
import { LayerImpl } from "./implementation/layer-impl"; 

export function createCanvas<T>(container: string, width: number, height: number): Canvas {
    return new CanvasImpl(container, width, height);
}

export function createCircle(x: number, y: number, radius: number, fill: string = "blue", stroke: string = "black", strokeWidth: number = 2, draggable: boolean = false): CircleShape {
    return new CircleShapeImpl(x, y, radius, fill, stroke, strokeWidth, draggable);
}

export function createLine(points: Vector2[], stroke: string = "black", strokeWidth: number = 2, tension: number = 0, draggable: boolean = false, closed: boolean = false): LineShape {
    return new LineShapeImpl(points, stroke, strokeWidth, tension, draggable, closed);
}

export function createLayer(): Layer {
    return new LayerImpl();
}

export function createText(x: number, y: number, text: string, fontSize: number = 16, fontFamily: string = "Arial", fill: string = "black", draggable: boolean = false, direction: Direction = "ltr"): Text {
    return new TextImpl(x, y, text, fontSize, fontFamily, fill, draggable, direction);
}