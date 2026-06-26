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
      className="p-2 border rounded-md hover:bg-gray-50 transition-colors bg-white text-gray-700"
      title="Copiar enlace"
    >
      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
    </button>
  )
}
