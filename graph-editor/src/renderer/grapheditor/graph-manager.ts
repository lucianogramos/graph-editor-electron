import { Vertex } from './vertex';
import { Edge } from './edge';
import { SemiEdge } from './semiEdge'; 
import Konva from "konva";
import { CircleShapeImpl } from '../graphics/CircleShapeImpl';
import { TextImpl } from '../graphics/TextImpl';
import { Vector2 } from '../graphics/Vector2';

export class GraphManager {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
    private vertexShapes: Map<Vertex, { circle: CircleShapeImpl, text: TextImpl }> = new Map();
    
    private firstSelectedVertex: Vertex | null = null;
    private semiEdge: SemiEdge | null = null; 
    private isEdgeCreationActive: boolean = false;
    
    private edgeWeighted: boolean = false;
    private edgeDirected: boolean = false;
    private edgeWeightValue: number = 1;
    
    private nextVertexId: number = 1;
    private activeTool: string = 'vertex'; 

    constructor(private graphicsGateway: any) {}

    public addVertex(x: number, y: number): Vertex {
        const newVertex = new Vertex(x, y, this.nextVertexId++);
        const initialLabel = newVertex.getId().toString();
        newVertex.setLabel(initialLabel);
        
        const circleShape = new CircleShapeImpl(x, y, 25);
        this.graphicsGateway.addShape(circleShape);

        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;

        const textShape = new TextImpl(x - 15, y - 7, initialLabel, 14);
        textShape.fill('#ffffff');
        textShape.setFontStyle('bold');
        textShape.setTextAlign('center');
        textShape.setWidth(30);

        (textShape.getKonvaShape() as any).listening(false);

        if (konvaLayer) {
            konvaLayer.add(textShape.getKonvaShape());
        }

        this.vertexShapes.set(newVertex, { circle: circleShape, text: textShape });

        const konvaNode = circleShape.getKonvaShape() as any;
        konvaNode.draggable(this.activeTool === 'select');

        let hasMoved = false;

        konvaNode.on('dragstart', (e: any) => {
            if (!newVertex.getDraggable()) {
                e.target.stopDrag();
                return;
            }
            e.cancelBubble = true;
            hasMoved = false;
        });

        konvaNode.on('dragmove', (e: any) => {
            if (!newVertex.getDraggable()) return;
            hasMoved = true;

            const pos = konvaNode.position();
            newVertex.setPosition(pos.x, pos.y);

            textShape.setPosition(new Vector2(pos.x - 15, pos.y - 7));

            if (konvaLayer) konvaLayer.batchDraw();
        });

        konvaNode.on('click', () => {
            if (hasMoved) {
                hasMoved = false;
                return;
            }
            this.handleVertexClick(newVertex);
        });

        konvaNode.on('dblclick dbltap', (e: any) => {
            if (!newVertex.getDraggable()) return;
            e.cancelBubble = true;

            const existingInput = document.getElementById('vertex-rename-input');
            if (existingInput) existingInput.remove();

            const stage = konvaNode.getStage();
            const stageBox = stage.container().getBoundingClientRect();
            const absPosition = konvaNode.getAbsolutePosition();

            const screenX = stageBox.left + absPosition.x * stage.scaleX();
            const screenY = stageBox.top + absPosition.y * stage.scaleY();

            const input = document.createElement('input');
            input.id = 'vertex-rename-input';
            input.type = 'text';
            input.value = textShape.text;
            
            input.style.position = 'absolute';
            input.style.left = `${screenX - 30}px`;
            input.style.top = `${screenY - 15}px`;
            input.style.width = '60px';
            input.style.zIndex = '1000';
            input.style.textAlign = 'center';
            input.style.fontSize = '12px';
            input.style.fontWeight = 'bold';
            input.style.borderRadius = '4px';
            input.style.border = '1px solid #666';
            input.style.backgroundColor = '#222';
            input.style.color = '#fff';
            input.style.padding = '2px';

            document.body.appendChild(input);
            input.focus();
            input.select();

            textShape.setText("");
            if (konvaLayer) konvaLayer.batchDraw();

            let isFinished = false;

            const finishEditing = () => {
                if (isFinished) return;
                isFinished = true;

                const newName = input.value.trim();
                if (newName !== "") {
                    newVertex.setLabel(newName);
                    textShape.setText(newName);
                } else {
                    textShape.setText(initialLabel);
                }
                input.remove();
                if (konvaLayer) konvaLayer.batchDraw();
            };

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    finishEditing();
                } else if (event.key === 'Escape') {
                    input.value = textShape.text;
                    finishEditing();
                }
            });

            input.addEventListener('blur', () => {
                finishEditing();
            });
        });

        newVertex.addObserver((type, eventData) => this.processEvent(type, eventData));

        this.vertices.push(newVertex);
        console.log(`Vertex created with ID ${newVertex.getId()} at (${x}, ${y}). Total vertices: ${this.vertices.length}`);
        
        if (konvaLayer) konvaLayer.batchDraw();
        return newVertex;
    }

    public processEvent(type: string, eventData: any): void {
        if (type === 'CLICK') {
            this.handleVertexClick(eventData.vertex);
        } else if (type === 'MOVE') {
            this.updateConnectedEdges(eventData.vertex);
        }
    }

    public setTool(tool: string): void {
        this.activeTool = tool;
        const isSelectMode = (tool === 'select');
        
        for (const vertex of this.vertices) {
            vertex.setDraggable(isSelectMode);
            const shape = this.vertexShapes.get(vertex);
            if (shape) {
                const konvaNode = shape.circle.getKonvaShape() as any;
                if (konvaNode) {
                    konvaNode.draggable(isSelectMode);
                }
            }
        }
        
        if (tool !== 'edge') {
            this.disableEdgeCreation();
        }
        
        console.log(`GraphManager: Modo de seleção ativado? ${isSelectMode}`);
    }

    private handleVertexClick(vertex: Vertex): void {
        if (!this.isEdgeCreationActive) return;

        if (this.firstSelectedVertex === vertex) {
            console.log('Cancelled edge creation: clicked on the same vertex.');
            this.firstSelectedVertex = null;
            this.cleanupSemiEdge();
            return;
        }

        if (!this.firstSelectedVertex) {
            this.firstSelectedVertex = vertex;
            this.cleanupSemiEdge();
            this.semiEdge = new SemiEdge(vertex.getX(), vertex.getY(), this.graphicsGateway, this.edgeDirected);
            console.log(`First vertex selected (ID: ${vertex.getId()}).`);
        } else {
            console.log(`Second vertex selected (ID: ${vertex.getId()}). Creating edge...`);
            this.addEdge(this.firstSelectedVertex, vertex);
            this.cleanupSemiEdge();
            this.firstSelectedVertex = null;
        }
    }

    public updateSemiEdgePointer(x: number, y: number): void {
        if (this.semiEdge) {
            this.semiEdge.updateEndPoint(x, y);
        }
    }

    private cleanupSemiEdge(): void {
        if (this.semiEdge) {
            this.semiEdge.destroy();
            this.semiEdge = null;
        }
    }

    public addEdge(source: Vertex, target: Vertex): Edge {
        const weight = this.edgeWeighted ? this.edgeWeightValue : 1; 
        
        const newEdge = new Edge(
            source.getId(),
            target.getId(),
            source.getX(),
            source.getY(),
            target.getX(),
            target.getY(),
            this.graphicsGateway,
            this.edgeWeighted,
            this.edgeDirected,
            weight,
            0,
            false
        );

        this.edges.push(newEdge);
        
        this.reindexParallelEdges(source.getId(), target.getId());

        return newEdge;
    }

    public reindexParallelEdges(v1Id: number, v2Id: number): void {
        const minV = Math.min(v1Id, v2Id);
        const maxV = Math.max(v1Id, v2Id);

        const allPairEdges = this.edges.filter(
            e => (e.getSourceId() === minV && e.getTargetId() === maxV) ||
                 (e.getSourceId() === maxV && e.getTargetId() === minV)
        );

        allPairEdges.forEach((edge, idx) => {
            const forceInvert = edge.getSourceId() > edge.getTargetId();
            edge.setParallelIndex(idx, forceInvert);

            const s = this.vertices.find(v => v.getId() === edge.getSourceId());
            const t = this.vertices.find(v => v.getId() === edge.getTargetId());
            if (s && t) {
                edge.updatePosition(s.getX(), s.getY(), t.getX(), t.getY());
            }
        });

        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;
            
        if (konvaLayer) konvaLayer.batchDraw();
    }

    private updateConnectedEdges(vertex: Vertex): void {
        for (const edge of this.edges) {
            if (edge.isConnectedTo(vertex.getId())) {
                const source = this.vertices.find(v => v.getId() === edge.getSourceId());
                const target = this.vertices.find(v => v.getId() === edge.getTargetId());

                if (source && target) {
                    edge.updatePosition(source.getX(), source.getY(), target.getX(), target.getY());
                }
            }
        }
        
        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;
            
        if (konvaLayer) konvaLayer.batchDraw();
    }

    public enableEdgeCreation(weighted: boolean, directed: boolean, weight: number = 1): void {
        this.isEdgeCreationActive = true;
        this.edgeWeighted = weighted;
        this.edgeDirected = directed;
        this.edgeWeightValue = weight;
        this.firstSelectedVertex = null;
        this.cleanupSemiEdge();
    }

    public disableEdgeCreation(): void {
        this.isEdgeCreationActive = false;
        this.firstSelectedVertex = null;
        this.cleanupSemiEdge();
    }

    public getVertices(): Vertex[] {
        return this.vertices;
    }

    public getEdges(): Edge[] {
        return this.edges;
    }
}