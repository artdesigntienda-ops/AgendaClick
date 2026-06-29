'use server'

import * as crypto from 'crypto'

export async function generateWompiSignature(reference: string, amountInCents: number, currency: string = 'COP') {
  const secret = process.env.WOMPI_INTEGRITY_SECRET
  if (!secret) {
    throw new Error('La llave WOMPI_INTEGRITY_SECRET no está cargada en el servidor. ¡Reinicia tu servidor de Next.js!')
  }

  // Fórmula Wompi: concat(reference, amountInCents, currency, secret)
  const cadena = `${reference}${amountInCents}${currency}${secret}`
  
  // SHA-256 hex
  const hash = crypto.createHash('sha256').update(cadena).digest('hex')
  return hash
}
