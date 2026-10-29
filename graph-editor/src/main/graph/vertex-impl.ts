import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export class VertexImpl implements Vertex {
    private _label: string;
    public get label(): string {
        return this.label;
    }

    private _adj: Edge[] = [];

    public constructor(label: string = "") {
        this._label = label;
    }

    public addEdge(e: Edge): void {

    }

    public removeEdge(e: Edge): void {

    }

    public unidirectionalEdgeRemoval(e: Edge): void {

    }

    public removeAllEdges(): void {
        for (const e of this._adj) {
            if (!e.directed) {
                // this._adj.
            }
        }
    }

    public getAdjacencyList(): Edge[] {
        return this._adj;
    }

    public getAdjacentVertices(): Vertex[] {
        return this._adj.map(e => e.v);
    }

    public setLabel(label: string): void {

    }
}