import Konva from "konva";
import type { LineShape } from "./LineShape.interface";
import { Vector2 } from "./Vector2";

export class LineShapeImpl implements LineShape {
    private line: Konva.Line;

    constructor(points: Vector2[]) {
        const coordinates = points.flatMap(
            point => [point.x, point.y]
        );

        this.line = new Konva.Line({
            points: coordinates,
            stroke: "black",
            strokeWidth: 2,
            tension: 0,
            closed: false,
            draggable: false
        });
    }

    get position(): Vector2 {
        return new Vector2(this.line.x(), this.line.y());
    }

    get draggable(): boolean {
        return this.line.draggable();
    }

    get points(): Vector2[] {
        const coordinates = this.line.points();
        const result: Vector2[] = [];

        for (let i = 0; i < coordinates.length; i += 2) {
            result.push(new Vector2(coordinates[i], coordinates[i + 1]));
        }

        return result;
    }

    get tension(): number {
        return this.line.tension();
    }

    get loop(): boolean {
        return this.line.closed();
    }

    setX(x: number): void {
        this.line.x(x);
    }

    setY(y: number): void {
        this.line.y(y);
    }

    setPosition(position: Vector2): void {
        this.line.position({
            x: position.x,
            y: position.y
        });
    }

    setDraggable(draggable: boolean): void {
        this.line.draggable(draggable);
    }

    setPoints(points: Vector2[]): void {
        const coordinates = points.flatMap(
            point => [point.x, point.y]
        );
        this.line.points(coordinates);
    }

    addPoint(point: Vector2): void {
        const coordinates = this.line.points();

        this.line.points([...coordinates, point.x,point.y]);
    }

    setTension(tension: number): void {
        this.line.tension(tension);
    }

    setLoop(loop: boolean): void {
        this.line.closed(loop);
    }

    fill(hex: string): void {
        this.line.fill(hex);
    }

    border(thickness: number, hex: string): void {
        this.line.strokeWidth(thickness);
        this.line.stroke(hex);
    }

    getKonvaShape(): Konva.Line {
        return this.line;
    }

    destroy(): void {
        this.line.destroy();
    }
}