import Konva from "konva";
import type { LineShape } from "../interface/line-shape.interface"; 
import { Vector2 } from "../vector2";
import { EventKeyMap } from "../interface/event-key-map.interface"; 
import type { Listener } from "../interface/listener.interface";

export class LineShapeImpl implements LineShape {
    private line: Konva.Line;
    private callbacks: Map<string, Array<<K extends keyof EventKeyMap>(event: EventKeyMap[K]) => void>> = new Map();
    private listeners: Listener[] = [];

    constructor(points: Vector2[], border: string = "black", borderWidth: number = 2, tension: number = 0, draggable: boolean = false, closed: boolean = false) {
        const coordinates = points.flatMap(
            point => [point.x, point.y]
        );

        this.line = new Konva.Line({
            points: coordinates,
            stroke: border,
            strokeWidth: borderWidth,
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
        if (!this.callbacks.has(type))
            this.callbacks.set(type, []);
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks.get(type)!;
        callbacks.push(callback);

        if (callbacks.length === 1) {
                this.line.on(type, (konvaEvent) => {
                konvaEvent.cancelBubble = true;

                const event: EventKeyMap[K] = {
                    cancel: false,
                    target: this,
                    currentTarget: this,
                    domEvent: konvaEvent.evt
                };

                this.processEvent(type, event);
            });
        }
    }
    
    off<K extends keyof EventKeyMap>(type: K): void {
        this.line.off(type);
        this.callbacks.delete(type);
    }
    
        
    processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks.get(type);
        
        const newEvent = {
            ...event,
            currentTarget: this
        };

        if (callbacks) {
            for (const callback of callbacks) {
                callback(newEvent);
            }
            event.cancel = newEvent.cancel;
        }

        this.dispatchEvent(type, event);
    }

    addListener(listener: Listener): void {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {

        if (event.cancel) {
            return;
        }
        for (const listener of this.listeners) {            
            listener.processEvent(type, event);
        }
    }

    destroy(): void {
        this.line.destroy();
    }
}