import Konva from "konva";

let currentDropdownMenuOpen: HTMLElement | null = null;

document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest('[data-dropdown-trigger]');

    // Se o usuário clicou em um gatilho de dropdown
    if (trigger) {
        e.stopPropagation();
        const menuId = trigger.getAttribute('data-dropdown-trigger');
        const targetMenu = document.getElementById(menuId!);
        if (targetMenu === null) return;
        if (currentDropdownMenuOpen === null) {
            currentDropdownMenuOpen = targetMenu;
            targetMenu.classList.add('flex');
        }
        else if (targetMenu === currentDropdownMenuOpen) {
            currentDropdownMenuOpen = null;
            targetMenu.classList.remove('flex');
        }
        else {
            currentDropdownMenuOpen.classList.remove('flex');
            currentDropdownMenuOpen = targetMenu;
            targetMenu.classList.add('flex');
        }

        return;
    }

    if (currentDropdownMenuOpen !== null) { 
        currentDropdownMenuOpen.classList.remove('flex');
        currentDropdownMenuOpen = null;
    }
});

// Impede que cliques *dentro* de qualquer menu flutuante fechem ele prematuramente
document.querySelectorAll('.title-bar-dropdown-menu').forEach((menu) => {
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

const editorElem = document.getElementById("editor") as HTMLDivElement;
console.log(editorElem.clientWidth, editorElem.clientHeight);

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
})

const layer = new Konva.Layer();
stage.add(layer);

const circulo = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 60,
    fill: '#3498db',
    stroke: '#2980b9',
    strokeWidth: 4,
    draggable: true,
});

circulo.on('mouseenter', () => {
    document.body.style.cursor = 'pointer';
});

circulo.on('mouseleave', () => {
    document.body.style.cursor = 'default';
});

circulo.on('dragstart', () => {
    circulo.fill('#e74c3c');
    layer.batchDraw();
});

circulo.on('dragend', () => {
    circulo.fill('#3498db');
    layer.batchDraw();
});

layer.add(circulo);
layer.draw();
