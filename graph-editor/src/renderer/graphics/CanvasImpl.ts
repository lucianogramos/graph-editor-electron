import Konva from "konva";
import type { Canvas } from "./Canvas";
import type { Layer } from "./Layer";

export class CanvasImpl implements Canvas {
    private stage: Konva.Stage;

    constructor(container: string, width: number, height: number) {
        this.stage = new Konva.Stage( {
            container: container,
            width: width,
            height: height
        })
    }
    
    addLayer(layer: Layer): void {
        layer.attachTo(this.stage);
    }

    setSize(width: number, height: number): void {
        this.stage.size({
            width: width,
            height: height
        });
    }

    destroy(): void {
        this.stage.destroy();
    }
}
