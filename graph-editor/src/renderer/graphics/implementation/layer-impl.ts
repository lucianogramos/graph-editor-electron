import Konva from "konva";
import type { Layer } from "../interface/layer.interface"; 
import { Shape } from "../interface/shape.interface";
import { LineShapeImpl } from "./line-shape-impl"; 
import { CircleShapeImpl } from "./circle-shape-impl";
import { EventKeyMap } from "../interface/event-key-map.interface"; 
import { Listener } from "../interface/listener.interface";

export class LayerImpl implements Layer {
    private layer: Konva.Layer;
    private callbacks: Map<string, Array<<K extends keyof EventKeyMap>(event: EventKeyMap[K]) => void>> = new Map();
    private listeners: Listener[] = [];

    constructor() {
        this.layer = new Konva.Layer();
    }

    getKonvaLayer(): Konva.Layer {
        return this.layer;
    }

    private getKonvaShape(shape: Shape): Konva.Shape {
        if (shape instanceof CircleShapeImpl) {
            return shape.getKonvaShape();
        }

        if (shape instanceof LineShapeImpl) {
            return shape.getKonvaShape();
        }

        throw new Error("Tipo de Shape não suportado.");
    }

    addShape(shape: Shape): void {
        const konvaShape = this.getKonvaShape(shape);
        this.layer.add(konvaShape);
    }

    removeShape(shape: Shape): void {
        const konvaShape = this.getKonvaShape(shape);

        if (konvaShape.getParent() === this.layer) {
            konvaShape.destroy();
        }
    }

    draw(): void {
        this.layer.draw();
    }

    batchDraw(): void {
        this.layer.batchDraw();
    }
    
    on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        if (!this.callbacks.has(type))
            this.callbacks.set(type, []);
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks.get(type)!;
        callbacks.push(callback);

        if (callbacks.length === 1) {
                this.layer.on(type, (konvaEvent) => {
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
        this.layer.off(type);
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
}