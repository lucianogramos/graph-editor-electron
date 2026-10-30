import { Vertex } from "./vertex.interface";

export interface Edge {
    readonly u: Vertex;
    readonly v: Vertex;
    readonly directed: boolean;
    weight: number;
    setWeight: (weight: number) => void;
}