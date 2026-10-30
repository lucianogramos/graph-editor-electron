export class Vertex {
    private observers: Array<(type: string, eventData: any) => void> = [];
    private label: string;
    private isDraggable: boolean = false;

    constructor(
        private x: number,
        private y: number,
        private id: number
    ) {
        this.label = id.toString();
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
        this.dispatchEvent('MOVE', { vertex: this, x: this.x, y: this.y });
    }

    public getLabel(): string {
        return this.label;
    }

    public setLabel(label: string): void {
        this.label = label;
    }

    public setDraggable(draggable: boolean): void {
        this.isDraggable = draggable;
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
    }
}