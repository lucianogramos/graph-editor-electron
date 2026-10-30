import { EdgeImpl } from "./edge-impl";
import { Edge } from "./edge.interface";
import { Graph } from "./graph.interface";
import { VertexImpl } from "./vertex-impl";
import { Vertex } from "./vertex.interface";

export class GraphImpl implements Graph {
    private _currentVertexId = 0;
    private _verticesMap: Map<number, Vertex> = new Map<number, Vertex>();

    public createVertex(label?: string): number {
        this._verticesMap.set(this._currentVertexId, new VertexImpl(label ?? this._currentVertexId.toString()));
        return this._currentVertexId++;
    }

    public removeVertex(id: number): boolean {
        return this._verticesMap.delete(id);
    }

    public connectVertices(uId: number, vId: number, weight: number, directed: boolean): Edge | null {
        const u = this.getVertex(uId);
        const v = this.getVertex(vId);
        if (u === undefined || v === undefined)
            return null;

        return new EdgeImpl(u, v, weight, directed);
    }

    public getVertex(id: number): Vertex | undefined {
        return this._verticesMap.get(id);
    }

    public getVertices(): Vertex[] {
        return Array.from(this._verticesMap.values());
    }
}