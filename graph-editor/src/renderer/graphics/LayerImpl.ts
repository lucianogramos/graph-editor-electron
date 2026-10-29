import Konva from "konva";
import type { Layer } from "./Layer";
import { Shape } from "./Shape";
import { CircleShapeImpl } from "./CircleShapeImpl";
import { LineShapeImpl } from "./LineShapeImpl";

export class LayerImpl implements Layer {
    private layer: Konva.Layer;

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
}