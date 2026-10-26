import * as crypto from 'crypto'

const CANCEL_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET || 'agendaclick_fallback_secret_key'

// Clave simétrica de 256 bits para cifrado en reposo (AES-256-GCM)
const ENCRYPTION_KEY = crypto.createHash('sha256').update(CANCEL_SECRET).digest()

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

/**
 * Cifra tokens de autenticación sensibles (como google_refresh_token) usando AES-256-GCM.
 * Si el token es nulo o ya está cifrado con formato enc:v1:, se devuelve sin alterar.
 */
export function encryptSensitiveToken(text?: string | null): string | null {
  if (!text) return null
  if (text.startsWith('enc:v1:')) return text

  const iv = crypto.randomBytes(12) // 96-bit IV para GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Descifra tokens sensibles cifrados con AES-256-GCM.
 * Si el token no tiene prefijo enc:v1:, se asume texto plano heredado y se devuelve tal cual.
 */
export function decryptSensitiveToken(ciphertext?: string | null): string | null {
  if (!ciphertext) return null
  if (!ciphertext.startsWith('enc:v1:')) return ciphertext

  try {
    const parts = ciphertext.split(':')
    if (parts.length !== 5) return ciphertext
    const iv = Buffer.from(parts[2], 'hex')
    const authTag = Buffer.from(parts[3], 'hex')
    const encryptedText = parts[4]

    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    console.error('[Security] Error descifrando token sensible:', err)
    return null
  }
}

