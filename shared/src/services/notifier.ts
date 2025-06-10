import { env } from '../env.js'

export async function notifySlack(message, context = 'Serverless') {
  const webhookUrl = env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    throw new Error('⚠️ SLACK_WEBHOOK_URL not set. Cannot send Slack alert.')
  }

  const payload = {
    text: `🚨 *${context}*\n${message}`,
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new Error(`❌ Failed to send Slack notification: ${err.message}`)
  }
}
