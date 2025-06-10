import { config } from 'dotenv'
import { z } from 'zod'

// Load the .env file
config({ path: '../.env' })

// Define the schema using zod
const envSchema = z.object({
  GH_GITHUB_APP_ID: z.string().min(1, 'GH_GITHUB_APP_ID is required'),
  GH_GITHUB_ORG: z.string().min(1, 'GH_GITHUB_ORG is required'),
  GH_GITHUB_APP_PRIVATE_KEY_BASE64: z
    .string()
    .min(1, 'PRIVATE_KEY is required'),
  GH_GITHUB_WEBHOOK_SECRET_HMAC: z
    .string()
    .min(1, 'WEBHOOK_SECRET is required'),
  GH_GITHUB_USERNAME: z.string().min(1, 'GH_GITHUB_USER is required'),
  GH_GITHUB_REPO_NAME: z.string().min(1, 'GH_GITHUB_REPO_NAME is required'),
  GH_GITHUB_APP_NAME: z.string().min(1, 'GH_GITHUB_APP_NAME is required'),

  DO_SERVERLESS_NAMESPACE_ID: z
    .string()
    .min(1, 'DO_SERVERLESS_NAMESPACE_ID is required'),
  DOCTL_API_TOKEN: z.string().min(1, 'DOCTL_API_TOKEN is required'),

  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT must be a valid URL'),

  SLACK_WEBHOOK_URL: z.string().min(1, 'SLACK_WEBHOOK_URL must be a valid URL'),
})

// Validate the environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    '❌ Error validating environment variables:',
    parsedEnv.error.format(),
  )
  throw new Error('Invalid configuration in .env')
}

// Export the typed variables
export const env = parsedEnv.data
