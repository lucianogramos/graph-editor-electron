import { Vector2 } from '../graphics/vector2';
import * as Graphics from '../graphics/graphics-gateway';
import { LineShape } from '../graphics/line-shape.interface';

export class Edge {
    private lineShape: LineShape;
    private clickCallback?: () => void;

    constructor(
        private sourceId: number,
        private targetId: number,
        private x1: number,
        private y1: number,
        private x2: number,
        private y2: number,
        private weighted: boolean,
        private directed: boolean,
        private weight: number,
        private parallelIndex: number = 0,
        private forceInvertCurve: boolean = false
    ) {
        const points = this.calculatePoints(this.x1, this.y1, this.x2, this.y2);
        
        let linePoints: Vector2[];
        let tensionVal = 0;

        if (this.parallelIndex === 0) {
            linePoints = [new Vector2(points[0].x, points[0].y), new Vector2(points[1].x, points[1].y)];
            tensionVal = 0; 
        } else {
            const midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            linePoints = [
                new Vector2(points[0].x, points[0].y), 
                new Vector2(midPoint.x, midPoint.y), 
                new Vector2(points[1].x, points[1].y)
            ];
            tensionVal = 0.5;
        }

        this.lineShape = Graphics.createLine(linePoints);
        this.lineShape.setTension(tensionVal);

        if (typeof (this.lineShape as any).onClick === 'function') {
            (this.lineShape as any).onClick(() => {
                if (this.clickCallback) {
                    this.clickCallback();
                }
            });
        }
    }

    public onClick(callback: () => void): void {
        this.clickCallback = callback;
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
            this.lineShape.setPoints([
                new Vector2(points[0].x, points[0].y),
                new Vector2(points[1].x, points[1].y)
            ]);
            this.lineShape.setTension(0);
        } else {
            const midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            this.lineShape.setPoints([
                new Vector2(points[0].x, points[0].y),
                new Vector2(midPoint.x, midPoint.y),
                new Vector2(points[1].x, points[1].y)
            ]);
            this.lineShape.setTension(0.5);
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
        if (typeof (this.lineShape as any).destroy === 'function') {
            (this.lineShape as any).destroy();
        }
    }
}