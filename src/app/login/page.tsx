import { login, signup, loginWithGoogle } from './actions'
import { GoogleLoginButton } from './GoogleLoginButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string, invite?: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-white text-black px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-black">
        <img src="/full-logo.png" alt="AgendaClick Logo" className="h-20 mx-auto mb-8 object-contain" />
        
        {/* Hidden field to pass the invite ID if present */}
        {params?.invite && (
          <input type="hidden" name="invite" value={params.invite} />
        )}
        
        <label className="text-md" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          className="rounded-md px-4 py-2 bg-white border border-gray-300 text-black mb-6 focus:outline-none focus:ring-2 focus:ring-black"
          name="email"
          placeholder="tu@estetica.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Contraseña
        </label>
        <input
          className="rounded-md px-4 py-2 bg-white border border-gray-300 text-black mb-6 focus:outline-none focus:ring-2 focus:ring-black"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-black text-white rounded-md px-4 py-2 mb-2"
        >
          Iniciar Sesión
        </button>
        <button
          formAction={signup}
          className="border border-gray-300 rounded-md px-4 py-2 mb-4 hover:bg-gray-50 text-black transition-colors"
        >
          Crear cuenta con correo
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">O continúa con</span>
          </div>
        </div>

        <GoogleLoginButton action={loginWithGoogle} />

        {params?.message && (
          <p className="mt-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-center text-sm font-medium">
            {params.message}
          </p>
        )}
      </form>
    </div>
  )
}
