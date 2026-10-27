import type Konva from "konva";

export interface Shape {
    setColor(color: string): void;
    setVisible(visible: boolean): void;
    getNode(): Konva.Shape;
    destroy(): void;
}