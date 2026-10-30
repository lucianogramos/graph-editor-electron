import Konva from 'konva';

export class Edge {
    private line: Konva.Line;
    private arrowHead: Konva.Line;
    private text: Konva.Text;
    private group: Konva.Group;

    constructor(
        private sourceId: number,
        private targetId: number,
        private x1: number,
        private y1: number,
        private x2: number,
        private y2: number,
        private graphicsGateway: any,
        private weighted: boolean,
        private directed: boolean,
        private weight: number
    ) {
        this.group = new Konva.Group();

        const points = this.calculatePoints(this.x1, this.y1, this.x2, this.y2);
        const midPoint = this.calculateMidPoint(this.x1, this.y1, this.x2, this.y2);

        this.line = new Konva.Line({
            points: [points[0].x, points[0].y, points[1].x, points[1].y],
            stroke: '#2c3e50',
            strokeWidth: 2
        });

        const arrowPoints = this.calculateArrowHeadPoints(this.x1, this.y1, points[1].x, points[1].y);
        this.arrowHead = new Konva.Line({
            points: arrowPoints,
            fill: '#2c3e50',
            stroke: '#2c3e50',
            strokeWidth: 1,
            closed: true,
            visible: this.directed
        });

        this.text = new Konva.Text({
            x: midPoint.x - 10,
            y: midPoint.y - 10,
            text: this.weighted ? String(this.weight) : '',
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#2c3e50',
            visible: this.weighted
        });

        this.group.add(this.line);
        this.group.add(this.arrowHead);
        this.group.add(this.text);

        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;

        if (konvaLayer) {
            konvaLayer.add(this.group);
            konvaLayer.batchDraw();
        }
    }

    private calculatePoints(x1: number, y1: number, x2: number, y2: number): { x: number; y: number }[] {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        }

        const radius = 25;
        const ux = dx / distance;
        const uy = dy / distance;

        const startX = x1 + ux * radius;
        const startY = y1 + uy * radius;
        const endX = x2 - ux * radius;
        const endY = y2 - uy * radius;

        return [
            { x: startX, y: startY },
            { x: endX, y: endY }
        ];
    }

    private calculateArrowHeadPoints(x1: number, y1: number, endX: number, endY: number): number[] {
        const dx = endX - x1;
        const dy = endY - y1;
        const angle = Math.atan2(dy, dx);

        const length = 12; 
        const width = 8;   

        const xBase = endX - length * Math.cos(angle);
        const yBase = endY - length * Math.sin(angle);

        const xLeft = xBase + width * Math.sin(angle);
        const yLeft = yBase - width * Math.cos(angle);

        const xRight = xBase - width * Math.sin(angle);
        const yRight = yBase + width * Math.cos(angle);

        return [endX, endY, xLeft, yLeft, xRight, yRight];
    }

    private calculateMidPoint(x1: number, y1: number, x2: number, y2: number): { x: number; y: number } {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) return { x: midX, y: midY };

        const nx = -dy / len;
        const ny = dx / len;
        const offset = 22;

        return {
            x: midX + nx * offset,
            y: midY + ny * offset
        };
    }

    public updatePosition(x1: number, y1: number, x2: number, y2: number): void {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        const points = this.calculatePoints(this.x1, this.y1, this.x2, this.y2);
        const midPoint = this.calculateMidPoint(this.x1, this.y1, this.x2, this.y2);

        this.line.points([points[0].x, points[0].y, points[1].x, points[1].y]);
        
        const arrowPoints = this.calculateArrowHeadPoints(this.x1, this.y1, points[1].x, points[1].y);
        this.arrowHead.points(arrowPoints);

        this.text.position({ x: midPoint.x - 10, y: midPoint.y - 10 });
    }

    public isConnectedTo(vertexId: number): boolean {
        return this.sourceId === vertexId || this.targetId === vertexId;
    }

    public getSourceId(): number {
        return this.sourceId;
    }

    public getTargetId(): number {
        return this.targetId;
    }

    public destroy(): void {
        this.group.destroy();
    }
}