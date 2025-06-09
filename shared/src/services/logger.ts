import AWS from 'aws-sdk'
import { env } from '../env.js'

const s3 = new AWS.S3({
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_SECRET_KEY,
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
})

const BUCKET = env.S3_BUCKET

export async function saveLogPage(logLines, page, context = 'default-log') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const key = `logs/${context}/page-${String(page).padStart(3, '0')}-${timestamp}.log`
    const body = logLines.join('\n')

    await s3.putObject({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: 'text/plain',
    }).promise()
  } catch (err) {
    console.error(`❌ Failed to save log for page ${page} [${context}]:`, err)
    throw new Error(`Error saving log for page ${page}`)
  }
}
