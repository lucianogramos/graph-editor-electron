import Konva from "konva";
import { titleBarInit } from "./title-bar";
import { GraphManager } from "./grapheditor/graph-manager";
import { LayerImpl } from "./graphics/LayerImpl";

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

let activeTool: 'select' | 'vertex' | 'edge' | 'eraser' = 'vertex';

stage.on('click', (e) => {
    if (e.target !== stage) return;
    
    if (activeTool !== 'vertex') return;

    const pointerPos = stage.getRelativePointerPosition();
    if (pointerPos) {
        graphManager.addVertex(pointerPos.x, pointerPos.y);
        graphicsLayer.batchDraw(); 
        console.log(`Vértice criado em: x=${pointerPos.x}, y=${pointerPos.y}`);
    }
});

const toolButtons = document.querySelectorAll('.tool-option');

const btnSelect = toolButtons[0];       
const btnAddVertex = toolButtons[1];    
const btnAddEdge = document.getElementById('btn-edge-tool') || toolButtons[2]; // Garantido por ID
const btnEraser = toolButtons[3];       

const edgeSubmenu = document.getElementById('edge-submenu') as HTMLDivElement;
const weightSelect = document.getElementById('edge-weight-select') as HTMLSelectElement;
const weightInputContainer = document.getElementById('edge-weight-input-container') as HTMLDivElement;
const weightValueInput = document.getElementById('edge-weight-value') as HTMLInputElement;
const directionSelect = document.getElementById('edge-direction-select') as HTMLSelectElement;

function updateActiveButton(activeBtn: Element) {
    toolButtons.forEach(btn => btn.removeAttribute('data-selected'));
    activeBtn.setAttribute('data-selected', 'true');
}

function evaluateEdgeCreationState() {
    const weightVal = weightSelect.value;
    const directionVal = directionSelect.value;

    // Mostra ou esconde o input de valor do peso dependendo da escolha
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

btnSelect?.addEventListener('click', () => {
    graphManager.disableEdgeCreation();
    activeTool = 'select';
    edgeSubmenu?.classList.add('hidden'); 
    updateActiveButton(btnSelect);
    console.log('Modo: Selecionar');
});

btnAddVertex?.addEventListener('click', () => {
    graphManager.disableEdgeCreation();
    activeTool = 'vertex';
    edgeSubmenu?.classList.add('hidden'); 
    updateActiveButton(btnAddVertex);
    console.log('Modo: Criar Vértices');
});

btnAddEdge?.addEventListener('click', () => {
    activeTool = 'edge';
    updateActiveButton(btnAddEdge);
    
    edgeSubmenu?.classList.toggle('hidden');

    evaluateEdgeCreationState();
    console.log('Modo de arestas: selecione as opções no sub-menu.');
});

weightSelect?.addEventListener('change', evaluateEdgeCreationState);
weightValueInput?.addEventListener('input', evaluateEdgeCreationState);
directionSelect?.addEventListener('change', evaluateEdgeCreationState);

btnEraser?.addEventListener('click', () => {
    graphManager.disableEdgeCreation();
    activeTool = 'eraser';
    edgeSubmenu?.classList.add('hidden'); 
    updateActiveButton(btnEraser);
    console.log('Modo: Apagar');
});