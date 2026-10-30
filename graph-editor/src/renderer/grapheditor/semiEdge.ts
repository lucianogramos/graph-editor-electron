import Konva from 'konva';

export class SemiEdge {
    private line: Konva.Line;
    private group: Konva.Group;
    private controlPoints: { x: number; y: number }[] = [];
    private currentEndPoint: { x: number; y: number } = { x: 0, y: 0 };

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
            tension: 0.3,
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

    public addControlPoint(x: number, y: number): void {
        this.controlPoints.push({ x, y });
    }

    public updateEndPoint(x: number, y: number): void {
        this.currentEndPoint = { x, y };
        const dx = x - this.startX;
        const dy = y - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let startXOffset = this.startX;
        let startYOffset = this.startY;

        if (distance > 0) {
            const radius = 25;
            const ux = dx / distance;
            const uy = dy / distance;
            startXOffset = this.startX + ux * radius;
            startYOffset = this.startY + uy * radius;
        }

        const pts: number[] = [startXOffset, startYOffset];
        for (const cp of this.controlPoints) {
            pts.push(cp.x, cp.y);
        }
        pts.push(x, y);

        this.line.points(pts);

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