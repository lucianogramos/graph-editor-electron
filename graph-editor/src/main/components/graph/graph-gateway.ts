import { GraphImpl } from "./graph-impl";
import { Graph } from "./graph.interface";

export function createGraph(): Graph {
    return new GraphImpl();
}
