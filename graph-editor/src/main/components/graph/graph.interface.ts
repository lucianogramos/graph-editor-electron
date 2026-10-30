import { Edge } from "./edge.interface";
import { Vertex } from "./vertex.interface";

export interface Graph {
    createVertex: (label?: string) => number;
    removeVertex: (id: number) => boolean;
    connectVertices: (uId: number, vId: number, weight: number, directed: boolean) => Edge | null;
    getVertex: (id: number) => Vertex | undefined;
    getVertices: () => Vertex[];
}