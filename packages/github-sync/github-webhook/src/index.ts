import {
  env,
  SyncService,
  notifySlack,
  saveLogPage,
  mockreq,
} from '@repo/shared'
import { verifySignature } from './verify-signature.js'

const { GH_GITHUB_WEBHOOK_SECRET_HMAC, GH_GITHUB_APP_NAME } = env

async function handler(args: any) {
  // used when invoking the function locally by passing -p debug:true
  if (args?.debug) {
    args = { ...mockreq.created }
    console.log('Debugging invoked function')
  }

  // args.http -> ["path", "body", "isBase64Encoded", "queryString", "method", "headers"]
  const method = (args?.http?.method ?? '')?.toUpperCase()
  const headers = Object.fromEntries(
    Object.entries(args?.http?.headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  )

  const signature = headers['x-hub-signature-256']
  const event = headers['x-github-event']
  let body = args?.http?.body

  if (!signature || !event) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request' }),
    }
  }

  const isValid = verifySignature(
    GH_GITHUB_WEBHOOK_SECRET_HMAC,
    Buffer.from(body),
    signature,
  )

  if (!isValid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' }),
    }
  }

  body = JSON.parse(body)

  // Ignore events from the GitHub app
  if (body?.sender?.login === GH_GITHUB_APP_NAME) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ignored', reason: 'Event from bot' }),
    }
  }

  const action = body?.action
  const item = body?.projects_v2_item
  let result = ''
  try {
    if (
      event === 'projects_v2_item' &&
      item?.content_type === 'Issue' &&
      ['created', 'reordered', 'edited'].includes(action)
    ) {
      result = await SyncService(item.content_node_id, item.project_node_id)

      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'handled', message: result }),
      }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          event,
          status: 'ignored',
          action,
        }),
      }
    }
  } catch (err: any) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const context = 'github-webhook'
    const logLines = [
      `❌ Error handling webhook`,
      `Error: ${err?.message}`,
      `Stack: ${err?.stack?.split('\n')[0]}`,
    ]

    await saveLogPage(logLines, timestamp, context)
    await notifySlack(`❌ Webhook sync failed. Error: ${err.message}`)

    console.error('❌ Error while synchronizing:', err?.message, err?.stack)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err?.message ?? 'Unknown error' }),
    }
  }
}

export const main = handler
