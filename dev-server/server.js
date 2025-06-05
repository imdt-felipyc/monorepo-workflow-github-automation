import Fastify from 'fastify'
import fastifyRawBody from 'fastify-raw-body'
import {main as githubWebhook} from '../packages/github-sync/github-webhook/index.js'

const fastify = Fastify({
  logger: false,
})

// Register support for rawBody
await fastify.register(fastifyRawBody, {
  field: 'rawBody',
  global: false,
  encoding: 'utf8',
  runFirst: true
})

// Webhook route
fastify.route({
  method: 'POST',
  url: '/webhook',
  config: {
    rawBody: true
  },
  handler: async (req, reply) => {
    
    // Format the request to match the expected format
    // https://docs.digitalocean.com/products/functions/reference/parameters-responses/
    
    let argsForServerlessFunction = {
      http: {
        body: req.rawBody,
        headers: {
          ...req.headers,
        },
        "isBase64Encoded": '',
        method: req.method,
        "path": '',
        "queryString": ''
      },
    }

    await githubWebhook(argsForServerlessFunction)

    return reply.send({ status: 'ok' })
  }
})

// Start server
try {
  await fastify.listen({ port: 3000 })
  console.log('🚀 Fastify webhook server running at http://localhost:3000/webhook')
} catch (err) {
  console.log(err)
  process.exit(1)
}
