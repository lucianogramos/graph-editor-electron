import { EdgeImpl } from "./edge-impl";
import { Edge } from "./edge.interface";
import { Graph } from "./graph.interface";
import { VertexImpl } from "./vertex-impl";
import { Vertex } from "./vertex.interface";

export class GraphImpl implements Graph {
    private _currentVertexId = 0;
    private _currentEdgeId = 0;
    private _verticesMap: Map<number, Vertex> = new Map<number, Vertex>();
    private _edgesMap: Map<number, Edge> = new Map<number, Edge>();
    private _edgesIdMap: WeakMap<Edge, number> = new WeakMap<Edge, number>();

    public createVertex(label?: string): number {
        this._verticesMap.set(this._currentVertexId, new VertexImpl(label ?? this._currentVertexId.toString()));
        return this._currentVertexId++;
    }

    public removeVertex(id: number): boolean {
        const v = this.getVertex(id);
        if (v === undefined) return false;
        const edges = v.getAdjacencyList();
        for (const e of edges)
            this.deleteEdgeOfMapsByEdge(e);
        v.removeAllEdges();
        return this._verticesMap.delete(id);
    }

    public connectVertices(uId: number, vId: number, weight: number, directed: boolean): number {
        const u = this.getVertex(uId);
        const v = this.getVertex(vId);
        if (u === undefined || v === undefined)
            return -1;
        
        const e = new EdgeImpl(u, v, weight, directed);
        this._edgesMap.set(this._currentEdgeId, e);
        this._edgesIdMap.set(e, this._currentEdgeId);
        return this._currentEdgeId++;
    }

    public disconnectVertices(id: number): boolean {
        const e = this._edgesMap.get(id);
        if (e === undefined) return false;
        e.u.removeEdge(e);
        this.deleteEdgeOfMaps(id, e);
        return true;
    }

    public getVertex(id: number): Vertex | undefined {
        return this._verticesMap.get(id);
    }

    public getVertices(): Vertex[] {
        return Array.from(this._verticesMap.values());
    }

    public hasVertex(id: number): boolean {
        return this._verticesMap.has(id);
    }

    private deleteEdgeOfMapsById(id: number) {
        const e = this._edgesMap.get(id);
        if (e === undefined) return;
        this._edgesMap.delete(id);
        this._edgesIdMap.delete(e);
    }

    private deleteEdgeOfMapsByEdge(e: Edge) {
        const id = this._edgesIdMap.get(e);
        if (id === undefined) return;
        this._edgesMap.delete(id);
        this._edgesIdMap.delete(e);
    }

    private deleteEdgeOfMaps(id: number, e: Edge) {
        this._edgesMap.delete(id);
        this._edgesIdMap.delete(e);
    }
}