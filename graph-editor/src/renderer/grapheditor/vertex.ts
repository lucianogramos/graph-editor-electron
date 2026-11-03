import * as Graphics from '../graphics/graphics-gateway';
import { CircleShape } from '../graphics/interface/circle-shape.interface';
import { Text } from '../graphics/interface/text.interface';
import { Layer } from '../graphics/interface/layer.interface';
import * as Theme from '../theme';
import { ThemeColors } from '../../types/ipc';

export class Vertex {
    private observers: Array<(type: string, eventData: any) => void> = [];
    private label: string;
    private isDraggable: boolean = false;
    
    private circleShape: CircleShape;
    private textShape: Text;

    private onChangeThemeId: number = -1;
    private activeInput: HTMLInputElement | null = null;

    constructor(
        private x: number,
        private y: number,
        private id: number,
        private layer: Layer,
        customLabel?: string
    ) {
        this.label = customLabel !== undefined ? customLabel : id.toString();

        this.circleShape = Graphics.createCircle(x, y, 25);
        this.textShape = Graphics.createText(x - 15, y - 7, this.label, 14);

        this.textShape.setListening(false);

        this.configureStyle(Theme.getCurrentThemeColors());

        this.layer.addShape(this.circleShape);
        this.layer.addShape(this.textShape);

        let lastClickTime = 0;
        const handleCircleClick = () => {
            const now = Date.now();
            if (now - lastClickTime < 150) return;
            lastClickTime = now;
            this.dispatchEvent('CLICK', { vertex: this });
        };

        this.circleShape.on('click', handleCircleClick);
        this.circleShape.on('dblclick', () => {
            this.dispatchEvent('DBLCLICK', { vertex: this });
        });

        this.textShape.on('click', handleCircleClick);
        this.textShape.on('dblclick', () => {
            this.dispatchEvent('DBLCLICK', { vertex: this });
        });

        this.circleShape.on('dragmove', () => {
            const pos = this.circleShape.position;
            if (pos) {
                this.x = pos.x;
                this.y = pos.y;
                this.textShape.setPosition({ x: this.x - 15, y: this.y - 7 });
                
                if (this.activeInput) {
                    this.updateInputPosition(this.activeInput);
                }

                this.dispatchEvent('MOVE', { vertex: this, x: this.x, y: this.y });
            }
        });
    }

    public getId(): number { 
        return this.id; 
    }

    public getX(): number { 
        return this.x; 
    }

    public getY(): number { 
        return this.y; 
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        
        this.circleShape.setPosition({ x, y });
        this.textShape.setPosition({ x: x - 15, y: y - 7 });

        if (this.activeInput) {
            this.updateInputPosition(this.activeInput);
        }

        this.dispatchEvent('MOVE', { vertex: this, x: this.x, y: this.y });
    }

    public getLabel(): string {
        return this.label;
    }

    public setLabel(label: string): void {
        this.label = label;
        this.textShape.setText(label);
        this.layer.batchDraw();
    }

    public setDraggable(draggable: boolean): void {
        this.isDraggable = draggable;
        this.circleShape.setDraggable(draggable);
    }

    public getDraggable(): boolean {
        return this.isDraggable;
    }

    public openInlineEdit(): void {
        if (this.activeInput) return;

        const container = document.getElementById('editor') || document.body;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.label;
        
        input.style.position = 'absolute';
        input.style.zIndex = '1000';
        input.style.width = '50px';
        input.style.height = '24px';
        input.style.textAlign = 'center';
        input.style.fontSize = '14px';
        input.style.fontWeight = 'bold';
        input.style.borderRadius = '4px';
        input.style.border = '2px solid #3b82f6';
        input.style.outline = 'none';
        input.style.backgroundColor = '#ffffff';
        input.style.color = '#000000';

        this.activeInput = input;
        this.updateInputPosition(input);

        container.appendChild(input);
        input.focus();
        input.select();

        const closeInput = (save: boolean) => {
            if (save && input.value.trim() !== '') {
                this.setLabel(input.value.trim());
            }
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
            this.activeInput = null;
        };

        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                closeInput(true);
            } else if (e.key === 'Escape') {
                closeInput(false);
            }
        });

        input.addEventListener('blur', () => {
            closeInput(true);
        });
    }

    private updateInputPosition(input: HTMLInputElement): void {
        input.style.left = `${this.x - 25}px`;
        input.style.top = `${this.y - 12}px`;
    }

    public addObserver(callback: (type: string, eventData: any) => void): void {
        this.observers.push(callback);
    }

    public removeObserver(callback: (type: string, eventData: any) => void): void {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    public dispatchEvent(type: string, eventData: any): void {
        for (const callback of this.observers) {
            callback(type, eventData);
        }
    }

    public destroy(): void {
        if (this.activeInput && this.activeInput.parentNode) {
            this.activeInput.parentNode.removeChild(this.activeInput);
            this.activeInput = null;
        }

        this.layer.removeShape(this.circleShape);
        this.circleShape.destroy();
        
        this.layer.removeShape(this.textShape);
        this.textShape.destroy();

        Theme.removeCallback(this.onChangeThemeId);
    }

    private configureStyle(colors: ThemeColors): void {
        this.circleShape.fill(colors.vertexColor);
        this.circleShape.border(1, colors.vertexBorderColor);
        this.textShape.fill(colors.vertexLabelColor);
        this.textShape.setFontStyle('bold');
        this.textShape.setTextAlign('center');
        this.textShape.setWidth(30);

        this.onChangeThemeId = Theme.onChangeTheme((theme) => {
            const colors = theme.colors;
            this.circleShape.fill(colors.vertexColor);
            this.circleShape.border(1, colors.vertexBorderColor);
            this.textShape.fill(colors.vertexLabelColor);
        });
    }
}