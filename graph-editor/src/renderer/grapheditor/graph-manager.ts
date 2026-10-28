import { Vertex } from './vertex';

export class GraphManager {
    private vertices: Vertex[] = [];

    constructor(private graphicsGateway: any) {}

    public addVertex(x: number, y: number): Vertex {
        const newVertex = new Vertex(x, y, this.graphicsGateway);
        this.vertices.push(newVertex);
        console.log(`Vertex created at (${x}, ${y}). Total vertices: ${this.vertices.length}`);
        return newVertex;
    }

    public getVertices(): Vertex[] {
        return this.vertices;
    }
}