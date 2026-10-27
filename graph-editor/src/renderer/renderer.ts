import Konva from "konva";
import { titleBarInit } from "./title-bar";

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

const layer = new Konva.Layer();
stage.add(layer);

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

layer.add(circulo1, circulo2);
layer.draw();
