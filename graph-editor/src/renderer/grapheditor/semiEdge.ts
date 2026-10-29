import Konva from 'konva';
import { Vertex } from './vertex';

export class SemiEdge {
    private line: Konva.Line;
    private group: Konva.Group;

    constructor(
        private sourceVertex: Vertex,
        private graphicsGateway: any,
        private directed: boolean = false
    ) {
        this.group = new Konva.Group();

        const startX = this.sourceVertex.getX();
        const startY = this.sourceVertex.getY();

        this.line = new Konva.Line({
            points: [startX, startY, startX, startY],
            stroke: '#2c3e50',
            strokeWidth: 2,
            dash: [4, 4], 
            pointerLength: this.directed ? 12 : 0,
            pointerWidth: this.directed ? 10 : 0,
            pointerAtEnding: true,
            fill: '#2c3e50',
            listening: false
        });

        this.group.add(this.line);

        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;

        if (konvaLayer) {
            konvaLayer.add(this.group);
            konvaLayer.batchDraw();
        }
    }

    
    public updateEndPoint(x: number, y: number): void {
        const startX = this.sourceVertex.getX();
        const startY = this.sourceVertex.getY();

        
        const dx = x - startX;
        const dy = y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const radius = 25;
        const ux = dx / distance;
        const uy = dy / distance;

        const startXOffset = startX + ux * radius;
        const startYOffset = startY + uy * radius;

        this.line.points([startXOffset, startYOffset, x, y]);

        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;

        if (konvaLayer) {
            konvaLayer.batchDraw();
        }
    }

    public destroy(): void {
        this.group.destroy();
        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;

        if (konvaLayer) {
            konvaLayer.batchDraw();
        }
    }
}