import { Vertex } from "./vertex.interface";

export interface Edge {
    readonly u: Vertex;
    readonly v: Vertex;
    weight: number;
    readonly directed: boolean;
    setWeight: (weight: number) => void;
}