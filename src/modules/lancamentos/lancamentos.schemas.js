import { z } from '../../config/zod.js';
import { dateSchema, mesSchema, tipoSchema } from '../../utils/schemas.js';

const campos = {
  descricao: z.string().trim().min(2).max(150),
  valor_centavos: z.number().int().positive().max(100_000_000_00),
  categoria_id: z.number().int().positive(),
  data: dateSchema,
  status: z.enum(['PENDENTE', 'PAGO']),
};

export const criarLancamentoBody = z.object({
  ...campos,
  status: campos.status.default('PENDENTE'),
});

export const atualizarLancamentoBody = z.object(campos).partial();

export const alterarStatusBody = z.object({ status: campos.status });

export const listarLancamentosQuery = z.object({
  mes: mesSchema.optional(),
  tipo: tipoSchema.optional(),
  status: campos.status.optional(),
  categoria_id: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(60).optional(),
});
