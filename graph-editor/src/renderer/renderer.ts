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

let edgeTypeSelected = false;
let edgeWeightSelected = false;

const edgeDirectedButton = document.getElementById('edge-directed-option') as HTMLButtonElement;
const edgeUndirectedButton = document.getElementById('edge-undirected-option') as HTMLButtonElement;
const edgeWeightedButton = document.getElementById('edge-weighted-option') as HTMLButtonElement;
const edgeUnweightedButton = document.getElementById('edge-unweighted-option') as HTMLButtonElement;

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
    if (tool === 'edge') {
        updateEdgeParameters();
    } else {
        if (weightInputContainer) {
            weightInputContainer.classList.remove('flex');
            weightInputContainer.classList.add('hidden');
        }
    }
});

toolManager.setTool('vertex');