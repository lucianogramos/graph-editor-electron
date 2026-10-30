import Konva from "konva";
import type { Layer } from "../interface/layer.interface"; 
import { Shape } from "../interface/shape.interface";
import { LineShapeImpl } from "./line-shape-impl"; 
import { CircleShapeImpl } from "./circle-shape-impl";
import { EventKeyMap } from "../interface/event-key-map.interface"; 
import { Listener } from "../interface/listener.interface";

export class LayerImpl implements Layer {
    private layer: Konva.Layer;
    private callbacks: {[K in keyof EventKeyMap]?: Array<(event: EventKeyMap[K]) => void>;} = {};
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
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks[type] ?? [];
        callbacks.push(callback);
        this.callbacks[type] = callbacks;

        if (callbacks.length === 1) {
            this.layer.on("click", (konvaEvent) => {
            konvaEvent.cancelBubble = true;

            const event = {
                cancel: false,
                target: this,
                currentTarget: this,
                domEvent: konvaEvent.evt
            };

            this.processEvent("click", event);
            });
        }
    }

    off<K extends keyof EventKeyMap>(type: K): void {
        this.layer.off("click");
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
}