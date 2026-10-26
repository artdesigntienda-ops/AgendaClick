import * as crypto from 'crypto'

const CANCEL_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET || 'agendaclick_fallback_secret_key'

export function generateCancellationHash(appointmentId: string, clientEmail: string): string {
  const normalizedEmail = (clientEmail || '').trim().toLowerCase()
  return crypto
    .createHmac('sha256', CANCEL_SECRET)
    .update(`${appointmentId}:${normalizedEmail}`)
    .digest('hex')
}

export function verifyCancellationHash(appointmentId: string, clientEmail: string, receivedToken?: string): boolean {
  if (!receivedToken || typeof receivedToken !== 'string') return false
  const expectedHash = generateCancellationHash(appointmentId, clientEmail)
  
  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const receivedBuffer = Buffer.from(receivedToken, 'hex')

  if (expectedBuffer.length !== receivedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}
