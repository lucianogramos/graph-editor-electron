import Konva from "konva";
import type { Layer } from "../interface/layer.interface";
import { LayerImpl } from "./layer-impl"; 
import { EventKeyMap } from "../interface/event-key-map.interface"; 
import { Canvas } from "../interface/canvas.interface"; 

export class CanvasImpl implements Canvas {
    private stage: Konva.Stage;
    private callbacks: Map<string, Array<<K extends keyof EventKeyMap>(event: EventKeyMap[K]) => void>> = new Map();

    public constructor(container: string, width: number, height: number) {
        this.stage = new Konva.Stage({
            container: container,
            width: width,
            height: height,
            draggable: false
        });
    }

    public get width(): number {
        return this.stage.width();
    }

    public get height(): number {
        return this.stage.height();
    }

    public get draggable(): boolean {
        return this.stage.draggable();
    }

    public setWidth(width: number): void {
        this.stage.width(width);
    }

    public setHeight(height: number): void {
        this.stage.height(height);
    }

    public setSize(width: number, height: number): void {
        this.stage.size({
            width: width,
            height: height
        });
    }

    public setDraggable(draggable: boolean): void {
        this.stage.draggable(draggable);
    }

    public addLayer(layer: Layer): void {
        if (!(layer instanceof LayerImpl)) {
            throw new Error("A camada deve ser uma LayerImpl.");
        }
        this.stage.add(layer.getKonvaLayer());
    }

    public removeLayer(layer: Layer): void {
        if (!(layer instanceof LayerImpl)) {
            throw new Error("A camada deve ser uma LayerImpl.");
        }

        const konvaLayer = layer.getKonvaLayer();

        if (konvaLayer.getParent() === this.stage) {
            konvaLayer.destroy();
        }
    }

    public on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        if (!this.callbacks.has(type))
            this.callbacks.set(type, []);
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks.get(type)!;
        callbacks.push(callback);

        if (callbacks.length === 1) {
                this.stage.on(type, (konvaEvent) => {
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
        this.stage.off(type);
        this.callbacks.delete(type);
    }
        
            
    public processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks.get(type);
        
        const newEvent = {
            ...event,
            currentTarget: this
        };

        if (callbacks) {
            for (const callback of callbacks) {
                callback(newEvent);
            }
        }
    }
}
