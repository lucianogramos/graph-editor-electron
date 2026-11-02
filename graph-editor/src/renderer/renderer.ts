import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { ToolManager, ToolType } from "./grapheditor/tool-manager";
import { updateTheme } from "./theme";

await updateTheme();
titleBarInit();

const editorElem = document.getElementById("editor") as HTMLDivElement;
const weightValueInput = document.getElementById('edge-weight-input') as HTMLInputElement;
const weightInputContainer = document.getElementById('edge-weight-container') as HTMLElement;

const toolManager = new ToolManager();
const graphManager = new GraphManager("editor", editorElem.clientWidth, editorElem.clientHeight, toolManager);
const canvas = graphManager.getCanvas();

let timeoutId: number | undefined = undefined;

window.addEventListener('resize', () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
        canvas.setSize(editorElem.clientWidth, editorElem.clientHeight);
    }, 250);
});

toolManager.init();

let isSpacePressed = false;

window.addEventListener('keydown', (e: KeyboardEvent) => {
    const activeElem = document.activeElement as HTMLElement;
    if (activeElem && ['INPUT', 'TEXTAREA'].includes(activeElem.tagName)) return;

    if (e.code === 'Space' && !isSpacePressed) {
        isSpacePressed = true;
        editorElem.style.cursor = 'grab';
    }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.code === 'Space') {
        isSpacePressed = false;
        editorElem.style.cursor = 'default';
    }
});

editorElem.addEventListener('auxclick', (e: MouseEvent) => {
    if (e.button === 1) e.preventDefault();
});

canvas.on('click', async (event: any) => {
    if (toolManager.getActiveTool() === 'vertex') {
        const domEvent = event.domEvent || event.evt || event;
        
        if (domEvent && domEvent.clientX !== undefined) {
            const rect = editorElem.getBoundingClientRect();
            const x = domEvent.clientX - rect.left;
            const y = domEvent.clientY - rect.top;
            
            await graphManager.addVertex(x, y);
        }
    }
});

editorElem.addEventListener('mousemove', (domEvent: MouseEvent) => {
    if (toolManager.getActiveTool() === 'edge') {
        const rect = editorElem.getBoundingClientRect();
        const x = domEvent.clientX - rect.left;
        const y = domEvent.clientY - rect.top;
        
        graphManager.updateSemiEdgePointer(x, y);
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
        if (isWeighted && weightValueInput) {
            weight = parseFloat(weightValueInput.value) || 1;
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