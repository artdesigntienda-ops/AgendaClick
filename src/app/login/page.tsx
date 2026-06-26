import { login, signup, loginWithGoogle } from './actions'
import { GoogleLoginButton } from './GoogleLoginButton'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string, invite?: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <img src="/full-logo.png" alt="AgendaClick Logo" className="h-12 mx-auto mb-6 object-contain" />
        
        {/* Hidden field to pass the invite ID if present */}
        {searchParams?.invite && (
          <input type="hidden" name="invite" value={searchParams.invite} />
        )}
        
        <label className="text-md" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="tu@estetica.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Contraseña
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
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
          className="border border-foreground/20 rounded-md px-4 py-2 mb-4 hover:bg-gray-50 transition-colors"
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

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
