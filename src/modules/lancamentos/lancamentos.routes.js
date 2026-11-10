import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/schemas.js';
import { LancamentosController } from './lancamentos.controller.js';
import {
  alterarStatusBody,
  atualizarLancamentoBody,
  criarLancamentoBody,
  listarLancamentosQuery,
} from './lancamentos.schemas.js';

export function createLancamentosRouter(service) {
  const router = Router();
  const controller = new LancamentosController(service);

  router.get('/', validate({ query: listarLancamentosQuery }), controller.listar);
  router.post('/', validate({ body: criarLancamentoBody }), controller.criar);
  router.get('/:id', validate({ params: idParams }), controller.obter);
  router.patch('/:id', validate({ params: idParams, body: atualizarLancamentoBody }), controller.atualizar);
  router.patch('/:id/status', validate({ params: idParams, body: alterarStatusBody }), controller.alterarStatus);
  router.delete('/:id', validate({ params: idParams }), controller.remover);

  return router;
}
