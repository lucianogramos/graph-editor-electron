import { Edge } from "./edge.interface";

export interface Vertex {
    label: string;
    addEdge: (e: Edge) => void;
    removeEdge: (e: Edge) => void;
    removeAllEdges: () => void;
    removeEdgeUnidirectionally: (e: Edge) => void
    getAdjacencyList: () => Edge[];
    getAdjacentVertices: () => Vertex[];
    setLabel: (label: string) => void;
}