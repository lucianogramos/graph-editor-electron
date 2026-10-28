import Konva from "konva";
import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/LayerImpl";
import { CircleShapeImpl } from "./graphics/CircleShapeImpl";

titleBarInit();

const editorElem = document.getElementById("editor") as HTMLDivElement;

const stage = new Konva.Stage({
    container: editorElem,
    width: editorElem.clientWidth,
    height: editorElem.clientHeight,
    draggable: true
});

let timeoutId: number | undefined = undefined;

window.addEventListener('resize', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        stage.setAttrs({
            width: editorElem.clientWidth,
            height: editorElem.clientHeight
        })
    }, 250);
});

const graphicsLayer = new LayerImpl();
graphicsLayer.attachTo(stage);

const circulo1 = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 60,
    fill: '#3498db',
    stroke: '#2980b9',
    strokeWidth: 4,
    draggable: true,
});

const circulo2 = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 30,
    fill: '#3498bb',
    stroke: '#298099',
    strokeWidth: 4,
    draggable: true,
});

circulo1.on('click', (event) => {
    console.log('Circulo 1:', event.target, event.currentTarget)
});

circulo2.on('click', (event) => {
    console.log('Circulo 2', event.target, event.currentTarget)
});

const konvaLayer = (graphicsLayer as any).layer;
konvaLayer.add(circulo1, circulo2);
konvaLayer.draw();


const graphManager = new GraphManager(graphicsLayer);

stage.on('click', (e) => {
    if (e.target !== stage) return;
    const pointerPos = stage.getPointerPosition();
    if (pointerPos) {
        graphManager.addVertex(pointerPos.x, pointerPos.y);
        konvaLayer.batchDraw(); 
    }
});