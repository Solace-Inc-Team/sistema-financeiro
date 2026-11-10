import { z } from '../config/zod.js';

export const idParams = z.object({ id: z.coerce.number().int().positive() });

export const mesSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês inválido. Use o formato AAAA-MM.');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use o formato AAAA-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Essa data não existe no calendário.');

export const tipoSchema = z.enum(['RECEITA', 'DESPESA']);
