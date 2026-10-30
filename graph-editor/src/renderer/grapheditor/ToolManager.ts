import { Canvas } from '../graphics/canvas.interface';
import { GraphManager } from './graph-manager';

export type ToolType = 'select' | 'vertex' | 'edge' | 'eraser';

export class ToolManager {
    private activeTool: ToolType = 'vertex';
    private listeners: ((tool: ToolType) => void)[] = [];

    constructor() {}

    public setTool(tool: ToolType): void {
        if (this.activeTool === tool) return;
        this.activeTool = tool;
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

    public init(canvas?: Canvas, graphManager?: GraphManager): void {
        const toolButtons: { ids: string[]; tool: ToolType }[] = [
            { ids: ['btn-select', 'btn-select-tool'], tool: 'select' },
            { ids: ['btn-vertex', 'btn-vertex-tool'], tool: 'vertex' },
            { ids: ['btn-edge', 'btn-edge-tool'], tool: 'edge' },
            { ids: ['btn-eraser', 'btn-erase-tool'], tool: 'eraser' }
        ];

        toolButtons.forEach(({ ids, tool }) => {
            ids.forEach(id => {
                const buttonElement = document.getElementById(id);
                if (buttonElement) {
                    buttonElement.addEventListener('click', () => {
                        this.setTool(tool);
                        console.log(`Ferramenta ativada via clique: ${tool}`);
                    });
                }
            });
        });

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
                return;
            }

            const key = e.key.toLowerCase();
            switch (key) {
                case 's': this.setTool('select'); break;
                case 'v': this.setTool('vertex'); break;
                case 'e': this.setTool('edge'); break;
                case 'r': this.setTool('eraser'); break;
            }
        });

        if (canvas && graphManager) {
            canvas.on('click', (event: any) => {
                if (this.getActiveTool() === 'vertex') {
                    const editorElem = document.getElementById("editor") as HTMLDivElement;
                    if (!editorElem) return;

                    let x = 0;
                    let y = 0;

                    const domEvent = event.domEvent || event.evt || event;
                    if (domEvent && domEvent.clientX !== undefined) {
                        const rect = editorElem.getBoundingClientRect();
                        x = domEvent.clientX - rect.left;
                        y = domEvent.clientY - rect.top;
                    } else if (event.x !== undefined && event.y !== undefined) {
                        x = event.x;
                        y = event.y;
                    }

                    if (x !== 0 || y !== 0) {
                        graphManager.addVertex(x, y);
                        console.log(`ToolManager: Vértice criado em (${x}, ${y})`);
                    }
                }
            });
        }
    }
}