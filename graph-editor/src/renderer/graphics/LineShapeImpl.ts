import Konva from "konva";
import type { LineShape } from "./LineShape";

export class LineShapeImpl implements LineShape {
    private line: Konva.Line;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.line = new Konva.Line({
            points: [x1, y1, x2, y2],
            stroke: "black",
            strokeWidth: 2
        });
    }

    setPoints(x1: number, y1: number, x2: number, y2: number): void {
        this.line.points([x1, y1, x2, y2]);
    }

    setStrokeWidth(width: number): void {
        this.line.strokeWidth(width);
    }

    setColor(color: string): void {
        this.line.stroke(color);
    }

    setVisible(visible: boolean): void {
        this.line.visible(visible);
    }

    getNode(): Konva.Shape {
        return this.line;
    }

    destroy(): void {
        this.line.destroy();
    }
}