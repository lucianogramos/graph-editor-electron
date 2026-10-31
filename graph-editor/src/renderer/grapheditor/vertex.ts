import * as Graphics from '../graphics/graphics-gateway';
import { CircleShape } from '../graphics/interface/circle-shape.interface';
import { Text } from '../graphics/interface/text.interface';
import { Layer } from '../graphics/interface/layer.interface';

export class Vertex {
    private observers: Array<(type: string, eventData: any) => void> = [];
    private label: string;
    private isDraggable: boolean = false;
    
    private circleShape: CircleShape;
    private textShape: Text;

    constructor(
        private x: number,
        private y: number,
        private id: number,
        private layer: Layer
    ) {
        this.label = id.toString();

        this.circleShape = Graphics.createCircle(x, y, 25);
        this.textShape = Graphics.createText(x - 15, y - 7, this.label, 14);

        this.textShape.fill('#ffffff');
        this.textShape.setFontStyle('bold');
        this.textShape.setTextAlign('center');
        this.textShape.setWidth(30);


        const nativeText = (this.textShape as any).getNativeShape ? (this.textShape as any).getNativeShape() : (this.textShape as any);
        if (nativeText && typeof nativeText.listening === 'function') {
            nativeText.listening(false);
        }


        this.layer.addShape(this.circleShape);

        let lastClickTime = 0;
        (this.circleShape as any).on('click', () => {
            const now = Date.now();
            if (now - lastClickTime < 150) return;
            lastClickTime = now;
            this.dispatchEvent('CLICK', { vertex: this });
        });

        (this.circleShape as any).on('dragmove', () => {
            const pos = (this.circleShape as any).getPosition ? (this.circleShape as any).getPosition() : { x: (this.circleShape as any).getX(), y: (this.circleShape as any).getY() };
            if (pos) {
                this.x = pos.x;
                this.y = pos.y;
                this.textShape.setPosition({ x: this.x - 15, y: this.y - 7 });
                this.dispatchEvent('MOVE', { vertex: this, x: this.x, y: this.y });
            }
        });
    }

    public getId(): number { 
        return this.id; 
    }

    public getX(): number { 
        return this.x; 
    }

    public getY(): number { 
        return this.y; 
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        
        this.circleShape.setPosition({ x, y });
        this.textShape.setPosition({ x: x - 15, y: y - 7 });

        this.dispatchEvent('MOVE', { vertex: this, x: this.x, y: this.y });
    }

    public getLabel(): string {
        return this.label;
    }

    public setLabel(label: string): void {
        this.label = label;
        this.textShape.setText(label);
    }

    public setDraggable(draggable: boolean): void {
        this.isDraggable = draggable;
        this.circleShape.setDraggable(draggable);
    }

    public getDraggable(): boolean {
        return this.isDraggable;
    }

    public addObserver(callback: (type: string, eventData: any) => void): void {
        this.observers.push(callback);
    }

    public removeObserver(callback: (type: string, eventData: any) => void): void {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    public dispatchEvent(type: string, eventData: any): void {
        for (const callback of this.observers) {
            callback(type, eventData);
        }
    }

    public destroy(): void {
        this.layer.removeShape(this.circleShape);
        this.circleShape.destroy();
        this.textShape.destroy();
    }
}