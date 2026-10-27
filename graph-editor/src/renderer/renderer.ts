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

document.querySelectorAll('.title-bar-dropdown-menu').forEach((menu) => {
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

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
})

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
