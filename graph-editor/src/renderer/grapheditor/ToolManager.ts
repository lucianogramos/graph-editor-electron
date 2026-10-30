import { GraphManager } from './graph-manager';

export type ToolType = 'select' | 'vertex' | 'edge' | 'eraser';

export class ToolManager {
    private activeTool: ToolType = 'vertex';
    private listeners: ((tool: ToolType) => void)[] = [];

    constructor(private graphManager: GraphManager) {}

    public setTool(tool: ToolType): void {
        this.activeTool = tool;
        this.graphManager.setTool(tool);
        this.notifyListeners();
    }

    public getActiveTool(): ToolType {
        return this.activeTool;
    }

    public onToolChange(callback: (tool: ToolType) => void): void {
        this.listeners.push(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(callback => callback(this.activeTool));
    }

    public init(stage: any, graphicsLayer: any): void {
        stage.on('click', (e: any) => {
            if (e.target !== stage) {
                return; 
            }

            if (this.activeTool === 'vertex') {
                const pointerPos = stage.getRelativePointerPosition();
                if (pointerPos) {
                    this.graphManager.addVertex(pointerPos.x, pointerPos.y);
                    
                    const konvaLayer = typeof graphicsLayer.getKonvaLayer === 'function' 
                        ? graphicsLayer.getKonvaLayer() 
                        : graphicsLayer;
                        
                    if (konvaLayer && typeof konvaLayer.batchDraw === 'function') {
                        konvaLayer.batchDraw();
                    }
                    console.log(`Vértice criado pelo ToolManager em: x=${pointerPos.x}, y=${pointerPos.y}`);
                }
            }
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.activeTool !== 'edge') return;

            if (stage && typeof stage.setPointersPositions === 'function') {
                stage.setPointersPositions(e);
            }

            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const pos = stage.getPointerPosition();
            
            if (pos) {
                const stagePos = transform.point(pos);
                this.graphManager.updateSemiEdgePointer(stagePos.x, stagePos.y);
            }
        });
    }
}