import Konva from "konva";
import type { Layer } from "./layer.interface";
import { LayerImpl } from "./layer-impl"; 
import { Listener } from "./listener.interface";
import { EventKeyMap } from "./event-key-map.interface";
import { Canvas } from "./canvas.interface";

export class CanvasImpl<T> implements Canvas {
    private stage: Konva.Stage;
    private callbacks: {[K in keyof EventKeyMap]?: Array<(event: EventKeyMap[K]) => void>;} = {};
    private listeners: Listener[] = [];

    constructor(container: string, width: number, height: number) {
        this.stage = new Konva.Stage({
            container: container,
            width: width,
            height: height,
            draggable: false
        });
    }

    get width(): number {
        return this.stage.width();
    }

    get height(): number {
        return this.stage.height();
    }

    get draggable(): boolean {
        return this.stage.draggable();
    }

    setWidth(width: number): void {
        this.stage.width(width);
    }

    setHeight(height: number): void {
        this.stage.height(height);
    }

    setSize(width: number, height: number): void {
        this.stage.size({
            width: width,
            height: height
        });
    }

    setDraggable(draggable: boolean): void {
        this.stage.draggable(draggable);
    }

    addLayer(layer: Layer): void {
        if (!(layer instanceof LayerImpl)) {
            throw new Error("A camada deve ser uma LayerImpl.");
        }
        this.stage.add(layer.getKonvaLayer());
    }

    removeLayer(layer: Layer): void {
        if (!(layer instanceof LayerImpl)) {
            throw new Error("A camada deve ser uma LayerImpl.");
        }

        const konvaLayer = layer.getKonvaLayer();

        if (konvaLayer.getParent() === this.stage) {
            konvaLayer.destroy();
        }
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
}
