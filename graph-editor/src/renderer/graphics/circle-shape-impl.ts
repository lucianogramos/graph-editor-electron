import Konva from "konva";
import type { CircleShape } from "./CircleShape.interface";
import type { Listener } from "./Listener.interface";
import type { EventKeyMap } from "./EventKeyMap.interface";
import { Vector2 } from "./Vector2";

export class CircleShapeImpl implements CircleShape {
    private circle: Konva.Circle;
    private callbacks: {[K in keyof EventKeyMap]?: Array<(event: EventKeyMap[K]) => void>;} = {};
    private listeners: Listener[] = [];

    constructor(x: number, y: number, radius: number) {
        this.circle = new Konva.Circle({
            x: x,
            y: y,
            radius: radius,
            fill: "blue",
            stroke: "black",
            strokeWidth: 2,
            draggable: false
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
        this.circle.destroy();
    }
}