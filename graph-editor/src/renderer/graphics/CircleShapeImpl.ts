import Konva from "konva";
import type { CircleShape } from "./CircleShape";

export class CircleShapeImpl implements CircleShape {
    private circle: Konva.Circle;

    constructor(x: number, y: number, radius: number) {
        this.circle = new Konva.Circle({
            x: x,
            y: y,
            radius: radius,
            fill: "blue",
            stroke: "black",
            strokeWidth: 2
        })
    }

    setRadius(radius: number): void {
        this.circle.radius(radius);
    }

    setPosition(x: number, y: number): void {
        this.circle.position({
            x: x,
            y: y
        });
    }

    setColor(color: string): void {
        this.circle.fill(color);
    }

    setVisible(visible: boolean): void {
        this.circle.visible(visible);
    }

    getNode(): Konva.Shape {
        return this.circle;
    }

    destroy(): void {
        this.circle.destroy();
    }
}