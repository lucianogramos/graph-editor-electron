import { Dispatcher } from "./Dispatcher.interface";
import { Listener } from "./Listener.interface";
import { Shape } from "./Shape.interface";

export interface Layer extends Listener, Dispatcher{
    addShape(shape: Shape): void;
    removeShape(shape: Shape): void;
    draw(): void;
    batchDraw(): void;
}