/**
 * Watchly Tabs Logic
 * Gestionează schimbarea tab-urilor pentru detaliile filmelor și meniuri.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Selectăm toate tab-urile și toate panourile de conținut
  const tabs = document.querySelectorAll('.movie-detail__tab, .menu-tab');
  const panels = document.querySelectorAll('.movie-detail__panel, .tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Luăm ID-ul panoului din atributul data-tab
      const targetId = tab.getAttribute('data-tab');
      if (!targetId) return;

      // 1. Dezactivăm toate tab-urile active
      tabs.forEach(t => {
        t.classList.remove('active', 'movie-detail__tab--active');
      });

      // 2. Ascundem toate panourile de conținut
      panels.forEach(panel => {
        panel.classList.remove('active', 'movie-detail__panel--active');
      });

      // 3. Activăm tab-ul pe care s-a dat click
      tab.classList.add('active', 'movie-detail__tab--active');

      // 4. Afișăm panoul corespunzător
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active', 'movie-detail__panel--active');
      }
    });
  });
});