import { Vector2 } from '../graphics/vector2';
import { Layer } from '../graphics/interface/layer.interface';
import { LineShape } from '../graphics/interface/line-shape.interface';

export class SemiEdge {
    private controlPoints: Vector2[] = [];
    private currentEndPoint: { x: number; y: number } = { x: 0, y: 0 };
    private lineShape: LineShape;

    constructor(
        private startX: number,
        private startY: number,
        private graphicsGateway: { createLine: (points: Vector2[]) => LineShape },
        private directed: boolean = false,
        private layer: Layer
    ) {
        const initialPoints = [
            new Vector2(this.startX, this.startY),
            new Vector2(this.startX, this.startY)
        ];

        this.lineShape = this.graphicsGateway.createLine(initialPoints);
        this.lineShape.setTension(0.3);

        this.layer.addShape(this.lineShape);
        this.layer.batchDraw();
    }

    public addControlPoint(x: number, y: number): void {
        this.controlPoints.push(new Vector2(x, y));
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

        let endX = x;
        let endY = y;
        if (distance > 5) {
            const ux = dx / distance;
            const uy = dy / distance;
            endX = x - ux * 5;
            endY = y - uy * 5;
        }

        const pts: Vector2[] = [new Vector2(startXOffset, startYOffset)];
        for (const cp of this.controlPoints) {
            pts.push(new Vector2(cp.x, cp.y));
        }
        pts.push(new Vector2(endX, endY));

        this.lineShape.setPoints(pts);
        this.layer.batchDraw();
    }

    public destroy(): void {
        this.layer.removeShape(this.lineShape);
        this.lineShape.destroy();
    }
}