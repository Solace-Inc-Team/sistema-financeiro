import { startRouter } from './router.js';
import { renderCategorias } from './views/categorias.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLancamentos } from './views/lancamentos.js';

startRouter(
  [
    { path: 'resumo', label: 'Resumo', render: renderDashboard },
    { path: 'lancamentos', label: 'Lançamentos', render: renderLancamentos },
    { path: 'categorias', label: 'Categorias', render: renderCategorias },
  ],
  { nav: document.getElementById('nav'), view: document.getElementById('view') },
);
