export default function TerminosPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white">
      <h1 className="text-3xl font-bold mb-8">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-black">1. Naturaleza del Servicio y Exención de Responsabilidad</h2>
          <p>
            <strong>AgendaClick</strong> opera exclusivamente como una plataforma tecnológica (SaaS - Software as a Service) 
            intermediaria que facilita la programación de citas entre clientes finales y los negocios registrados (clínicas, estéticas, 
            profesionales de salud y bienestar). 
          </p>
          <p className="font-semibold text-red-700">
            En ningún caso AgendaClick presta servicios médicos, estéticos, terapéuticos, ni de bienestar de manera directa. 
            No somos responsables por la calidad, seguridad, legalidad o resultados de los servicios prestados por los negocios 
            registrados en nuestra plataforma. Cualquier negligencia médica, daño físico, psicológico o material sufrido durante o 
            después de una cita agendada a través de nuestro sistema es responsabilidad única y exclusiva del negocio o profesional prestador del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">2. Exención Técnica y Operativa</h2>
          <p>
            AgendaClick se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio será ininterrumpido 
            o libre de errores. No nos hacemos responsables por la pérdida de ingresos, citas perdidas, fallas de comunicación, 
            o errores en la sincronización de horarios. AgendaClick se reserva el derecho de suspender temporal o definitivamente 
            el acceso a la plataforma por mantenimiento, incumplimiento de pagos o violación de estas políticas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">3. Obligaciones de los Negocios (Tenants)</h2>
          <p>
            Los negocios registrados son completamente responsables de la veracidad de la información publicada, licencias médicas o 
            profesionales requeridas por la ley de su país/región, y de cumplir con las normativas locales (incluyendo impuestos). 
            Está estrictamente prohibido usar AgendaClick para agendar servicios ilegales, fraudulentos o engañosos. 
            AgendaClick puede eliminar cualquier cuenta sin previo aviso si se detecta un uso indebido.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">4. Pagos y Suscripciones (Wompi)</h2>
          <p>
            El uso del panel de control por parte de los dueños de negocios está sujeto al pago de una suscripción recurrente a través 
            de la pasarela de pagos Wompi. No procesamos ni almacenamos datos de tarjetas de crédito. En caso de rechazo del pago, la 
            cuenta será pausada hasta la regularización de la deuda. AgendaClick no cobra comisiones directas sobre los servicios prestados al cliente final.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">5. Ausencias y Cancelaciones</h2>
          <p>
            Las políticas de cancelación, devoluciones o cobros por inasistencia (No-Show) son determinadas exclusivamente por cada 
            negocio individual. AgendaClick no media en disputas entre el cliente final y el negocio en relación a dineros pagados o tiempos perdidos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black">6. Aceptación</h2>
          <p>
            Al hacer clic en "Confirmar Reserva" en el portal de cualquier negocio, o al registrarse como dueño de un negocio, 
            el usuario declara haber leído, entendido y aceptado de manera irrevocable estos Términos y Condiciones en su totalidad, 
            renunciando a cualquier reclamación legal contra AgendaClick o sus desarrolladores/propietarios por los conceptos previamente descritos.
          </p>
        </section>
      </div>
    </div>
  )
}
