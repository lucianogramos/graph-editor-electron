import Konva from "konva";
import type { Layer } from "./Layer";
import { Shape } from "./Shape";

export class LayerImpl implements Layer {
    private layer: Konva.Layer;

    constructor() {
        this.layer = new Konva.Layer;
    }

    attachTo(stage: Konva.Stage): void {
        stage.add(this.layer);
    }

    addShape(shape: Shape): void {
        this.layer.add(shape.getNode())
    }

    destroy(): void {
        this.layer.destroy();
    }
}