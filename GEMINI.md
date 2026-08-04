# AgendaClick - Información y Estado del Proyecto para Modelos de IA (GEMINI.md)

Este archivo sirve como la fuente única de verdad para que cualquier modelo de Inteligencia Artificial (como Gemini) entienda la arquitectura, configuración, credenciales y el estado actual del desarrollo de **AgendaClick**.

---

## 📋 Información General del Negocio
*   **Dueño/Administrador principal:** Dr. Jaison Rodríguez (`j4150nrodriguez@gmail.com`)
*   **Dominio en Vercel:** [agendaclick.vercel.app](https://agendaclick.vercel.app/)
*   **Repositorio GitHub:** `github.com/artdesigntienda-ops/AgendaClick`

---

## 🛠️ Arquitectura y Tecnologías
1.  **Frontend/Backend:** Next.js (App Router, Versión 16+ con Turbopack y compilación asíncrona de `params` en rutas dinámicas).
2.  **Base de Datos:** Supabase (PostgreSQL).
3.  **Estilos:** Tailwind CSS con diseño responsivo premium.
4.  **Autenticación:** Supabase Auth + Google Login.

---

## 📧 Configuración de Correo Electrónico (Brevo SMTP)
Para el envío de códigos de verificación OTP y confirmaciones de citas, el sistema utiliza **Brevo** en lugar de Gmail (Gmail bloquea conexiones desde servidores de Vercel por geolocalización).
*   **SMTP_HOST:** `smtp-relay.brevo.com`
*   **SMTP_PORT:** `587`
*   **SMTP_SECURE:** `false` (usa STARTTLS sobre el puerto 587)
*   **SMTP_USER:** `b4638b001@smtp-brevo.com`
*   **SMTP_PASS:** `[REDACTADA - Clave de Brevo (Guardada de forma segura en Vercel)]`
*   **SMTP_FROM:** `agendaclickcolombia@gmail.com` *(Remitente único verificado en Brevo)*

---

## 📅 Sincronización con Google Calendar
El sistema cuenta con sincronización en tiempo real para agendar y cancelar citas automáticamente en el calendario de Google del dueño del negocio.
*   **Nombre del sub-calendario creado:** `AgendaClick - Trabajo` (se crea solo al vincular la cuenta).
*   **Ruta de Autorización:** `/api/calendar/auth` -> redirige a la pantalla de consentimiento de Google.
*   **Ruta de Callback:** `/api/calendar/callback` -> captura el `refresh_token` y crea el sub-calendario.
*   **Variables requeridas en Vercel:**
    *   `GOOGLE_CLIENT_ID` (OAuth 2.0 Web Application Client ID)
    *   `GOOGLE_CLIENT_SECRET` (OAuth 2.0 Web Application Client Secret)
*   **Redirect URI de Google Console:** `https://agendaclick.vercel.app/api/calendar/callback`

---

## 💳 Pasarela de Pagos (Wompi)
*   **Suscripciones del Negocio (Dashboard):** 
    *   Integrado mediante **Wompi** en [`BillingClient.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/billing/BillingClient.tsx) para que el dueño compre o actualice su plan (Independiente, Boutique, Salón, Élite) de forma mensual o anual (con 10% de descuento).
    *   Soporta **Upgrades Prorrateados:** Al mejorar el plan mid-ciclo, se calcula su saldo a favor por los días restantes y se resta del total a pagar hoy, reiniciando su ciclo a 30 o 365 días a partir del pago.
*   **Pago de Citas por el Cliente Final:**
    *   **Estado actual:** Para garantizar la seguridad de las credenciales de los negocios, **no se permite que el cliente agregue llaves API directamente**.
    *   En su lugar, en [`SettingsForm.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/settings/SettingsForm.tsx) se añadió una tarjeta de cobros online con un botón de **Contacto con Soporte** vía WhatsApp que redirige a Nexora Digital (`+57 323 9306599`) para que Jaison gestione la integración directamente de forma 100% segura.

---

## 🔄 Cambios Recientes Importantes (4 de Agosto de 2026)
1.  **Migración SMTP:** Se integró Brevo SMTP para los correos transaccionales y de verificación OTP.
2.  **Responsividad de Facturación:** Se cambió el contenedor a `max-w-7xl` y la cuadrícula a `md:grid-cols-2 lg:grid-cols-4`.
3.  **Cancelación Autónoma de Citas:** Se creó la ruta `/cancelar/[appointmentId]`, el enlace en el correo de confirmación, la lógica en Supabase y la auto-limpieza del evento de Google Calendar.
4.  **Actualización de Llaves Wompi:** Se integraron las nuevas credenciales de producción provistas en el archivo `.env.local`.
5.  **Facturación Anual y Prorrateo:** Se agregó toggle selector de facturación mensual/anual con un 10% de descuento, junto al recálculo y desglose detallado de saldo a favor de plan anterior.
6.  **Actualizaciones de Webhook:** El endpoint `/api/webhooks/wompi` ahora procesa referencias del tipo `SUB_[clinicId]_[planId]_[billingPeriod]_[timestamp]` para calcular y establecer correctamente `plan_type` y `subscription_ends_at` (sumando 30 días para mensual y 365 días para anual).

