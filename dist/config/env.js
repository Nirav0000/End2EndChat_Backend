import { config } from 'dotenv';
import { z } from 'zod';
config();
const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    MONGODB_URI: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    REDIS_URL: z.string(),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.string().transform(Number),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    MINIO_BUCKET: z.string(),
    MINIO_USE_SSL: z.string().transform((val) => val === 'true').default('false'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}
export const env = parsedEnv.data;
//# sourceMappingURL=env.js.map