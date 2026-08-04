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
    *   Integrado mediante **Wompi** en [`BillingClient.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/billing/BillingClient.tsx) para que el dueño compre o actualice su plan (Independiente, Boutique, Salón, Élite).
*   **Pago de Citas por el Cliente Final:**
    *   **Estado actual:** **NO IMPLEMENTADO**. Actualmente el cliente final no realiza ningún pago al reservar. La cita se agenda directamente con el estado `'pending'`.
    *   **Cómo implementarlo a futuro:**
        1.  Añadir en el formulario de configuración del administrador (ajustes) campos para que el dueño del negocio guarde sus propias llaves públicas/privadas de Wompi, MercadoPago o ePayco.
        2.  Añadir un paso adicional de pago en la pasarela de reservas del cliente final ([`BookingClient.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/[slug]/BookingClient.tsx)), de manera que tras verificar el OTP del correo, el cliente deba completar la transacción para que el estado de la cita pase de `'pending'` a `'confirmed'` o `'paid'`.

---

## 🔄 Cambios Recientes Importantes (4 de Agosto de 2026)
1.  **Migración SMTP:** Se removió la librería Resend y se integró **Nodemailer** parametrizado con variables de entorno genéricas. Se configuró Brevo SMTP con remitente verificado para asegurar la entrega de correos a cualquier destinatario de forma gratuita.
2.  **Responsividad de Facturación:** Se amplió la envoltura en [`page.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/billing/page.tsx) a `max-w-7xl` y se ajustó el grid en [`BillingClient.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/billing/BillingClient.tsx) a `md:grid-cols-2 lg:grid-cols-4` para optimizar la visualización de los planes de suscripción.
3.  **Cancelación Autónoma de Citas:**
    *   Se añadió un enlace de cancelación personalizado en el correo de confirmación de los clientes: `/cancelar/[appointmentId]`.
    *   Se creó la página de cancelación [`src/app/cancelar/[appointmentId]/page.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/cancelar/%5BappointmentId%5D/page.tsx) que permite confirmar la cancelación de forma autónoma.
    *   Se programó la Server Action `cancelAppointmentFromClient` en [`actions.ts`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/%5Bslug%5D/actions.ts) que marca la cita como cancelada en Supabase, envía correos de notificación al cliente y al dueño, y busca/elimina automáticamente el evento del Google Calendar del dueño si tiene la integración activa.
