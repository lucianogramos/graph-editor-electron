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

    public init(): void {
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
            const activeElem = document.activeElement as HTMLElement;
            if (activeElem && ['INPUT', 'TEXTAREA'].includes(activeElem.tagName)) {
                return;
            }

            const key = e.key.toLowerCase();
            switch (key) {
                case 's': 
                    this.setTool('select'); 
                    console.log('Atalho [S]: select');
                    break;
                case 'v': 
                    this.setTool('vertex'); 
                    console.log('Atalho [V]: vertex');
                    break;
                case 'e': 
                    this.setTool('edge'); 
                    console.log('Atalho [E]: edge');
                    break;
                case 'r': 
                    this.setTool('eraser'); 
                    console.log('Atalho [R]: eraser');
                    break;
            }
        });
    }
}