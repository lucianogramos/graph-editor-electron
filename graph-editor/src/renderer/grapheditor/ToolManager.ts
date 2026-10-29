export type ToolType = 'select' | 'vertex' | 'edge' | 'eraser';

export class ToolManager {
    private activeTool: ToolType = 'vertex';
    private listeners: ((tool: ToolType) => void)[] = [];

    public setTool(tool: ToolType): void {

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
}