import { Vertex } from './vertex';
import { Edge } from './edge';
import { VertexEventType } from './specifications';

export class GraphManager {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
    private firstSelectedVertex: Vertex | null = null;
    private isEdgeCreationActive: boolean = false;
    
    private edgeWeighted: boolean = false;
    private edgeDirected: boolean = false;
    private edgeWeightValue: number = 1; // Guarda o valor inserido no input HTML
    
    private nextVertexId: number = 1;

    constructor(private graphicsGateway: any) {}

    public addVertex(x: number, y: number): Vertex {
        const newVertex = new Vertex(x, y, this.graphicsGateway, this.nextVertexId++);
        
        newVertex.addObserver({
            processEvent: (type: VertexEventType, eventData: any) => {
                if (type === VertexEventType.CLICK) {
                    this.handleVertexClick(eventData.vertex);
                } else if (type === VertexEventType.MOVE) {
                    this.updateConnectedEdges(eventData.vertex);
                }
            }
        });

        this.vertices.push(newVertex);
        console.log(`Vertex created with ID ${newVertex.getId()} at (${x}, ${y}). Total vertices: ${this.vertices.length}`);
        return newVertex;
    }

    private handleVertexClick(vertex: Vertex): void {
        if (!this.isEdgeCreationActive) return;

        if (!this.firstSelectedVertex) {
            this.firstSelectedVertex = vertex;
            console.log('First vertex selected for edge. Select the target vertex.');
        } else {
            if (this.firstSelectedVertex !== vertex) {
                this.addEdge(this.firstSelectedVertex, vertex);
            }
            this.firstSelectedVertex = null;
        }
    }

    public addEdge(source: Vertex, target: Vertex): Edge {
        // Usa o valor guardado no input se for ponderada, senão usa 1
        const weight = this.edgeWeighted ? this.edgeWeightValue : 1; 

        const newEdge = new Edge(source, target, this.graphicsGateway, this.edgeWeighted, this.edgeDirected, weight);
        this.edges.push(newEdge);
        console.log(`Edge created successfully with weight: ${weight}. Total edges: ${this.edges.length}`);
        
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

    // Atualizado para aceitar o terceiro parâmetro com o valor do peso do painel HTML
    public enableEdgeCreation(weighted: boolean, directed: boolean, weight: number = 1): void {
        this.isEdgeCreationActive = true;
        this.edgeWeighted = weighted;
        this.edgeDirected = directed;
        this.edgeWeightValue = weight;
        this.firstSelectedVertex = null;
        console.log(`Edge mode enabled -> Weighted: ${weighted}, Directed: ${directed}, Weight: ${weight}`);
    }

    public disableEdgeCreation(): void {
        this.isEdgeCreationActive = false;
        this.firstSelectedVertex = null;
    }

    public getVertices(): Vertex[] {
        return this.vertices;
    }

    public getEdges(): Edge[] {
        return this.edges;
    }
}