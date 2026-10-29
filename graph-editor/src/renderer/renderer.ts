import Konva from "konva";
import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/LayerImpl";
import { ToolManager, ToolType } from "./grapheditor/ToolManager";

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
        });
    }, 250);
});

const graphicsLayer = new LayerImpl();
stage.add(graphicsLayer.getKonvaLayer());
graphicsLayer.draw();

const graphManager = new GraphManager(graphicsLayer);
const toolManager = new ToolManager();

const btnSelect = document.getElementById('btn-select-tool') as HTMLButtonElement;       
const btnAddVertex = document.getElementById('btn-vertex-tool') as HTMLButtonElement;    
const btnAddEdge = document.getElementById('btn-edge-tool') as HTMLButtonElement;
const btnEraser = document.getElementById('btn-erase-tool') as HTMLButtonElement;
let currentTool: HTMLButtonElement = btnSelect;

btnSelect.setAttribute('data-selected', 'true');
btnSelect.addEventListener('click', () => setActiveToolButton(btnSelect));
btnAddVertex.addEventListener('click', () => setActiveToolButton(btnAddVertex));
btnAddEdge.addEventListener('click', () => setActiveToolButton(btnAddEdge));
btnEraser.addEventListener('click', () => setActiveToolButton(btnEraser));

const edgeDirectedButton = document.getElementById('edge-directed-button') as HTMLButtonElement;
const edgeUndirectedButton = document.getElementById('edge-undirected-button') as HTMLButtonElement;
const edgeWeightedButton = document.getElementById('edge-weighted-button') as HTMLButtonElement;
const edgeUnweightedButton = document.getElementById('edge-unweighted-button') as HTMLButtonElement;

edgeDirectedButton.addEventListener('click', () => setActiveEdgeOption(edgeUndirectedButton, edgeDirectedButton));
edgeUndirectedButton.addEventListener('click', () => setActiveEdgeOption(edgeDirectedButton, edgeUndirectedButton));
edgeWeightedButton.addEventListener('click', () => setActiveEdgeOption(edgeUnweightedButton, edgeWeightedButton));
edgeUnweightedButton.addEventListener('click', () => setActiveEdgeOption(edgeWeightedButton, edgeUnweightedButton));
setActiveEdgeOption(edgeDirectedButton, edgeUndirectedButton);
setActiveEdgeOption(edgeWeightedButton, edgeUnweightedButton);

// function updateActiveButtonUI(tool: ToolType) {
//     toolButtons.forEach(btn => btn.removeAttribute('data-selected'));
    
//     if (tool === 'select') btnSelect?.setAttribute('data-selected', 'true');
//     else if (tool === 'vertex') btnAddVertex?.setAttribute('data-selected', 'true');
//     else if (tool === 'edge') btnAddEdge?.setAttribute('data-selected', 'true');
//     else if (tool === 'eraser') btnEraser?.setAttribute('data-selected', 'true');
// }

function setActiveToolButton(btn: HTMLButtonElement) {
    btn.setAttribute('data-selected', 'true');
    currentTool.setAttribute('data-selected', 'false');
    currentTool = btn;
}

function setActiveEdgeOption(currentActiveBtn: Element, newBtn: Element) {
    currentActiveBtn.setAttribute('data-selected', 'false');
    newBtn.setAttribute('data-selected', 'true');
}

toolManager.onToolChange((tool: ToolType) => {
    graphManager.setTool(tool);

    stage.draggable(tool !== 'eraser');

    if (tool === 'edge') {
        // evaluateEdgeCreationState();
    } else {
        graphManager.disableEdgeCreation();
    }
    
    console.log(`Ferramenta ativa alterada para: ${tool}`);
});

toolManager.setTool('vertex');

stage.on('click', (e) => {
    if (e.target !== stage) return;
    if (toolManager.getActiveTool() !== 'vertex') return;

    const pointerPos = stage.getRelativePointerPosition();
    if (pointerPos) {
        graphManager.addVertex(pointerPos.x, pointerPos.y);
        graphicsLayer.batchDraw(); 
        console.log(`Vértice criado em: x=${pointerPos.x}, y=${pointerPos.y}`);
    }
});

window.addEventListener('mousemove', (e: MouseEvent) => {
    if (toolManager.getActiveTool() !== 'edge') return;

    if (stage && typeof stage.setPointersPositions === 'function') {
        stage.setPointersPositions(e);
    }

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    
    if (pos) {
        const stagePos = transform.point(pos);
        graphManager.updateSemiEdgePointer(stagePos.x, stagePos.y);
    }
});

btnSelect?.addEventListener('click', () => {
    toolManager.setTool('select');
});

btnAddVertex?.addEventListener('click', () => {
    toolManager.setTool('vertex');
});

btnAddEdge?.addEventListener('click', () => {   
    if (toolManager.getActiveTool() === 'edge') {
    } else {
        toolManager.setTool('edge');
    }
});

btnEraser?.addEventListener('click', () => {
    toolManager.setTool('eraser');
});
