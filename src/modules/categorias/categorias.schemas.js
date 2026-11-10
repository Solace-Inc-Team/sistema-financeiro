import { z } from '../../config/zod.js';
import { tipoSchema } from '../../utils/schemas.js';

const nome = z.string().trim().min(2).max(60);

export const criarCategoriaBody = z.object({ nome, tipo: tipoSchema });
export const atualizarCategoriaBody = z.object({ nome });
export const listarCategoriasQuery = z.object({ tipo: tipoSchema.optional() });
