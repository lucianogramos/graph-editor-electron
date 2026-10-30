
import Konva from "konva";
import { Vector2 } from "./Vector2";
import { Direction, Text } from "./text.interface";
import { Listener } from "./listener.interface";
import { EventKeyMap } from "./event-key-map.interface";

export class TextImpl implements Text {
    private konvaText: Konva.Text;
    private callbacks: {[K in keyof EventKeyMap]?: Array<(event: EventKeyMap[K]) => void>;} = {};
    private listeners: Listener[] = [];

    constructor(x: number, y: number, text: string, fontSize: number = 16, fontFamily: string = "Arial", fill: string = "black", draggable: boolean = false, direction: Direction = "ltr") {
        this.konvaText = new Konva.Text({
            x: y,
            y: y,
            text: text,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: fill,
            draggable: draggable,
            direction: direction
        });
    }

    get position(): Vector2 {
        return new Vector2(
            this.konvaText.x(),
            this.konvaText.y()
        );
    }

    get draggable(): boolean {
        return this.konvaText.draggable();
    }

    setX(x: number): void {
        this.konvaText.x(x);
    }

    setY(y: number): void {
        this.konvaText.y(y);
    }

    setPosition(position: Vector2): void {
        this.konvaText.position({
            x: position.x,
            y: position.y
        });
    }

    setDraggable(draggable: boolean): void {
        this.konvaText.draggable(draggable);
    }

    fill(hex: string): void {
        this.konvaText.fill(hex);
    }

    border(thickness: number, hex: string): void {
        this.konvaText.strokeWidth(thickness);
        this.konvaText.stroke(hex);
    }

    destroy(): void {
        this.konvaText.destroy();
    }

    get text(): string {
        return this.konvaText.text();
    }

    get textDecoration(): string {
        return this.konvaText.textDecoration();
    }

    get fontFamily(): string {
        return this.konvaText.fontFamily();
    }

    get fontSize(): number {
        return this.konvaText.fontSize();
    }

    get fontStyle(): string {
        return this.konvaText.fontStyle();
    }

    get fontVariant(): string {
        return this.konvaText.fontVariant();
    }

    get textAlign(): string {
        return this.konvaText.align();
    }

    get textVerticalAlign(): string {
        return this.konvaText.verticalAlign();
    }

    get lineHeight(): number {
        return this.konvaText.lineHeight();
    }

    get letterSpacing(): number {
        return this.konvaText.letterSpacing();
    }

    get direction(): Direction {
        return this.konvaText.direction() as Direction;
    }

    get wrap(): string {
        return this.konvaText.wrap();
    }

    get ellipsis(): boolean {
        return this.konvaText.ellipsis();
    }

    get width(): number {
        return this.konvaText.width();
    }

    get height(): number {
        return this.konvaText.height();
    }

    setText(text: string): void {
        this.konvaText.text(text);
    }

    setTextDecoration(decoration: string): void {
        this.konvaText.textDecoration(decoration);
    }

    setFontFamily(fontFamily: string): void {
        this.konvaText.fontFamily(fontFamily);
    }

    setFontSize(size: number): void {
        this.konvaText.fontSize(size);
    }

    setFontStyle(fontStyle: string): void {
        this.konvaText.fontStyle(fontStyle);
    }

    setFontVariant(variant: string): void {
        this.konvaText.fontVariant(variant);
    }

    setTextAlign(textAlign: string): void {
        this.konvaText.align(textAlign);
    }

    setTextVerticalAlign(textVerticalAlign: string): void {
        this.konvaText.verticalAlign(textVerticalAlign);
    }

    setLineHeight(height: number): void {
        this.konvaText.lineHeight(height);
    }

    setLetterSpacing(spacing: number): void {
        this.konvaText.letterSpacing(spacing);
    }

    setDirection(direction: Direction): void {
        this.konvaText.direction(direction);
    }

    setWrap(wrap: string): void {
        this.konvaText.wrap(wrap);
    }

    setEllipsis(value: boolean): void {
        this.konvaText.ellipsis(value);
    }

    setWidth(width: number): void {
        this.konvaText.width(width);
    }

    setHeight(height: number): void {
        this.konvaText.height(height);
    }

    getKonvaShape(): Konva.Text {
        return this.konvaText;
    }

    on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks[type] ?? [];
        callbacks.push(callback);
        this.callbacks[type] = callbacks;
    }

    off<K extends keyof EventKeyMap>(type: K): void {
        delete this.callbacks[type];
    }

    
    processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks[type];

        if (!callbacks) {
            return;
        }

        for (const callback of [...callbacks]) {
            if (event.cancel) {
                break;
            }

            callback(event);
        }
    }
    
    addListener(listener: Listener): void {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        this.processEvent(type, event);

        for (const listener of [...this.listeners]) {
            if (event.cancel) {
                break;
            }

            listener.processEvent(type, event);
        }
    }
}
