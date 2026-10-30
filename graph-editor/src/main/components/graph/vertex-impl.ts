import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export class VertexImpl implements Vertex {
    private _label: string;
    private _adj: [Vertex, Edge][] = [];

    public get label(): string {
        return this._label;
    }

    public constructor(label: string = "") {
        this._label = label;
    }

    public addEdge(e: Edge): void {
        if (e === undefined)
            throw new Error('Undefined referente to edge.');
        this._adj.push([e.u === this ? e.v : e.u, e]);
    }

    public removeEdge(e: Edge): void {
        for (let i = 0; i < this._adj.length; i++) {
            const [v, a] = this._adj[i];
            if (a === e) {
                if (!e.directed) v.removeEdgeUnidirectionally(e);
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

    public removeAllEdgesIf(predicate: (e: Edge) => boolean): void {
        this._adj = this._adj.filter((t) => !predicate(t[1]));
    }

    public removeAllEdges(): void {
        const _this = this;
        for (const [t, ] of this._adj)
            t.removeAllEdgesIf(e => e.u === _this || e.v === _this);
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