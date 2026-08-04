'use server'

import * as crypto from 'crypto'

export async function generateWompiSignature(reference: string, amountInCents: number, currency: string = 'COP') {
  try {
    const secret = process.env.WOMPI_INTEGRITY_SECRET
    if (!secret) {
      return { error: true, message: 'La llave WOMPI_INTEGRITY_SECRET no está configurada en las variables de entorno de Vercel.' }
    }

    // Fórmula Wompi: concat(reference, amountInCents, currency, secret)
    const cadena = `${reference}${amountInCents}${currency}${secret}`
    
    // SHA-256 hex
    const hash = crypto.createHash('sha256').update(cadena).digest('hex')
    return { success: true, hash }
  } catch (error: any) {
    console.error('Error in generateWompiSignature:', error)
    return { error: true, message: error.message || 'Error generando la firma de integridad de Wompi.' }
  }
}
