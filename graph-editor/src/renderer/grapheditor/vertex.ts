import Konva from "konva";
import { Subject, Observer, VertexEventType } from './specifications';
import { CircleShapeImpl } from '../graphics/CircleShapeImpl';

export class Vertex implements Subject<VertexEventType, any> {
    private observers: Observer<VertexEventType, any>[] = [];
    private circleShape: CircleShapeImpl;
    private textNode: Konva.Text;
    private isDraggable: boolean = false;
    private hasMoved: boolean = false;

    constructor(
        private x: number, 
        private y: number, 
        layer: any, 
        private id: number
    ) {
        this.circleShape = new CircleShapeImpl(this.x, this.y, 25);
        layer.addShape(this.circleShape);

        const konvaLayer = typeof layer.getKonvaLayer === 'function' 
            ? layer.getKonvaLayer() 
            : (layer as any).layer;

        this.textNode = new Konva.Text({
            text: id.toString(),
            x: this.x - 15,
            y: this.y - 7,
            fontSize: 14,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            width: 30,
            listening: false
        });

        if (konvaLayer) {
            konvaLayer.add(this.textNode);
        }

        const konvaNode = this.circleShape.getKonvaShape() as any;

        konvaNode.draggable(true);

        konvaNode.on('dragstart', (e: any) => {
            if (!this.isDraggable) {
                e.target.stopDrag();
                return;
            }
            e.cancelBubble = true;
            this.hasMoved = false;
        });

        konvaNode.on('dragmove', (e: any) => {
            if (!this.isDraggable) return;
            this.hasMoved = true;

            const pos = konvaNode.position();
            this.x = pos.x;
            this.y = pos.y;

            this.textNode.position({
                x: this.x - 15,
                y: this.y - 7
            });

            this.dispatchEvent(VertexEventType.MOVE, { vertex: this, x: this.x, y: this.y });

            const currentLayer = konvaNode.getLayer();
            if (currentLayer) {
                currentLayer.batchDraw();
            }
        });

        konvaNode.on('click', (eventData: any) => {
            if (this.hasMoved) {
                this.hasMoved = false;
                return; 
            }
            this.dispatchEvent(VertexEventType.CLICK, { vertex: this, event: eventData });
        });

        konvaNode.on('dblclick', (e: any) => {
            if (!this.isDraggable) {
                return; 
            }
            e.cancelBubble = true;
            const currentText = this.textNode.text();
            const newName = window.prompt("Digite o novo nome para o vértice:", currentText);
            
            if (newName !== null && newName.trim() !== "") {
                this.setLabel(newName.trim());
            }
        });
    }

    public getId(): number { return this.id; }
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }

    public setLabel(label: string): void {
        this.textNode.text(label);
        const konvaNode = this.circleShape.getKonvaShape() as any;
        const currentLayer = konvaNode.getLayer();
        if (currentLayer) {
            currentLayer.batchDraw();
        }
    }

    public setDraggable(draggable: boolean): void {
        this.isDraggable = draggable;
        const konvaNode = this.circleShape.getKonvaShape() as any;
        if (konvaNode) {
            konvaNode.draggable(draggable);
        }
    }

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
        if (this.textNode) {
            this.textNode.destroy();
        }
    }
}