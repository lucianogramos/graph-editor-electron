import { Dispatcher } from "./dispatcher.interface";
import { Listener } from "./listener.interface";
import { Shape } from "./shape.interface";

export interface Layer extends Listener, Dispatcher{
    addShape(shape: Shape): void;
    removeShape(shape: Shape): void;
    draw(): void;
    batchDraw(): void;
}