import type Konva from "konva";
import { Shape } from "./Shape";

export interface Layer {
    attachTo(stage: Konva.Stage): void;
    addShape(shape: Shape): void
    destroy(): void;
}