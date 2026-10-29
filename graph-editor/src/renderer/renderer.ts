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

const toolButtons = document.querySelectorAll('.tool-option');
const btnSelect = toolButtons[0];             
const btnAddVertex = toolButtons[1];    
const btnAddEdge = document.getElementById('btn-edge-tool') || toolButtons[2];
const btnEraser = toolButtons[3];             

const edgeSubmenu = document.getElementById('edge-submenu') as HTMLDivElement;
const weightSelect = document.getElementById('edge-weight-select') as HTMLSelectElement;
const weightInputContainer = document.getElementById('edge-weight-input-container') as HTMLDivElement;
const weightValueInput = document.getElementById('edge-weight-value') as HTMLInputElement;
const directionSelect = document.getElementById('edge-direction-select') as HTMLSelectElement;

function updateActiveButtonUI(tool: ToolType) {
    toolButtons.forEach(btn => btn.removeAttribute('data-selected'));
    
    if (tool === 'select') btnSelect?.setAttribute('data-selected', 'true');
    else if (tool === 'vertex') btnAddVertex?.setAttribute('data-selected', 'true');
    else if (tool === 'edge') btnAddEdge?.setAttribute('data-selected', 'true');
    else if (tool === 'eraser') btnEraser?.setAttribute('data-selected', 'true');
}

function evaluateEdgeCreationState() {
    const weightVal = weightSelect.value;
    const directionVal = directionSelect.value;

    if (weightVal === 'weighted') {
        weightInputContainer?.classList.remove('hidden');
    } else {
        weightInputContainer?.classList.add('hidden');
    }

    if (weightVal !== "" && directionVal !== "") {
        const isWeighted = weightVal === 'weighted';
        const isDirected = directionVal === 'directed';
        const customWeight = parseFloat(weightValueInput?.value) || 1;
        
        graphManager.enableEdgeCreation(isWeighted, isDirected, customWeight);
        console.log(`Modo de arestas pronto -> Ponderado: ${isWeighted}, Direcional: ${isDirected}, Peso: ${customWeight}`);
    } else {
        graphManager.disableEdgeCreation();
    }
}

toolManager.onToolChange((tool: ToolType) => {
    updateActiveButtonUI(tool);

    graphManager.setTool(tool);

    stage.draggable(tool !== 'eraser');

    if (tool === 'edge') {
        edgeSubmenu?.classList.remove('hidden');
        evaluateEdgeCreationState();
    } else {
        edgeSubmenu?.classList.add('hidden');
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
    edgeSubmenu?.classList.add('hidden');
});

btnAddVertex?.addEventListener('click', () => {
    toolManager.setTool('vertex');
    edgeSubmenu?.classList.add('hidden');
});

btnAddEdge?.addEventListener('click', () => {   
    if (toolManager.getActiveTool() === 'edge') {
        edgeSubmenu?.classList.toggle('hidden');
    } else {
        toolManager.setTool('edge');
        edgeSubmenu?.classList.remove('hidden');
    }
});

btnEraser?.addEventListener('click', () => {
    toolManager.setTool('eraser');
    edgeSubmenu?.classList.add('hidden');
});

weightSelect?.addEventListener('change', evaluateEdgeCreationState);
weightValueInput?.addEventListener('input', evaluateEdgeCreationState);
directionSelect?.addEventListener('change', evaluateEdgeCreationState);