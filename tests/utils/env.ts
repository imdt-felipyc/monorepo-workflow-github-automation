 /**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config({ path: '.env.test', quiet: true });

const envSchema = z.object({
  PLAYWRIGHT_TEST_BASE_URL: z.string(),
  PLAYWRIGHT_USERNAME: z.string().min(1),
  PLAYWRIGHT_PASSWORD: z.string().min(1),          
  PLAYWRIGHT_DICTATION_UNIT_URL: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (err) {
    console.error('[env.js] Invalid environment variables:', err);
    // opcionalmente: process.exit(1)
    throw err;
  }
})();
