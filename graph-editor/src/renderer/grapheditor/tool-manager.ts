export type ToolType = 'select' | 'vertex' | 'edge' | 'eraser';

export class ToolManager {
    private activeTool: ToolType = 'vertex';
    private toolChangeCallbacks: Array<(tool: ToolType) => void> = [];

    private toolButtons: Map<ToolType, HTMLButtonElement | null> = new Map();
    private currentToolButton: HTMLButtonElement | null = null;

    constructor() {}

    public init(): void {
        this.toolButtons.set('select', document.getElementById('btn-select-tool') as HTMLButtonElement);
        this.toolButtons.set('vertex', document.getElementById('btn-vertex-tool') as HTMLButtonElement);
        this.toolButtons.set('edge', document.getElementById('btn-edge-tool') as HTMLButtonElement);
        this.toolButtons.set('eraser', document.getElementById('btn-erase-tool') as HTMLButtonElement);

        this.bindEvents();
    }

    private bindEvents(): void {
        this.toolButtons.forEach((btn, tool) => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (tool === 'edge' && this.activeTool === 'edge') {
                        this.setTool('select');
                    } else {
                        this.setTool(tool);
                    }
                });
            }
        });

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            const activeElem = document.activeElement as HTMLElement;
            if (activeElem && ['INPUT', 'TEXTAREA'].includes(activeElem.tagName)) return;

            const key = e.key.toLowerCase();
            if (key === 's') this.setTool('select');
            else if (key === 'v') this.setTool('vertex');
            else if (key === 'e') this.setTool('edge');
            else if (key === 'r') this.setTool('eraser');
        });
    }

    public getActiveTool(): ToolType {
        return this.activeTool;
    }

    public setTool(tool: ToolType): void {
        this.activeTool = tool;
        
        const targetBtn = this.toolButtons.get(tool) || null;
        this.setActiveToolButton(targetBtn);

        this.notifyToolChange();
    }

    private setActiveToolButton(btn: HTMLButtonElement | null): void {
        if (!btn) return;
        
        if (this.currentToolButton) {
            this.currentToolButton.setAttribute('data-selected', 'false');
        }
        
        btn.setAttribute('data-selected', 'true');
        this.currentToolButton = btn;
    }

    public onToolChange(callback: (tool: ToolType) => void): void {
        this.toolChangeCallbacks.push(callback);
    }

    private notifyToolChange(): void {
        for (const callback of this.toolChangeCallbacks) {
            callback(this.activeTool);
        }
    }
}