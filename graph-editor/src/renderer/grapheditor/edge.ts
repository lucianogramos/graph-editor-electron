import { Vector2 } from '../graphics/vector2';
import * as Graphics from '../graphics/graphics-gateway';
import { LineShape } from '../graphics/interface/line-shape.interface';
import { Text } from '../graphics/interface/text.interface';
import { Layer } from '../graphics/interface/layer.interface';

export class Edge {
    private lineShape: LineShape;
    private arrowHead?: LineShape;
    private weightText?: Text;
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
        private forceInvertCurve: boolean = false,
        private layer: Layer
    ) {
        const points = this.calculatePoints(this.x1, this.y1, this.x2, this.y2);
        
        let linePoints: Vector2[];
        let tensionVal = 0;
        let midPoint: { x: number; y: number };

        if (this.parallelIndex === 0) {
            linePoints = [new Vector2(points[0].x, points[0].y), new Vector2(points[1].x, points[1].y)];
            tensionVal = 0; 
            midPoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        } else {
            midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            linePoints = [
                new Vector2(points[0].x, points[0].y), 
                new Vector2(midPoint.x, midPoint.y), 
                new Vector2(points[1].x, points[1].y)
            ];
            tensionVal = 0.5;
        }

        this.lineShape = Graphics.createLine(linePoints);
        this.lineShape.setTension(tensionVal);
        this.layer.addShape(this.lineShape);

        if (this.directed) {
            const arrowPoints = this.calculateArrowPoints(linePoints);
            this.arrowHead = Graphics.createLine(arrowPoints, "black", 2, 0, false, true);
            (this.arrowHead as any).fill?.("black"); 
            this.layer.addShape(this.arrowHead);
        }

        if (this.weighted) {
            this.weightText = Graphics.createText(midPoint.x + 5, midPoint.y - 15, this.weight.toString(), 12);
            if (this.weightText) {
                (this.weightText as any).fill?.('#ffffff');
                this.layer.addShape(this.weightText as any);
            }
        }

        this.layer.batchDraw();

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
        const distance = Math.sqrt(dx + dx + dy * dy) || 1;
        const realDist = Math.sqrt(dx * dx + dy * dy);

        if (realDist === 0) {
            return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        }

        const radius = 25;
        const ux = dx / realDist;
        const uy = dy / realDist;

        return [
            { x: x1 + ux * radius, y: y1 + uy * radius },
            { x: x2 - ux * radius, y: y2 - uy * radius }
        ];
    }

    private calculateArrowPoints(linePoints: Vector2[]): Vector2[] {
        const pEnd = linePoints[linePoints.length - 1];
        const pPrev = linePoints[linePoints.length - 2];

        const dx = pEnd.x - pPrev.x;
        const dy = pEnd.y - pPrev.y;
        const angle = Math.atan2(dy, dx);

        const arrowLength = 12;
        const arrowWidth = 7;

        const tip = { x: pEnd.x, y: pEnd.y };

        const left = {
            x: tip.x - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle),
            y: tip.y - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle)
        };

        const right = {
            x: tip.x - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle),
            y: tip.y - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle)
        };

        return [new Vector2(tip.x, tip.y), new Vector2(left.x, left.y), new Vector2(right.x, right.y)];
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
        let midPoint: { x: number; y: number };
        let linePoints: Vector2[];
        
        if (this.parallelIndex === 0) {
            linePoints = [
                new Vector2(points[0].x, points[0].y),
                new Vector2(points[1].x, points[1].y)
            ];
            this.lineShape.setPoints(linePoints);
            this.lineShape.setTension(0);
            midPoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        } else {
            midPoint = this.calculateCurvedMidPoint(this.x1, this.y1, this.x2, this.y2, this.parallelIndex, this.forceInvertCurve);
            linePoints = [
                new Vector2(points[0].x, points[0].y),
                new Vector2(midPoint.x, midPoint.y),
                new Vector2(points[1].x, points[1].y)
            ];
            this.lineShape.setPoints(linePoints);
            this.lineShape.setTension(0.5);
        }

        if (this.arrowHead) {
            const arrowPoints = this.calculateArrowPoints(linePoints);
            this.arrowHead.setPoints(arrowPoints);
        }

        if (this.weightText) {
            this.weightText.setPosition({ x: midPoint.x + 5, y: midPoint.y - 15 });
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
        this.layer.removeShape(this.lineShape);
        if (this.arrowHead) {
            this.layer.removeShape(this.arrowHead);
            if (typeof (this.arrowHead as any).destroy === 'function') {
                (this.arrowHead as any).destroy();
            }
        }
        if (this.weightText) {
            this.layer.removeShape(this.weightText as any);
            if (typeof (this.weightText as any).destroy === 'function') {
                (this.weightText as any).destroy();
            }
        }
        if (typeof (this.lineShape as any).destroy === 'function') {
            (this.lineShape as any).destroy();
        }
    }
}