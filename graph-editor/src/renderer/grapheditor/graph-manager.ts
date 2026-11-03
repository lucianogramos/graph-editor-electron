import { Vertex } from './vertex';
import { Edge } from './edge';
import { SemiEdge } from './semi-edge'; 
import { ToolManager, ToolType } from './tool-manager';
import * as Graphics from '../graphics/graphics-gateway';
import { Canvas } from '../graphics/interface/canvas.interface';
import { Layer } from '../graphics/interface/layer.interface';
import { LayerImpl } from '../graphics/implementation/layer-impl';

export class GraphManager {
    private canvas: Canvas;
    private layer: Layer;
    private containerElem: HTMLElement | null;
    
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];
    
    private firstSelectedVertex: Vertex | null = null;
    private semiEdge: SemiEdge | null = null; 
    private isEdgeCreationActive: boolean = false;
    
    private edgeWeighted: boolean = false;
    private edgeDirected: boolean = false;
    private edgeWeightValue: number = 1;
    
    private activeTool: ToolType = 'vertex'; 

    private nextVertexNumber: number = 1;

    private vertexObservers: Map<number, (type: string, eventData: { vertex: Vertex; x?: number; y?: number }) => void> = new Map();

    constructor(
        containerId: string, 
        width: number, 
        height: number, 
        private toolManager: ToolManager
    ) {
        this.containerElem = document.getElementById(containerId);
        this.canvas = Graphics.createCanvas(containerId, width, height);
        this.layer = new LayerImpl();
        this.canvas.addLayer(this.layer);
        this.layer.draw();

        this.toolManager.onToolChange((tool: ToolType) => {
            this.setTool(tool);
        });
        
        this.activeTool = this.toolManager.getActiveTool();

        this.bindEvents();
    }

    private bindEvents(): void {
        this.canvas.on('click', async (event: { domEvent?: MouseEvent; evt?: MouseEvent }) => {
            if (this.activeTool === 'vertex') {
                const domEvent = event.domEvent || event.evt;
                
                if (domEvent && domEvent.clientX !== undefined && this.containerElem) {
                    const rect = this.containerElem.getBoundingClientRect();
                    const x = domEvent.clientX - rect.left;
                    const y = domEvent.clientY - rect.top;
                    
                    await this.addVertex(x, y);
                }
            }
        });

        if (this.containerElem) {
            this.containerElem.addEventListener('mousemove', (domEvent: MouseEvent) => {
                if (this.activeTool === 'edge' && this.containerElem) {
                    const rect = this.containerElem.getBoundingClientRect();
                    const x = domEvent.clientX - rect.left;
                    const y = domEvent.clientY - rect.top;
                    
                    this.updateSemiEdgePointer(x, y);
                }
            });
        }
    }

    public getCanvas(): Canvas {
        return this.canvas;
    }

    public getLayer(): Layer {
        return this.layer;
    }

    public async addVertex(x: number, y: number): Promise<Vertex> {
        let backendId = Date.now();
        try {
            backendId = await window.api.addVertex();
        } catch (error) {
            console.error("Erro ao obter ID do vértice no backend:", error);
        }

        if (this.vertices.length === 0) {
            this.nextVertexNumber = 1;
        }

        const label = this.nextVertexNumber.toString();
        this.nextVertexNumber++;

        const newVertex = new Vertex(x, y, backendId, this.layer, label);
        
        newVertex.setDraggable(this.activeTool === 'select');
        
        const observerCallback = (type: string, eventData: { vertex: Vertex; x?: number; y?: number }) => this.processEvent(type, eventData);
        this.vertexObservers.set(newVertex.getId(), observerCallback);
        newVertex.addObserver(observerCallback);

        this.vertices.push(newVertex);
        this.layer.batchDraw();
        
        return newVertex;
    }

    public processEvent(type: string, eventData: { vertex: Vertex; x?: number; y?: number }): void {
        if (type === 'CLICK') {
            this.handleVertexClick(eventData.vertex);
        } else if (type === 'DBLCLICK') {
            if (this.activeTool === 'select') {
                eventData.vertex.openInlineEdit();
            }
        } else if (type === 'MOVE') {
            this.updateConnectedEdges(eventData.vertex);
        }
    }

    public setTool(tool: ToolType): void {
        this.activeTool = tool;
        
        const isSelectMode = (tool === 'select');
        
        for (const vertex of this.vertices) {
            vertex.setDraggable(isSelectMode);
        }
        
        if (tool !== 'edge') {
            this.disableEdgeCreation();
        }
    }

    private handleVertexClick(vertex: Vertex): void {
        if (this.activeTool === 'eraser') {
            this.removeVertex(vertex);
            return;
        }

        if (!this.isEdgeCreationActive) return;

        if (this.firstSelectedVertex === vertex) {
            this.firstSelectedVertex = null;
            this.cleanupSemiEdge();
            return;
        }

        if (!this.firstSelectedVertex) {
            this.firstSelectedVertex = vertex;
            this.cleanupSemiEdge();
            this.semiEdge = new SemiEdge(vertex.getX(), vertex.getY(), Graphics, this.edgeDirected, this.layer);
            this.layer.batchDraw();
        } else {
            const source = this.firstSelectedVertex;
            this.firstSelectedVertex = null;
            this.cleanupSemiEdge();
            this.addEdge(source, vertex);
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
        let backendEdgeId = Date.now();
        
        try {
            const res = await window.api.addEdge(source.getId(), target.getId(), weight, this.edgeDirected);
            if (res) {
                backendEdgeId = res;
            }
        } catch (error) {
            console.error("Erro ao registar aresta no backend:", error);
        }

        const minV = Math.min(source.getId(), target.getId());
        const maxV = Math.max(source.getId(), target.getId());
        const existingPairEdges = this.edges.filter(
            e => (e.getSourceId() === minV && e.getTargetId() === maxV) ||
                 (e.getSourceId() === maxV && e.getTargetId() === minV)
        );
        const initialParallelIndex = existingPairEdges.length;
        const initialForceInvert = source.getId() > target.getId();

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
            initialParallelIndex,
            initialForceInvert,
            this.layer,
            backendEdgeId
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

    public async removeEdge(edge: Edge): Promise<void> {
        const edgeId = edge.getId();
        const sourceId = edge.getSourceId();
        const targetId = edge.getTargetId();

        try {
            await window.api.removeEdge(edgeId);
        } catch (error) {
            console.error("Erro ao remover aresta no backend:", error);
        }

        edge.destroy();
        this.edges = this.edges.filter(e => e !== edge);

        this.reindexParallelEdges(sourceId, targetId);
        this.layer.batchDraw();
    }

    public async removeVertex(vertex: Vertex): Promise<void> {
        const vertexId = vertex.getId();

        try {
            await window.api.removeVertex(vertexId);
        } catch (error) {
            console.error("Erro ao remover vértice no backend:", error);
        }

        const callback = this.vertexObservers.get(vertexId);
        if (callback) {
            vertex.removeObserver(callback);
            this.vertexObservers.delete(vertexId);
        }

        const connectedEdges = this.edges.filter(edge => edge.isConnectedTo(vertexId));
        
        const affectedPairs = new Set<string>();
        for (const edge of connectedEdges) {
            affectedPairs.add(`${Math.min(edge.getSourceId(), edge.getTargetId())}-${Math.max(edge.getSourceId(), edge.getTargetId())}`);
            await this.removeEdge(edge);
        }

        affectedPairs.forEach(pairKey => {
            const [v1, v2] = pairKey.split('-').map(Number);
            this.reindexParallelEdges(v1, v2);
        });

        vertex.destroy();

        this.vertices = this.vertices.filter(v => v !== vertex);
        this.layer.batchDraw();
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
        const vertexId = vertex.getId();
        
        for (const edge of this.edges) {
            if (edge.isConnectedTo(vertexId)) {
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