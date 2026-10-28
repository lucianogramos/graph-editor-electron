import { Subject, Observer, VertexEventType } from './specifications';
import { CircleShapeImpl } from '../graphics/CircleShapeImpl';

export class Vertex implements Subject<VertexEventType, any> {
    private observers: Observer<VertexEventType, any>[] = [];
    private circleShape: CircleShapeImpl;

    constructor(private x: number, private y: number, layer: any) {
        
        this.circleShape = new CircleShapeImpl(this.x, this.y, 25);
        
        
        layer.addShape(this.circleShape);

        
        const konvaNode = this.circleShape.getNode() as any;

        konvaNode.on('click', (eventData: any) => {
            this.dispatchEvent(VertexEventType.CLICK, { vertex: this, event: eventData });
        });

        konvaNode.on('dragmove', (eventData: any) => {
            const pos = eventData?.target ? { x: eventData.target.x(), y: eventData.target.y() } : { x: this.x, y: this.y };
            this.x = pos.x;
            this.y = pos.y;
            this.dispatchEvent(VertexEventType.MOVE, { vertex: this, x: this.x, y: this.y });
        });
    }

    public getX(): number { return this.x; }
    public getY(): number { return this.y; }

    public addObserver(observer: Observer<VertexEventType, any>): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: Observer<VertexEventType, any>): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    public dispatchEvent(type: VertexEventType, eventData: any): void {
        for (const observer of this.observers) {
            observer.processEvent(type, eventData);
        }
    }

    public destroy(): void {
        this.circleShape.destroy();
    }
}