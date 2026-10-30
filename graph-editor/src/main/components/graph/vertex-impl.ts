import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export class VertexImpl implements Vertex {
    private _label: string;
    public get label(): string {
        return this._label;
    }

    private _adj: [Vertex, Edge][] = [];

    public constructor(label: string = "") {
        this._label = label;
    }

    public addEdge(e: Edge): void {
        this._adj.push([e.u === this ? e.v : e.u, e]);
    }

    public removeEdge(e: Edge): void {
        for (let i = 0; i < this._adj.length; i++) {
            const [v, a] = this._adj[i];
            if (a === e) {
                v.removeEdgeUnidirectionally(e);
                this._adj.splice(i, 1);
                return;
            }
        }
    }

    public removeEdgeUnidirectionally(e: Edge): void {
        for (let i = 0; i < this._adj.length; i++) {
            const [, a] = this._adj[i];
            if (a === e) {
                this._adj.splice(i, 1);
                return;
            }
        }
    }

    public removeAllEdges(): void {
        for (let i = this._adj.length - 1; i >= 0; i--) {
            const [u, e] = this._adj[i];
            if (!e.directed)
                u.removeEdgeUnidirectionally(e);
        }
        this._adj.length = 0;
    }

    public getAdjacencyList(): Edge[] {
        return this._adj.map(e => e[1]);
    }

    public getAdjacentVertices(): Vertex[] {
        return this._adj.map(e => e[1].v);
    }

    public setLabel(label: string): void {
        this._label = label;
    }
}