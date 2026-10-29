import { Vector2 } from "./Vector2";

export interface Shape {
    readonly position: Vector2;
    readonly draggable: boolean

    setX(x: number): void;
    setY(y: number): void;
    setPosition(position: Vector2): void;
    setDraggable(draggable: boolean): void;
    fill(hex: string): void;
    border(thickness: number, hex: string): void;
    destroy(): void;
}