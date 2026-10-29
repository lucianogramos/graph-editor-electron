import Konva from "konva";
import type { CircleShape } from "./CircleShape";
import { Vector2 } from "./Vector2";

export class CircleShapeImpl implements CircleShape {
    private circle: Konva.Circle;

    constructor(x: number, y: number, radius: number) {
        this.circle = new Konva.Circle({
            x: x,
            y: y,
            radius: radius,
            fill: "blue",
            stroke: "black",
            strokeWidth: 2,
            draggable: false,
            hitStrokeWidth: 0,
            perfectDrawEnabled: false
        })
    }

    get position(): Vector2 {
        return new Vector2(this.circle.x(), this.circle.y());
    }

    get draggable(): boolean {
        return this.circle.draggable();
    }

    get radius(): number {
        return this.circle.radius();
    }

    setX(x: number): void {
        this.circle.x(x);
    }

    setY(y: number): void {
        this.circle.y(y);
    }

    setPosition(position: Vector2): void {
        this.circle.position({
            x: position.x,
            y: position.y
        });
    }

    setDraggable(draggable: boolean): void {
        this.circle.draggable(draggable);
    }

    setRadius(radius: number): void {
        this.circle.radius(radius);
    }

    fill(hex: string): void {
        this.circle.fill(hex);
    }

    border(thickness: number, hex: string): void {
        this.circle.strokeWidth(thickness);
        this.circle.stroke(hex);
    }

    getKonvaShape(): Konva.Circle {
        return this.circle;
    }

    destroy(): void {
        this.circle.destroy();
    }
}