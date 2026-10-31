import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/implementation/layer-impl";
import { ToolManager, ToolType } from "./grapheditor/tool-manager";
import * as Graphics from "./graphics/graphics-gateway";

titleBarInit();

const editorElem = document.getElementById("editor") as HTMLDivElement;
const weightValueInput = document.getElementById('edge-weight-input') as HTMLInputElement;
const weightInputContainer = document.getElementById('edge-weight-container') as HTMLElement;

const canvas = Graphics.createCanvas("editor", editorElem.clientWidth, editorElem.clientHeight);

let timeoutId: number | undefined = undefined;

window.addEventListener('resize', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        canvas.setSize(editorElem.clientWidth, editorElem.clientHeight);
    }, 250);
});

const graphicsLayer = new LayerImpl();
canvas.addLayer(graphicsLayer);
graphicsLayer.draw();

const toolManager = new ToolManager();
const graphManager = new GraphManager(toolManager, graphicsLayer);

toolManager.init();

function getLogicalCoordinates(domEvent: MouseEvent): { x: number; y: number } {
    const rect = editorElem.getBoundingClientRect();
    const screenX = domEvent.clientX - rect.left;
    const screenY = domEvent.clientY - rect.top;

    const stage = 
        (canvas as any).getStage?.() || 
        (editorElem as any).__konvaStage || 
        (window as any).Konva?.stages?.[0];

    if (stage) {
        const scale = stage.scaleX() || 1;
        const stageX = stage.x() || 0;
        const stageY = stage.y() || 0;

        return {
            x: (screenX - stageX) / scale,
            y: (screenY - stageY) / scale
        };
    }

    return { x: screenX, y: screenY };
}

canvas.on('click', async (event: any) => {
    if (toolManager.getActiveTool() === 'vertex') {
        const domEvent = event.domEvent || event.evt || event;
        
        if (domEvent && domEvent.clientX !== undefined) {
            const coords = getLogicalCoordinates(domEvent);
            if (coords.x !== 0 || coords.y !== 0) {
                await graphManager.addVertex(coords.x, coords.y);
            }
        }
    }
});

editorElem.addEventListener('mousemove', (domEvent: MouseEvent) => {
    const coords = getLogicalCoordinates(domEvent);
    if (coords.x !== 0 || coords.y !== 0) {
        graphManager.updateSemiEdgePointer(coords.x, coords.y);
    }
});

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

if (btnAddEdge) {
    btnAddEdge.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();

        const currentTool = toolManager.getActiveTool();
        if (currentTool !== 'edge') {
            toolManager.setTool('edge');
            updateEdgeParameters();
        } else {
            btnAddEdge.setAttribute('data-selected', 'false');
            currentToolButton = null;
            toolManager.setTool('select' as any);
            graphManager.disableEdgeCreation();
            if (weightInputContainer) {
                weightInputContainer.classList.remove('flex');
                weightInputContainer.classList.add('hidden');
            }
        }
    }, true);
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
    canvas.setDraggable(tool !== 'eraser');

    if (tool === 'select') setActiveToolButton(btnSelect);
    else if (tool === 'vertex') setActiveToolButton(btnAddVertex);
    else if (tool === 'edge') setActiveToolButton(btnAddEdge);
    else if (tool === 'eraser') setActiveToolButton(btnEraser);

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