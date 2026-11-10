import { z } from '../../config/zod.js';
import { mesSchema, tipoSchema } from '../../utils/schemas.js';

export const resumoQuery = z.object({ mes: mesSchema.optional() });

export const porCategoriaQuery = z.object({
  mes: mesSchema.optional(),
  tipo: tipoSchema.default('DESPESA'),
});

export const fluxoQuery = z.object({
  mes: mesSchema.optional(),
  meses: z.coerce.number().int().min(1).max(24).default(6),
});
