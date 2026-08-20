export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white font-sans text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-black">Políticas de Privacidad de AgendaClick</h1>
      <p className="text-sm text-gray-500 mb-8">Última actualización: 20 de agosto de 2026</p>
      
      <div className="prose prose-sm text-gray-700 space-y-8 leading-relaxed">
        
        {/* SECCIÓN 1 */}
        <section>
          <h2 className="text-xl font-semibold text-black mb-3">1. Tratamiento de Datos Personales</h2>
          <p>
            En <strong>AgendaClick</strong> (https://www.agendaclick.com.co) valoramos la privacidad de nuestros usuarios y clientes. Los datos personales recolectados (como nombre, correo electrónico y número de teléfono) se utilizan estrictamente para procesar las reservas de citas, gestionar la agenda de los profesionales y enviar confirmaciones o notificaciones sobre el servicio.
          </p>
          <p className="mt-2">
            AgendaClick no vende, alquila, comercializa ni distribuye la información personal de los usuarios a terceros externos no relacionados con la prestación del servicio.
          </p>
        </section>

        {/* SECCIÓN 2 - GOOGLE USER DATA */}
        <section className="bg-blue-50/60 border border-blue-100 p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-blue-950">2. Uso, Retención y Eliminación de Datos del Usuario de Google (Google API User Data)</h2>
          <p className="text-sm text-blue-900">
            AgendaClick se integra opcionalmente con la API de Google Calendar (utilizando los alcances de autorización <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">calendar.events</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">userinfo.email</code> y <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">userinfo.profile</code>) para permitir la sincronización bidireccional de citas entre nuestra plataforma y el calendario del usuario.
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-semibold text-blue-950">2.1. Retención de Datos de Google (Data Retention)</h3>
            <p className="text-sm text-blue-900">
              Los datos obtenidos a través de la integración de Google (tales como tokens de acceso, identificadores de eventos de calendario y dirección de correo electrónico vinculada) se conservan <strong>única y exclusivamente mientras la cuenta del usuario permanezca activa en AgendaClick y conectada al servicio de Google Calendar</strong>. No almacenamos copias permanentes del historial completo de calendarios personales ni de eventos ajenos a las reservas procesadas por nuestra plataforma.
            </p>

            <h3 className="text-base font-semibold text-blue-950 pt-2">2.2. Eliminación y Revocación de Datos del Usuario (Data Deletion)</h3>
            <p className="text-sm text-blue-900">
              Los usuarios tienen control total sobre sus datos de Google y pueden solicitar o realizar su eliminación definitiva mediante cualquiera de los siguientes métodos:
            </p>
            <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
              <li>
                <strong>Desconexión instantánea desde la aplicación:</strong> El usuario puede ingresar a su panel de administración en <em>Dashboard &gt; Editar Perfil</em> y hacer clic en el botón <strong>"Desconectar Cuenta"</strong> de Google Calendar. Esto borra inmediatamente los tokens de acceso y actualización de Google de nuestras bases de datos.
              </li>
              <li>
                <strong>Revocación desde la cuenta de Google:</strong> El usuario puede revocar el acceso de AgendaClick en cualquier momento directamente desde la configuración de seguridad de su cuenta de Google en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-700">myaccount.google.com/permissions</a>.
              </li>
              <li>
                <strong>Eliminación de la cuenta de AgendaClick:</strong> Si el usuario elimina o solicita la cancelación de su cuenta en AgendaClick, todos sus tokens de acceso y registros asociados de la API de Google serán eliminados de forma permanente de nuestros servidores.
              </li>
              <li>
                <strong>Solicitud de borrado por soporte:</strong> El usuario puede solicitar el borrado manual de cualquier dato de usuario de Google enviando un correo electrónico a soporte en <a href="mailto:j4150nrodriguez@gmail.com" className="underline font-semibold hover:text-blue-700">j4150nrodriguez@gmail.com</a>. Las solicitudes se procesan y completan en un plazo máximo de 48 horas.
              </li>
            </ul>

            <h3 className="text-base font-semibold text-blue-950 pt-2">2.3. Cumplimiento de la Política de Uso Limitado (Google API Limited Use Disclosure)</h3>
            <p className="text-sm text-blue-900">
              El uso y la transferencia por parte de AgendaClick a cualquier otra aplicación de la información recibida a través de las API de Google se realizarán de estricta conformidad con la <a href="https://developers.google.com/identity/protocols/oauth2/policies#limited-unofficial-tokens" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-700">Política de datos del usuario de los servicios de las API de Google</a>, incluidos los requisitos de Uso Limitado (Limited Use Requirements).
            </p>
          </div>
        </section>

        {/* SECCIÓN 3 */}
        <section>
          <h2 className="text-xl font-semibold text-black mb-3">3. Seguridad de la Información</h2>
          <p>
            Toda la información transmitida entre el usuario y la plataforma viaja cifrada mediante protocolos de seguridad HTTPS/TLS y es almacenada en infraestructura de bases de datos de alta seguridad con políticas de aislamiento por usuario (Row Level Security en Supabase).
          </p>
        </section>

        {/* SECCIÓN 4 */}
        <section>
          <h2 className="text-xl font-semibold text-black mb-3">4. Contacto de Soporte y Privacidad</h2>
          <p>
            Si tienes dudas, preguntas sobre estas políticas o deseas ejercer tus derechos de acceso, rectificación o cancelación de datos, puedes comunicarte con nuestro equipo de soporte:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Correo electrónico:</strong> j4150nrodriguez@gmail.com</li>
            <li><strong>Sitio Web:</strong> <a href="https://www.agendaclick.com.co" className="underline hover:text-black">https://www.agendaclick.com.co</a></li>
          </ul>
        </section>

      </div>
    </div>
  )
}
