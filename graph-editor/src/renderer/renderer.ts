import Konva from "konva";
import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/LayerImpl";
import { ToolManager, ToolType } from "./grapheditor/ToolManager";

titleBarInit();

const editorElem = document.getElementById("editor") as HTMLDivElement;
const weightValueInput = document.getElementById('edge-weight-input') as HTMLInputElement;
const weightInputContainer = document.getElementById('edge-weight-container') as HTMLElement;

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
const toolManager = new ToolManager(graphManager);

toolManager.init(stage, graphicsLayer);

const btnSelect = document.getElementById('btn-select-tool') as HTMLButtonElement;        
const btnAddVertex = document.getElementById('btn-vertex-tool') as HTMLButtonElement;    
const btnAddEdge = document.getElementById('btn-edge-tool') as HTMLButtonElement;
const btnEraser = document.getElementById('btn-erase-tool') as HTMLButtonElement;

let currentToolButton: HTMLButtonElement | null = btnAddVertex;

function setActiveToolButton(btn: HTMLButtonElement | null) {
    if (!btn) return;
    if (currentToolButton) {
        currentToolButton.setAttribute('data-selected', 'false');
    }
    btn.setAttribute('data-selected', 'true');
    currentToolButton = btn;
}

if (btnSelect) {
    btnSelect.addEventListener('click', () => {
        toolManager.setTool('select');
        setActiveToolButton(btnSelect);
    });
}

if (btnAddVertex) {
    btnAddVertex.addEventListener('click', () => {
        toolManager.setTool('vertex');
        setActiveToolButton(btnAddVertex);
    });
}

if (btnAddEdge) {
    btnAddEdge.addEventListener('click', () => {   
        const isAlreadyEdge = toolManager.getActiveTool() === 'edge';
        
        if (isAlreadyEdge) {
            const isSelected = btnAddEdge.getAttribute('data-selected') === 'true';
            btnAddEdge.setAttribute('data-selected', isSelected ? 'false' : 'true');
        } else {
            toolManager.setTool('edge');
            setActiveToolButton(btnAddEdge);
            updateEdgeParameters();
        }
    });
}

if (btnEraser) {
    btnEraser.addEventListener('click', () => {
        toolManager.setTool('eraser');
        setActiveToolButton(btnEraser);
    });
}

let edgeTypeSelected = false;
let edgeWeightSelected = false;

const edgeDirectedButton = document.querySelector('button[data-value="directed"]') as HTMLButtonElement;
const edgeUndirectedButton = document.querySelector('button[data-value="undirected"]') as HTMLButtonElement;
const edgeWeightedButton = document.querySelector('button[data-value="weighted"]') as HTMLButtonElement;
const edgeUnweightedButton = document.querySelector('button[data-value="unweighted"]') as HTMLButtonElement;

if (edgeDirectedButton && edgeUndirectedButton) {
    edgeDirectedButton.addEventListener('click', () => {
        edgeDirectedButton.setAttribute('data-selected', 'true');
        edgeUndirectedButton.setAttribute('data-selected', 'false');
        edgeTypeSelected = true;
        updateEdgeParameters();
    });
    
    edgeUndirectedButton.addEventListener('click', () => {
        edgeUndirectedButton.setAttribute('data-selected', 'true');
        edgeDirectedButton.setAttribute('data-selected', 'false');
        edgeTypeSelected = true;
        updateEdgeParameters();
    });
}

if (edgeWeightedButton && edgeUnweightedButton) {
    edgeWeightedButton.addEventListener('click', () => {
        edgeWeightedButton.setAttribute('data-selected', 'true');
        edgeUnweightedButton.setAttribute('data-selected', 'false');
        edgeWeightSelected = true;

        if (weightInputContainer) {
            weightInputContainer.classList.remove('hidden');
            weightInputContainer.classList.add('flex');
        }

        updateEdgeParameters();
    });

    edgeUnweightedButton.addEventListener('click', () => {
        edgeUnweightedButton.setAttribute('data-selected', 'true');
        edgeWeightedButton.setAttribute('data-selected', 'false');
        edgeWeightSelected = true;

        if (weightInputContainer) {
            weightInputContainer.classList.remove('flex');
            weightInputContainer.classList.add('hidden');
        }

        updateEdgeParameters();
    });
}

if (weightValueInput) {
    weightValueInput.addEventListener('input', () => {
        updateEdgeParameters();
    });
}

function updateEdgeParameters() {
    if (toolManager.getActiveTool() === 'edge') {
        if (!edgeTypeSelected || !edgeWeightSelected) {
            graphManager.disableEdgeCreation();
            return;
        }

        const isWeighted = edgeWeightedButton?.getAttribute('data-selected') === 'true';
        const isDirected = edgeDirectedButton?.getAttribute('data-selected') === 'true';
        
        let weight = 1;
        if (isWeighted) {
            if (weightValueInput) {
                weight = parseFloat(weightValueInput.value) || 1;
            } else {
                const inputWeight = prompt("Digite o peso da aresta:", "1");
                weight = inputWeight ? parseFloat(inputWeight) || 1 : 1;
            }
        }

        graphManager.enableEdgeCreation(isWeighted, isDirected, weight);
    }
}

toolManager.onToolChange((tool: ToolType) => {
    graphManager.setTool(tool);
    stage.draggable(tool !== 'eraser');

    if (tool === 'edge') {
        updateEdgeParameters();
    } else {
        graphManager.disableEdgeCreation();
        if (weightInputContainer) {
            weightInputContainer.classList.remove('flex');
            weightInputContainer.classList.add('hidden');
        }
    }
});

toolManager.setTool('vertex');
setActiveToolButton(btnAddVertex);