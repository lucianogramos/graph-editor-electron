import Konva from "konva";
import type { Canvas } from "./Canvas.interface";
import type { Layer } from "./Layer.interface";
import { LayerImpl } from "./LayerImpl";

export class CanvasImpl<T> implements Canvas {
    private stage: Konva.Stage;

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
}
