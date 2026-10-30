import Konva from 'konva';

export class SemiEdge {
    private line: Konva.Line;
    private group: Konva.Group;

    constructor(
        private startX: number,
        private startY: number,
        private graphicsGateway: any,
        private directed: boolean = false
    ) {
        this.group = new Konva.Group();

        this.line = new Konva.Line({
            points: [this.startX, this.startY, this.startX, this.startY],
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
        const dx = x - this.startX;
        const dy = y - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const radius = 25;
        const ux = dx / distance;
        const uy = dy / distance;

        const startXOffset = this.startX + ux * radius;
        const startYOffset = this.startY + uy * radius;

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