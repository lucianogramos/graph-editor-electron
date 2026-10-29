import { Vertex } from './vertex';
import { Edge } from './edge';
import { SemiEdge } from './semiEdge'; 
import { VertexEventType, VertexEventData, Observer } from './specifications';

export class GraphManager {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
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
        const newVertex = new Vertex(x, y, this.graphicsGateway, this.nextVertexId++);
        
        if (this.activeTool === 'select' && typeof newVertex.setDraggable === 'function') {
            newVertex.setDraggable(true);
        }

        newVertex.addObserver({
            processEvent: (type: VertexEventType, eventData: VertexEventData) => {
                if (type === VertexEventType.CLICK) {
                    this.handleVertexClick(eventData.vertex);
                } else if (type === VertexEventType.MOVE) {
                    this.updateConnectedEdges(eventData.vertex);
                }
            }
        } as Observer<VertexEventType, VertexEventData>);

        this.vertices.push(newVertex);
        console.log(`Vertex created with ID ${newVertex.getId()} at (${x}, ${y}). Total vertices: ${this.vertices.length}`);
        return newVertex;
    }

    public setTool(tool: string): void {
        this.activeTool = tool;
        const isSelectMode = (tool === 'select');
        
        for (const vertex of this.vertices) {
            if (typeof vertex.setDraggable === 'function') {
                vertex.setDraggable(isSelectMode);
            }
        }
        
        if (tool !== 'edge') {
            this.disableEdgeCreation();
        }
        
        console.log(`GraphManager: Modo de seleção (arrastar vértices) ativado? ${isSelectMode}`);
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
            
            if (this.semiEdge) {
                this.semiEdge.destroy();
                this.semiEdge = null;
            }
            
            this.semiEdge = new SemiEdge(vertex, this.graphicsGateway, this.edgeDirected);
            console.log(`First vertex selected (ID: ${vertex.getId()}). Move mouse to select target vertex.`);
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

        const newEdge = new Edge(source, target, this.graphicsGateway, this.edgeWeighted, this.edgeDirected, weight);
        this.edges.push(newEdge);
        console.log(`Edge created successfully between ${source.getId()} and ${target.getId()} with weight: ${weight}. Total edges: ${this.edges.length}`);
        
        const konvaLayer = typeof this.graphicsGateway.getKonvaLayer === 'function' 
            ? this.graphicsGateway.getKonvaLayer() 
            : (this.graphicsGateway as any).layer;
            
        if (konvaLayer) konvaLayer.batchDraw();

        return newEdge;
    }

    private updateConnectedEdges(vertex: Vertex): void {
        for (const edge of this.edges) {
            if (edge.isConnectedTo(vertex)) {
                edge.updatePosition();
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
        console.log(`Edge mode enabled -> Weighted: ${weighted}, Directed: ${directed}, Weight: ${weight}`);
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