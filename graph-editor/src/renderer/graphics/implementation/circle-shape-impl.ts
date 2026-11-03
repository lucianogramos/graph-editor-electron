import Konva from "konva";
import type { CircleShape } from "../interface/circle-shape.interface"; 
import type { Listener } from "../interface/listener.interface";
import type { EventKeyMap } from "../interface/event-key-map.interface"; 
import { Vector2 } from "../vector2";

export class CircleShapeImpl implements CircleShape {
    private circle: Konva.Circle;
    private callbacks: Map<string, Array<<K extends keyof EventKeyMap>(event: EventKeyMap[K]) => void>> = new Map();
    private listeners: Listener[] = [];

    public constructor(x: number, y: number, radius: number, fill: string = "blue", border: string = "black", borderWidth: number = 2, draggable: boolean = false) {
        this.circle = new Konva.Circle({
            x: x,
            y: y,
            radius: radius,
            fill: fill,
            stroke: border,
            strokeWidth: borderWidth,
            draggable: draggable
        })
    }

    public get position(): Vector2 {
        return new Vector2(this.circle.x(), this.circle.y());
    }

    public get draggable(): boolean {
        return this.circle.draggable();
    }

    public get listening(): boolean {
        return this.circle.listening();
    }

    public get radius(): number {
        return this.circle.radius();
    }

    public setX(x: number): void {
        this.circle.x(x);
    }

    public setY(y: number): void {
        this.circle.y(y);
    }

    public setPosition(position: Vector2): void {
        this.circle.position({
            x: position.x,
            y: position.y
        });
    }

    public setDraggable(draggable: boolean): void {
        this.circle.draggable(draggable);
    }

    public setListening(listening: boolean): void {
        this.circle.listening(listening);
    }

    public setRadius(radius: number): void {
        this.circle.radius(radius);
    }

    public fill(hex: string): void {
        this.circle.fill(hex);
    }

    public border(thickness: number, hex: string): void {
        this.circle.strokeWidth(thickness);
        this.circle.stroke(hex);
    }

    public getKonvaShape(): Konva.Circle {
        return this.circle;
    }

    public on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        if (!this.callbacks.has(type))
            this.callbacks.set(type, []);
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks.get(type)!;
        callbacks.push(callback);

        if (callbacks.length === 1) {
                this.circle.on(type, (konvaEvent) => {
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

    public off<K extends keyof EventKeyMap>(type: K): void {
        this.circle.off(type);
        this.callbacks.delete(type);
    }

    
    public processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks.get(type);
        
        const newEvent: EventKeyMap[K] = {
            ...event,
            currentTarget: this,
        };

        if (callbacks) {
            for (const callback of callbacks) {
                callback(newEvent);
            }
            event.cancel = newEvent.cancel;
        }

        this.dispatchEvent(type, event);
    }
    
    public addListener(listener: Listener): void {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    public dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {

        if (event.cancel) {
            return;
        }
        for (const listener of this.listeners) {            
            listener.processEvent(type, event);
        }
    }

    public destroy(): void {
        this.circle.destroy();
    }
}