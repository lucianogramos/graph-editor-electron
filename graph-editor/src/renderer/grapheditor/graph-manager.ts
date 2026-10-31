import { Vertex } from './vertex';
import { Edge } from './edge';
import { SemiEdge } from './semi-edge'; 
import { ToolManager } from './tool-manager';
import * as Graphics from '../graphics/graphics-gateway';
import { Layer } from '../graphics/interface/layer.interface';

export class GraphManager {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
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

    public async addVertex(x: number, y: number): Promise<Vertex> {
        let backendId = Date.now();
        if ((window as any).api?.addVertex) {
            try {
                backendId = await (window as any).api.addVertex();
            } catch (error) {
                console.error("Erro ao obter ID do vértice no backend:", error);
            }
        }

        const newVertex = new Vertex(x, y, backendId, this.layer);
        
        newVertex.setDraggable(this.activeTool === 'select');
        newVertex.addObserver((type, eventData) => this.processEvent(type, eventData));

        this.vertices.push(newVertex);
        this.layer.batchDraw();
        
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
            this.semiEdge = new SemiEdge(vertex.getX(), vertex.getY(), Graphics, this.edgeDirected, this.layer);
            this.layer.batchDraw();
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
            this.layer.batchDraw();
        }
    }

    private cleanupSemiEdge(): void {
        if (this.semiEdge) {
            this.semiEdge.destroy();
            this.semiEdge = null;
            this.layer.batchDraw();
        }
    }

    public async addEdge(source: Vertex, target: Vertex): Promise<Edge | null> {
        const weight = this.edgeWeighted ? this.edgeWeightValue : 1; 
        
        if ((window as any).api?.addEdge) {
            try {
                await (window as any).api.addEdge();
            } catch (error) {
                console.error("Erro ao registar aresta no backend:", error);
            }
        }

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
            false,
            this.layer
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

    public async removeVertex(vertex: Vertex): Promise<void> {
        const vertexId = vertex.getId();

        if ((window as any).api?.removeVertex) {
            try {
                await (window as any).api.removeVertex();
            } catch (error) {
                console.error("Erro ao remover vértice no backend:", error);
            }
        }

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

        vertex.destroy();

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