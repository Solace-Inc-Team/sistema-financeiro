import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { RelatoriosController } from './relatorios.controller.js';
import { fluxoQuery, porCategoriaQuery, resumoQuery } from './relatorios.schemas.js';

export function createRelatoriosRouter(service) {
  const router = Router();
  const controller = new RelatoriosController(service);

  router.get('/resumo', validate({ query: resumoQuery }), controller.resumo);
  router.get('/por-categoria', validate({ query: porCategoriaQuery }), controller.porCategoria);
  router.get('/fluxo', validate({ query: fluxoQuery }), controller.fluxo);

  return router;
}
