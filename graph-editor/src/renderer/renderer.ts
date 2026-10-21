window.addEventListener('DOMContentLoaded', () => {
    const nodeEl = document.getElementById('node-version');
    const electronEl = document.getElementById('electron-version');
    const chromeEl = document.getElementById('chrome-version');
    
    if (nodeEl) nodeEl.innerText = window.versions.node();
    if (electronEl) electronEl.innerText = window.versions.electron();
    if (chromeEl) chromeEl.innerText = window.versions.chrome();
});
