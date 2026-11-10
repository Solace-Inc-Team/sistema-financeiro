import { Router } from 'express';
import { CategoriasRepository } from './modules/categorias/categorias.repository.js';
import { createCategoriasRouter } from './modules/categorias/categorias.routes.js';
import { CategoriasService } from './modules/categorias/categorias.service.js';
import { LancamentosRepository } from './modules/lancamentos/lancamentos.repository.js';
import { createLancamentosRouter } from './modules/lancamentos/lancamentos.routes.js';
import { LancamentosService } from './modules/lancamentos/lancamentos.service.js';
import { RelatoriosRepository } from './modules/relatorios/relatorios.repository.js';
import { createRelatoriosRouter } from './modules/relatorios/relatorios.routes.js';
import { RelatoriosService } from './modules/relatorios/relatorios.service.js';

/** Composição das dependências (repository -> service -> controller/rotas). */
export function createServices({ db, clock }) {
  const categoriasService = new CategoriasService(new CategoriasRepository(db));
  const lancamentosService = new LancamentosService({
    repository: new LancamentosRepository(db),
    categoriasService,
  });
  const relatoriosService = new RelatoriosService({ repository: new RelatoriosRepository(db), clock });
  return { categoriasService, lancamentosService, relatoriosService };
}

export function createApiRouter({ db, clock }) {
  const { categoriasService, lancamentosService, relatoriosService } = createServices({ db, clock });
  const router = Router();

  router.use('/categorias', createCategoriasRouter(categoriasService));
  router.use('/lancamentos', createLancamentosRouter(lancamentosService));
  router.use('/relatorios', createRelatoriosRouter(relatoriosService));

  return router;
}
