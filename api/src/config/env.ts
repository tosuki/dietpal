import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string(),
  SERVER_HOST: z.string().default("0.0.0.0"),
  SERVER_PORT: z.string().default("3001").transform((t) => Number(t)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
