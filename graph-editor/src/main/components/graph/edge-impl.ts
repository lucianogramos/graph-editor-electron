import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export class EdgeImpl implements Edge {
    private _u: Vertex;
    private _v: Vertex;
    private _weight: number;
    private _directed: boolean;

    public get u(): Vertex {
        return this._u;
    }

    public get v(): Vertex {
        return this._v;
    }

    public get weight(): number {
        return this._weight;
    }

    public get directed(): boolean {
        return this._directed;
    }

    public constructor(u: Vertex, v: Vertex, weight: number, directed: boolean) {
        if (u === undefined || v === undefined)
            throw new Error("Undefined reference to vertex 'u' or vertex 'v'.");
        this._u = u;
        this._v = v;
        this._weight = weight;
        this._directed = directed;

        u.addEdge(this);
        if (this._directed) return;
        v.addEdge(this);
    }

    public setWeight(weight: number): void {
        this._weight = weight;
    }
}