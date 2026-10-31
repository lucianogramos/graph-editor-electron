import { Vector2 } from '../graphics/vector2';
import { Layer } from '../graphics/interface/layer.interface';

export class SemiEdge {
    private controlPoints: Vector2[] = [];
    private currentEndPoint: { x: number; y: number } = { x: 0, y: 0 };
    private lineShape: any;

    constructor(
        private startX: number,
        private startY: number,
        private graphicsGateway: any,
        private directed: boolean = false,
        private layer: Layer
    ) {
        const initialPoints = [
            new Vector2(this.startX, this.startY),
            new Vector2(this.startX, this.startY)
        ];

        this.lineShape = this.graphicsGateway.createLine(initialPoints);

        if (typeof this.lineShape.setTension === 'function') {
            this.lineShape.setTension(0.3);
        }

        if (typeof this.lineShape.getKonvaShape === 'function') {
            const konvaLine = this.lineShape.getKonvaShape();
            if (konvaLine) {
                if (typeof konvaLine.dash === 'function') {
                    konvaLine.dash([6, 6]);
                }
                if (typeof konvaLine.listening === 'function') {
                    konvaLine.listening(false);
                }
            }
        }

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

        const pts: Vector2[] = [new Vector2(startXOffset, startYOffset)];
        for (const cp of this.controlPoints) {
            pts.push(new Vector2(cp.x, cp.y));
        }
        pts.push(new Vector2(x, y));

        if (typeof this.lineShape.setPoints === 'function') {
            this.lineShape.setPoints(pts);
            this.layer.batchDraw();
        }
    }

    public destroy(): void {
        this.layer.removeShape(this.lineShape);
        if (typeof this.lineShape.destroy === 'function') {
            this.lineShape.destroy();
        } else if (typeof this.graphicsGateway.removeLine === 'function') {
            this.graphicsGateway.removeLine(this.lineShape);
        }
    }
}