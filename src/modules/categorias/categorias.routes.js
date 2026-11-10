import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/schemas.js';
import { CategoriasController } from './categorias.controller.js';
import { atualizarCategoriaBody, criarCategoriaBody, listarCategoriasQuery } from './categorias.schemas.js';

export function createCategoriasRouter(service) {
  const router = Router();
  const controller = new CategoriasController(service);

  router.get('/', validate({ query: listarCategoriasQuery }), controller.listar);
  router.post('/', validate({ body: criarCategoriaBody }), controller.criar);
  router.patch('/:id', validate({ params: idParams, body: atualizarCategoriaBody }), controller.renomear);
  router.delete('/:id', validate({ params: idParams }), controller.remover);

  return router;
}
