import { config } from 'dotenv'
import { z } from 'zod'

// Load the .env file
config({ path: '../.env' })

// Define the schema using zod
const envSchema = z.object({
  GITHUB_APP_ID: z.string().min(1, 'GITHUB_APP_ID is required'),
  GITHUB_ORG: z.string().min(1, 'GITHUB_ORG is required'),
  GITHUB_APP_PRIVATE_KEY_BASE64: z.string().min(1, 'PRIVATE_KEY is required'),
  GITHUB_WEBHOOK_SECRET_HMAC: z.string().min(1, 'WEBHOOK_SECRET is required'),
  GITHUB_USERNAME: z.string().min(1, 'GITHUB_USER is required'),
  GITHUB_REPO_NAME: z.string().min(1, 'GITHUB_REPO_NAME is required'),
  GITHUB_APP_NAME: z.string().min(1, 'GITHUB_APP_NAME is required'),

  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),

  SLACK_WEBHOOK_URL: z.string().url('SLACK_WEBHOOK_URL must be a valid URL'),
})

// Validate the environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Error validating environment variables:', parsedEnv.error.format())
  throw new Error('Invalid configuration in .env')
}

// Export the typed variables
export const env = parsedEnv.data
