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
