import crypto from 'crypto'

export function verifySignature(secret, rawBody, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const signatureHex = signature.replace(/^sha256=/, '')

  const digestBuffer = Buffer.from(expectedSignature, 'hex')
  const signatureBuffer = Buffer.from(signatureHex, 'hex')

  const isValid = digestBuffer.length === signatureBuffer.length &&
                  crypto.timingSafeEqual(digestBuffer, signatureBuffer)

  return isValid
}
