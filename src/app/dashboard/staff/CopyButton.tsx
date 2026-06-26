'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-3 bg-white text-black hover:bg-gray-200 transition-colors font-medium text-sm flex items-center gap-2"
      title="Copiar enlace"
    >
      {copied ? <Check className="w-5 h-5 text-black" /> : <Copy className="w-5 h-5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}
