'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function GoogleLoginButton({ action }: { action: () => void }) {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={action}
      formNoValidate
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-3 bg-white text-black hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      ) : (
        <img src="https://www.google.com/favicon.ico" alt="Google" width="18" height="18" />
      )}
      <span className="font-medium">{pending ? 'Conectando con Google...' : 'Continuar con Google'}</span>
    </button>
  )
}
