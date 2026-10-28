export async function titleBarInit() {
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

    document.getElementById('quit-button')?.addEventListener('click', () => {
        window.api.quit();
    })

    const toggleThemeButton = document.getElementById('toggle-theme-button') as HTMLDivElement;
    const theme = await window.api.getTheme();
    toggleThemeButton.setAttribute('data-theme', theme);
    if (theme === 'dark')
        document.body.classList.add('dark');

    toggleThemeButton.addEventListener('click', () => {
        const currentTheme = toggleThemeButton.getAttribute('data-theme') as ('light' | 'dark');
        let newTheme: 'light' | 'dark';
        if (currentTheme === 'light') {
            newTheme = 'dark';
            document.body.classList.add('dark');
        }
        else {
            newTheme = 'light';
            document.body.classList.remove('dark');
        }

        toggleThemeButton.setAttribute('data-theme', newTheme);
        window.api.changeTheme(newTheme);
    });
}
