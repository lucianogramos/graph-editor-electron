import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/implementation/layer-impl";
import { ToolManager, ToolType } from "./grapheditor/tool-manager";
import * as Graphics from "./graphics/graphics-gateway";
import { updateTheme } from "./theme";

await updateTheme();
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

let isSpacePressed = false;
let isPanning = false;
let startPanPos = { x: 0, y: 0 };
let stageStartPos = { x: 0, y: 0 };

function getKonvaStage(): any {
    return (canvas as any).getStage?.() || 
           (canvas as any).stage || 
           (editorElem as any).__konvaStage || 
           (window as any).Konva?.stages?.[0];
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    const activeElem = document.activeElement as HTMLElement;
    if (activeElem && ['INPUT', 'TEXTAREA'].includes(activeElem.tagName)) return;

    if (e.code === 'Space' && !isSpacePressed) {
        isSpacePressed = true;
        if (editorElem) editorElem.style.cursor = 'grab';
    }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.code === 'Space') {
        isSpacePressed = false;
        if (!isPanning && editorElem) {
            editorElem.style.cursor = 'default';
        }
    }
});

editorElem.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 1 || isSpacePressed) {
        const stage = getKonvaStage();
        if (!stage) return;

        isPanning = true;
        startPanPos = { x: e.clientX, y: e.clientY };
        stageStartPos = { x: stage.x(), y: stage.y() };
        
        if (editorElem) editorElem.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    }
}, true);

window.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isPanning) return;

    const stage = getKonvaStage();
    if (!stage) return;

    const dx = e.clientX - startPanPos.x;
    const dy = e.clientY - startPanPos.y;

    stage.position({
        x: stageStartPos.x + dx,
        y: stageStartPos.y + dy
    });

    stage.batchDraw();
}, true);

window.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
        if (editorElem) {
            editorElem.style.cursor = isSpacePressed ? 'grab' : 'default';
        }
    }
});

editorElem.addEventListener('auxclick', (e: MouseEvent) => {
    if (e.button === 1) e.preventDefault();
});

function getLogicalCoordinates(domEvent: MouseEvent): { x: number; y: number } {
    const rect = editorElem.getBoundingClientRect();
    const screenX = domEvent.clientX - rect.left;
    const screenY = domEvent.clientY - rect.top;

    const stage = getKonvaStage();

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
    if (isPanning) return;

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
    if (toolManager.getActiveTool() === 'edge' && !isPanning) {
        const coords = getLogicalCoordinates(domEvent);
        if (coords.x !== 0 || coords.y !== 0) {
            graphManager.updateSemiEdgePointer(coords.x, coords.y);
        }
    }
});

const btnSelect = (document.getElementById('btn-select-tool') || document.getElementById('btn-select')) as HTMLButtonElement;        
const btnAddVertex = (document.getElementById('btn-vertex-tool') || document.getElementById('btn-vertex')) as HTMLButtonElement;    
const btnAddEdge = (document.getElementById('btn-edge-tool') || document.getElementById('btn-edge')) as HTMLButtonElement;
const btnEraser = (document.getElementById('btn-erase-tool') || document.getElementById('btn-eraser')) as HTMLButtonElement;

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
            toolManager.setTool('select');
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