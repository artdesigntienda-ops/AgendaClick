export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white">
      <h1 className="text-3xl font-bold mb-8">Políticas de Privacidad</h1>
      <p className="text-sm text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-black">1. Tratamiento de Datos</h2>
          <p>
            En **AgendaClick** valoramos tu privacidad. Los datos recolectados (Nombre, Correo y Teléfono) se utilizan 
            estrictamente con el fin de procesar el agendamiento y notificar a la clínica/profesional que prestará el servicio.
          </p>
          <p>
            Al agendar una cita, entiendes y aceptas que tu información personal será transferida al dueño del negocio 
            correspondiente para que pueda contactarte y brindarte el servicio solicitado. AgendaClick no vende, alquila ni 
            distribuye tu información a terceros externos a esta relación comercial.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">2. Seguridad</h2>
          <p>
            Toda la información viaja cifrada y es almacenada en servidores seguros (Supabase). Sin embargo, ninguna 
            plataforma en internet es 100% invulnerable. No nos hacemos responsables por filtraciones masivas originadas por 
            ataques maliciosos (hackeos) de fuerza mayor, aunque implementamos las mejores medidas de la industria.
          </p>
        </section>
      </div>
    </div>
  )
}
