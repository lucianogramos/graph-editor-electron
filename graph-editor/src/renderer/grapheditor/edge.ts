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
        private weight: number,
        private parallelIndex: number = 0,
        private forceInvertCurve: boolean = false
    ) {
        this.group = new Konva.Group();

        const points = this.calculatePoints(this.x1, this.y1, this.x2, this.y2);
        
        let linePoints: number[];
        let arrowRefX: number, arrowRefY: number;
        let textPos: { x: number; y: number };
        let tensionVal = 0;

        if (this.parallelIndex === 0) {
            linePoints = [points[0].x, points[0].y, points[1].x, points[1].y];
            arrowRefX = points[0].x;
            arrowRefY = points[0].y;
            textPos = {
                x: (points[0].x + points[1].x) / 2 - 10,
                y: (points[0].y + points[1].y) / 2 - 10
            };
            tensionVal = 0; 
        } else {
            const midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            linePoints = [points[0].x, points[0].y, midPoint.x, midPoint.y, points[1].x, points[1].y];
            arrowRefX = midPoint.x;
            arrowRefY = midPoint.y;
            textPos = { x: midPoint.x - 10, y: midPoint.y - 10 };
            tensionVal = 0.5;
        }

        this.line = new Konva.Line({
            points: linePoints,
            stroke: '#2c3e50',
            strokeWidth: 2,
            tension: tensionVal
        });

        const arrowPoints = this.calculateArrowHeadPoints(arrowRefX, arrowRefY, points[1].x, points[1].y);
        this.arrowHead = new Konva.Line({
            points: arrowPoints,
            fill: '#2c3e50',
            stroke: '#2c3e50',
            strokeWidth: 1,
            closed: true,
            visible: this.directed
        });

        this.text = new Konva.Text({
            x: textPos.x,
            y: textPos.y,
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

    public setParallelIndex(index: number, forceInvert: boolean): void {
        this.parallelIndex = index;
        this.forceInvertCurve = forceInvert;
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

        return [
            { x: x1 + ux * radius, y: y1 + uy * radius },
            { x: x2 - ux * radius, y: y2 - uy * radius }
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

    private calculateCurvedMidPoint(x1: number, y1: number, x2: number, y2: number, index: number, invert: boolean): { x: number; y: number } {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) return { x: midX, y: midY };

        const nx = -dy / len;
        const ny = dx / len;
        
        let sign = (index % 2 !== 0) ? 1 : -1;
        if (invert) sign *= -1;

        const level = Math.ceil(index / 2);
        const offset = 30 * level * sign;

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
        
        if (this.parallelIndex === 0) {
            this.line.points([points[0].x, points[0].y, points[1].x, points[1].y]);
            this.line.tension(0);
            const arrowPoints = this.calculateArrowHeadPoints(points[0].x, points[0].y, points[1].x, points[1].y);
            this.arrowHead.points(arrowPoints);
            this.text.position({ x: (points[0].x + points[1].x) / 2 - 10, y: (points[0].y + points[1].y) / 2 - 10 });
        } else {
            const midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            this.line.points([points[0].x, points[0].y, midPoint.x, midPoint.y, points[1].x, points[1].y]);
            this.line.tension(0.5);
            const arrowPoints = this.calculateArrowHeadPoints(midPoint.x, midPoint.y, points[1].x, points[1].y);
            this.arrowHead.points(arrowPoints);
            this.text.position({ x: midPoint.x - 10, y: midPoint.y - 10 });
        }
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