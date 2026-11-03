
import Konva from "konva";
import { Vector2 } from "../vector2";
import { Direction, Text } from "../interface/text.interface"; 
import { Listener } from "../interface/listener.interface";
import { EventKeyMap } from "../interface/event-key-map.interface"; 

export class TextImpl implements Text {
    private konvaText: Konva.Text;
    private callbacks: Map<string, Array<<K extends keyof EventKeyMap>(event: EventKeyMap[K]) => void>> = new Map();
    private listeners: Listener[] = [];

    public constructor(x: number, y: number, text: string, fontSize: number = 16, fontFamily: string = "Arial", fill: string = "black", draggable: boolean = false, direction: Direction = "ltr", listening: boolean = false) {
        this.konvaText = new Konva.Text({
            x: x,
            y: y,
            text: text,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: fill,
            draggable: draggable,
            direction: direction,
            listening: listening
        });
    }

    public get position(): Vector2 {
        return new Vector2(
            this.konvaText.x(),
            this.konvaText.y()
        );
    }

    public get draggable(): boolean {
        return this.konvaText.draggable();
    }

    public get listening(): boolean {
        return this.konvaText.listening();
    }

    public get text(): string {
        return this.konvaText.text();
    }

    public get textDecoration(): string {
        return this.konvaText.textDecoration();
    }

    public get fontFamily(): string {
        return this.konvaText.fontFamily();
    }

    public get fontSize(): number {
        return this.konvaText.fontSize();
    }

    public get fontStyle(): string {
        return this.konvaText.fontStyle();
    }

    public get fontVariant(): string {
        return this.konvaText.fontVariant();
    }

    public get textAlign(): string {
        return this.konvaText.align();
    }

    public get textVerticalAlign(): string {
        return this.konvaText.verticalAlign();
    }

    public get lineHeight(): number {
        return this.konvaText.lineHeight();
    }

    public get letterSpacing(): number {
        return this.konvaText.letterSpacing();
    }

    public get direction(): Direction {
        return this.konvaText.direction() as Direction;
    }

    public get wrap(): string {
        return this.konvaText.wrap();
    }

    public get ellipsis(): boolean {
        return this.konvaText.ellipsis();
    }

    public get width(): number {
        return this.konvaText.width();
    }

    public get height(): number {
        return this.konvaText.height();
    }

    public setX(x: number): void {
        this.konvaText.x(x);
    }

    public setY(y: number): void {
        this.konvaText.y(y);
    }

    public setPosition(position: Vector2): void {
        this.konvaText.position({
            x: position.x,
            y: position.y
        });
    }

    public setDraggable(draggable: boolean): void {
        this.konvaText.draggable(draggable);
    }

    public setListening(listening: boolean): void {
        this.konvaText.listening(listening);
    }

    public setFill(hex: string): void {
        this.konvaText.fill(hex);
    }

    public setBorderColor(hex: string): void {
        this.konvaText.stroke(hex);
    }
    
    public setBorderWidth(thickness: number): void {
        this.konvaText.strokeWidth(thickness);
    }

    public destroy(): void {
        this.konvaText.destroy();
    }

    public setText(text: string): void {
        this.konvaText.text(text);
    }

    public setTextDecoration(decoration: string): void {
        this.konvaText.textDecoration(decoration);
    }

    public setFontFamily(fontFamily: string): void {
        this.konvaText.fontFamily(fontFamily);
    }

    public setFontSize(size: number): void {
        this.konvaText.fontSize(size);
    }

    public setFontStyle(fontStyle: string): void {
        this.konvaText.fontStyle(fontStyle);
    }

    public setFontVariant(variant: string): void {
        this.konvaText.fontVariant(variant);
    }

    public setTextAlign(textAlign: string): void {
        this.konvaText.align(textAlign);
    }

    public setTextVerticalAlign(textVerticalAlign: string): void {
        this.konvaText.verticalAlign(textVerticalAlign);
    }

    public setLineHeight(height: number): void {
        this.konvaText.lineHeight(height);
    }

    public setLetterSpacing(spacing: number): void {
        this.konvaText.letterSpacing(spacing);
    }

    public setDirection(direction: Direction): void {
        this.konvaText.direction(direction);
    }

    public setWrap(wrap: string): void {
        this.konvaText.wrap(wrap);
    }

    public setEllipsis(value: boolean): void {
        this.konvaText.ellipsis(value);
    }

    public setWidth(width: number): void {
        this.konvaText.width(width);
    }

    public setHeight(height: number): void {
        this.konvaText.height(height);
    }

    public getKonvaShape(): Konva.Text {
        return this.konvaText;
    }

    public on<K extends keyof EventKeyMap>(type: K, callback: (event: EventKeyMap[K]) => void): void {
        if (!this.callbacks.has(type))
            this.callbacks.set(type, []);
        const callbacks: Array<(event: EventKeyMap[K]) => void> = this.callbacks.get(type)!;
        callbacks.push(callback);

        if (callbacks.length === 1) {
                this.konvaText.on(type, (konvaEvent) => {
                konvaEvent.cancelBubble = true;

                const event: EventKeyMap[K] = {
                    cancel: false,
                    target: this,
                    currentTarget: this,
                    domEvent: konvaEvent.evt
                };

                this.processEvent(type, event);
            });
        }
    }

    public off<K extends keyof EventKeyMap>(type: K): void {
        this.konvaText.off(type);
        this.callbacks.delete(type);
    }

    
    public processEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {
        const callbacks = this.callbacks.get(type);
        
        const newEvent = {
            ...event,
            currentTarget: this
        };

        if (callbacks) {
            for (const callback of callbacks) {
                callback(newEvent);
            }
            event.cancel = newEvent.cancel;
        }

        this.dispatchEvent(type, event);
    }
    
    public addListener(listener: Listener): void {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    public dispatchEvent<K extends keyof EventKeyMap>(type: K, event: EventKeyMap[K]): void {

        if (event.cancel) {
            return;
        }
        for (const listener of this.listeners) {            
            listener.processEvent(type, event);
        }
    }
}
