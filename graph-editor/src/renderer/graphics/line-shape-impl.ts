import Konva from "konva";
import type { LineShape } from "./line-shape.interface"; 
import { Vector2 } from "./vector2";
import { EventKeyMap } from "./event-key-map.interface"; 
import type { Listener } from "./listener.interface";

export class LineShapeImpl implements LineShape {
    private line: Konva.Line;
    private callbacks: {[K in keyof EventKeyMap]?: Array<(event: EventKeyMap[K]) => void>;} = {};
    private listeners: Listener[] = [];

    constructor(points: Vector2[], stroke: string = "black", strokeWidth: number = 2, tension: number = 0, draggable: boolean = false, closed: boolean = false) {
        const coordinates = points.flatMap(
            point => [point.x, point.y]
        );

        this.line = new Konva.Line({
            points: coordinates,
            stroke: stroke,
            strokeWidth: strokeWidth,
            tension: tension,
            closed: closed,
            draggable: draggable
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

    on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks[type] ?? [];
        callbacks.push(callback);
        this.callbacks[type] = callbacks;
    }
    
    off<K extends keyof EventKeyMap>(type: K): void {
        delete this.callbacks[type];
    }
    
        
    processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks[type];
    
        if (!callbacks) {
            return;
        }
    
        for (const callback of [...callbacks]) {
            if (event.cancel) {
                break;
            }
    
            callback(event);
        }
    }

    addListener(listener: Listener): void {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        this.processEvent(type, event);

        for (const listener of [...this.listeners]) {
            if (event.cancel) {
                break;
            }

            listener.processEvent(type, event);
        }
    }

    destroy(): void {
        this.line.destroy();
    }
}