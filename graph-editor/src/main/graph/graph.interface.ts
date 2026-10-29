import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export interface Graph {
    addVertex: (v: Vertex) => number;
    removeVertex: (v: Vertex) => void;
    removeVertexByIndex: (index: number) => void;
    connectVertices: (u: Vertex, v: Vertex, weight: number, directed: boolean) => Edge;
    connectVerticesByIndex: (uIndex: number, vIndex: number, weight: number, directed: boolean) => Edge;
    getVertexByIndex: (index: number) => Vertex;
    getVertexByLabel: (label: string) => Vertex;
    getVertices: () => Vertex[];
}