import { Vertex } from './vertex';
import { Edge } from './edge';
import { SemiEdge } from './semiEdge'; 
import { ToolManager } from './ToolManager';
import * as Graphics from '../graphics/graphics-gateway';
import { CircleShape } from '../graphics/circle-shape.interface';
import { Text } from '../graphics/text.interface';
import { Layer } from '../graphics/layer.interface';

export class GraphManager {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
    private vertexShapes: Map<Vertex, { circle: CircleShape, text: Text }> = new Map();
    
    private firstSelectedVertex: Vertex | null = null;
    private semiEdge: SemiEdge | null = null; 
    private isEdgeCreationActive: boolean = false;
    
    private edgeWeighted: boolean = false;
    private edgeDirected: boolean = false;
    private edgeWeightValue: number = 1;
    
    private activeTool: string = 'vertex'; 

    constructor(private toolManager: ToolManager, private layer: Layer) {
        this.toolManager.onToolChange((tool) => {
            this.setTool(tool);
        });
        
        this.activeTool = this.toolManager.getActiveTool();
    }

    public addVertex(x: number, y: number): Vertex {
        let nextId = 1;
        if (this.vertices.length > 0) {
            const existingIds = this.vertices.map(v => v.getId()).sort((a, b) => a - b);
            nextId = existingIds.length + 1;
            for (let i = 0; i < existingIds.length; i++) {
                if (existingIds[i] !== i + 1) {
                    nextId = i + 1;
                    break;
                }
            }
        }

        const newVertex = new Vertex(x, y, nextId);
        const initialLabel = newVertex.getId().toString();
        newVertex.setLabel(initialLabel);
        
        const circleShape = Graphics.createCircle(x, y, 25);
        const textShape = Graphics.createText(x - 15, y - 7, initialLabel, 14);
        
        textShape.fill('#ffffff');
        textShape.setFontStyle('bold');
        textShape.setTextAlign('center');
        textShape.setWidth(30);

        this.layer.addShape(circleShape);
        this.layer.addShape(textShape);
        this.layer.batchDraw();

        this.vertexShapes.set(newVertex, { circle: circleShape, text: textShape });

        circleShape.setDraggable(this.activeTool === 'select');

        circleShape.on('click', () => {
            this.handleVertexClick(newVertex);
        });

        newVertex.addObserver((type, eventData) => this.processEvent(type, eventData));

        this.vertices.push(newVertex);
        console.log(`Vertex created with ID ${newVertex.getId()} at (${x}, ${y}). Total vertices: ${this.vertices.length}`);
        
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
            const shapes = this.vertexShapes.get(vertex);
            if (shapes && shapes.circle) {
                shapes.circle.setDraggable(isSelectMode);
            }
        }
        
        if (tool !== 'edge') {
            this.disableEdgeCreation();
        }
        
        console.log(`GraphManager: Ferramenta ativa sincronizada via ToolManager -> ${tool}`);
    }

    private handleVertexClick(vertex: Vertex): void {
        if (this.activeTool === 'eraser') {
            this.removeVertex(vertex);
            return;
        }

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
            this.semiEdge = new SemiEdge(vertex.getX(), vertex.getY(), Graphics, this.edgeDirected);
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
            this.edgeWeighted,
            this.edgeDirected,
            weight,
            0,
            false
        );

        newEdge.onClick(() => {
            if (this.activeTool === 'eraser') {
                this.removeEdge(newEdge);
            }
        });

        this.edges.push(newEdge);
        this.reindexParallelEdges(source.getId(), target.getId());
        this.layer.batchDraw();

        return newEdge;
    }

    public removeEdge(edge: Edge): void {
        const sourceId = edge.getSourceId();
        const targetId = edge.getTargetId();

        edge.destroy();
        this.edges = this.edges.filter(e => e !== edge);

        this.reindexParallelEdges(sourceId, targetId);
        this.layer.batchDraw();
        console.log(`Edge between ${sourceId} and ${targetId} deleted.`);
    }

    public removeVertex(vertex: Vertex): void {
        const vertexId = vertex.getId();

        const connectedEdges = this.edges.filter(edge => edge.isConnectedTo(vertexId));
        
        const affectedPairs = new Set<string>();
        connectedEdges.forEach(edge => {
            affectedPairs.add(`${Math.min(edge.getSourceId(), edge.getTargetId())}-${Math.max(edge.getSourceId(), edge.getTargetId())}`);
            edge.destroy();
        });

        this.edges = this.edges.filter(edge => !edge.isConnectedTo(vertexId));

        affectedPairs.forEach(pairKey => {
            const [v1, v2] = pairKey.split('-').map(Number);
            this.reindexParallelEdges(v1, v2);
        });

        const shapes = this.vertexShapes.get(vertex);
        if (shapes) {
            this.layer.removeShape(shapes.circle);
            this.layer.removeShape(shapes.text);
            shapes.circle.destroy();
            shapes.text.destroy();
            this.vertexShapes.delete(vertex);
        }

        this.vertices = this.vertices.filter(v => v !== vertex);
        this.layer.batchDraw();
        console.log(`Vertex (ID: ${vertexId}) and its connected edges were deleted.`);
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
        this.layer.batchDraw();
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