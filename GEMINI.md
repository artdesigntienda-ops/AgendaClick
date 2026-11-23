# AgendaClick - Información y Estado del Proyecto para Modelos de IA (GEMINI.md)

Este archivo sirve como la fuente única de verdad para que cualquier modelo de Inteligencia Artificial (como Gemini) entienda la arquitectura, configuración, credenciales y el estado actual del desarrollo de **AgendaClick**.

---

## ⚙️ INSTRUCCIONES CRÍTICAS PARA EL AGENTE

### Acceso directo a Supabase (NO pedir SQL al usuario)
Cuando necesites consultar o modificar datos en Supabase, **hazlo automáticamente** usando Node.js con el cliente de Supabase y la service role key del archivo `.env.local`. Ejemplo:

Lee las credenciales del archivo `.env.local` del proyecto. Ejemplo:

```javascript
// Ejecutar desde la raíz del proyecto con: node script.js
const{createClient}=require('@supabase/supabase-js');
// Las credenciales están en .env.local (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
const s=createClient('URL_DE_ENV_LOCAL', 'SERVICE_ROLE_KEY_DE_ENV_LOCAL');
s.from('appointments').select('*').then(r=>console.log(JSON.stringify(r.data,null,2)))
"
```

**NUNCA** le pidas al usuario que copie SQL en Supabase. Siempre ejecuta los scripts directamente desde la terminal.

### Deploy automático
Después de hacer cambios, haz commit y push automáticamente:
```powershell
git add "ruta/archivo"; git commit -m "descripción"; git push
```
El proyecto tiene CI/CD con Vercel — cada push a `main` despliega automáticamente.

### Verificación de API keys
Para probar la API de Resend, usa la `RESEND_API_KEY` del `.env.local`:
```powershell
# Reemplaza <RESEND_API_KEY> con el valor de .env.local
Invoke-RestMethod -Uri "https://api.resend.com/domains" -Headers @{ "Authorization" = "Bearer <RESEND_API_KEY>" } -Method Get
```

---

## 📋 Información General del Negocio
*   **Dueño/Administrador principal:** Dr. Jaison Rodríguez
*   **Correo Corporativo / Institucional:** `jrodriguez0639@soy.sena.edu.co`
*   **Correo Personal Principal:** `jaisonrodriguez@gmail.com`
*   **Correo Alternativo:** `j4150nrodriguez@gmail.com`
*   **Dominio principal:** [agendaclick.com.co](https://www.agendaclick.com.co/)
*   **Dominio Vercel:** [agendaclick.vercel.app](https://agendaclick.vercel.app/)
*   **Repositorio GitHub:** `github.com/artdesigntienda-ops/AgendaClick`

---

## 🚀 Tareas Pendientes y Roadmap Futuro
* [x] **Asistente Automatizado de Alta en Google Maps (Google Business Profile):** Integrado en QuickSetupWizard, SetupProgressBar y SettingsForm para que los negocios publiquen su local en Google Maps con datos pre-rellenados y botón de reservas en 1-clic.
* [ ] **Sincronización de Reseñas de Google:** Posibilidad futura de leer y mostrar reseñas de Google en la página pública del negocio.

---

## 🛠️ Arquitectura y Tecnologías
1.  **Frontend/Backend:** Next.js (App Router, Versión 16+ con Turbopack y compilación asíncrona de `params` en rutas dinámicas).
2.  **Base de Datos:** Supabase (PostgreSQL) con Row Level Security (RLS).
3.  **Estilos:** Tailwind CSS con diseño responsivo premium.
4.  **Autenticación:** Supabase Auth + Google Login.
5.  **Correo electrónico:** Resend API (SDK) con dominio verificado `agendaclick.com.co`.

---

## 📧 Configuración de Correo Electrónico (Resend API)
El sistema usa la **API de Resend** (no SMTP) para enviar correos. Esto incluye:
- Códigos de verificación OTP
- Confirmaciones de citas (al dueño y al cliente)
- Notificaciones de cancelación
- Recordatorios de suscripción (cron job)

**Configuración:**
*   **RESEND_API_KEY:** Guardada en `.env.local` y en Vercel Environment Variables.
*   **Dominio verificado:** `agendaclick.com.co` (status: verified)
*   **From address:** `no-reply@agendaclick.com.co`
*   **SDK:** `resend` v6.16+ (ya instalado en package.json)

**IMPORTANTE:** NO usar nodemailer/SMTP. La autenticación SMTP falla en Vercel. Siempre usar `import { Resend } from 'resend'` y `resend.emails.send()`.

---

## 🔒 Supabase - Notas sobre RLS (Row Level Security)
- Las operaciones públicas (booking de clientes, OTP) deben usar `getSupabaseAdmin()` o `createAdminClient()` para saltar RLS.
- El dashboard usa `createAdminClient()` para consultar appointments y staff.
- La seguridad se garantiza por la validación OTP (para clientes) y la sesión autenticada (para el dashboard).
- **Service Role Key:** En `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`.

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
    *   Integrado mediante **Wompi** en [`BillingClient.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/billing/BillingClient.tsx) para que el dueño compre o actualice su plan de forma mensual o anual (con 10% de descuento).
    *   Soporta **Upgrades Prorrateados:** Al mejorar el plan mid-ciclo, se calcula su saldo a favor por los días restantes y se resta del total a pagar hoy, reiniciando su ciclo a 30 o 365 días a partir del pago.
*   **Pago de Citas por el Cliente Final:**
    *   **Estado actual:** Para garantizar la seguridad de las credenciales de los negocios, **no se permite que el cliente agregue llaves API directamente**.
    *   En su lugar, en [`SettingsForm.tsx`](file:///E:/Proyectos%20progrmacion/AgendaClick/src/app/dashboard/settings/SettingsForm.tsx) se añadió una tarjeta de cobros online con un botón de **Contacto con Soporte** vía WhatsApp que redirige a Nexora Digital (`+57 323 9306599`) para que Jaison gestione la integración directamente de forma 100% segura.

---

## 🔄 Nombres y Precios de los Planes (Estrategia 50% de Booksy)
Planes genéricos aplicables a todo el mercado de reservas posicionados al 50% de la tarifa internacional de Booksy:
1.  **Independiente** (1 Profesional) - $59,000 COP/mes.
2.  **Profesional** *(Antes Boutique)* (Hasta 4 Profesionales) - $189,000 COP/mes.
3.  **Negocio** *(Antes Salón)* (Hasta 8 Profesionales) - $349,000 COP/mes — **Destacado como el más recomendado (🚀 MEJOR VALOR)**.
4.  **Élite** (Ilimitados 999+) - $499,000 COP/mes.

---

## 🔄 Cambios Recientes Importantes

### 23 de Noviembre de 2026 (Auditoría EGM & Mejoras 100% Gratuitas)
1. **Asistente Oficial de Alta en Google Maps:**
   - Creado `GoogleMapsOnboardingModal.tsx` integrado en `QuickSetupWizard` (paso final de onboarding), `SetupProgressBar` (paso 5 de la barra de configuración rápida) y `SettingsForm` (pestaña Integraciones).
   - Pre-configura deep-links directos a Google Business Profile con el nombre comercial, teléfono, dirección y mapeo automático de categorías oficiales de Google según el tipo de negocio.
   - Guía interactiva paso a paso para la verificación por SMS o video de Google, e inyección de la URL de reservas en 1-clic en el botón oficial "Reservar cita" de Google Maps.
2. **Reagendamiento Autónomo de Citas (Self-Service Rescheduling):**
   - Implementado en `src/app/cancelar/[appointmentId]` y `src/app/[slug]/actions.ts`. Permite a los clientes elegir una nueva fecha y franja horaria disponible en un calendario de 14 días sin cancelar ni molestar al dueño. Sincroniza y actualiza automáticamente Google Calendar y Supabase.
3. **PWA Standalone (Instalable como App en Celular y PC):**
   - Configurado `manifest.ts`, `sw.js` (Service Worker offline-first), `PwaRegister.tsx` y banner flotante no intrusivo `PwaInstallPrompt.tsx` con soporte para Android, iOS y Desktop.
4. **CRM de Reactivación por WhatsApp (100% Gratis sin APIs de Pago):**
   - Añadido botón interactivo `wa.me` en `src/app/dashboard/clients/ClientsTable.tsx` que detecta clientes en riesgo (45-90 días sin cita) o perdidos (>90 días) y genera enlaces directos con mensajes de reactivación personalizados.
5. **Caché de Sesión de Dashboard con `React.cache()`:**
   - Creado `src/utils/dashboardSession.ts` eliminando entre 4 y 6 consultas redundantes a Supabase en cada carga de página en el App Router.
6. **Correcciones Críticas EGM (Wompi, Double-Booking, Cron y Google Calendar):**
   - Wompi webhook: Corrección de time-drift en PSE usando el timestamp de la referencia y matemática acumulativa de renovación.
   - Restricción de exclusión PostgreSQL anti double-booking (`btree_gist`) en `migrations_exclusion_constraint.sql`.
   - Google Calendar: Manejo de desvinculación limpia de eventos por ID de staff al cancelar.
   - Cron reminders: Validación obligatoria de Bearer token `CRON_SECRET`.
   - Consulta O(N) eliminada en la página de reservas pública (`.gte('end_time', nowIso)`).

### 8 de Agosto de 2026
1.  **Migración de SMTP a Resend API:** Se reemplazó `nodemailer` (SMTP) por el SDK de `Resend` en `src/app/[slug]/actions.ts` para enviar OTP, confirmaciones y cancelaciones. SMTP fallaba con error `535 5.7.8 Authentication failed` en Vercel.
2.  **Fix RLS en INSERT de appointments:** Se cambió a `getSupabaseAdmin()` para insertar citas desde el flujo público de booking, ya que RLS bloqueaba el insert con el cliente de sesión.
3.  **Fix RLS en SELECT del dashboard:** Se cambió a `createAdminClient()` para consultar appointments y staff en el dashboard, resolviendo que las citas no aparecieran.

### 4 de Agosto de 2026
1.  **Cancelación Autónoma de Citas:** Se creó la ruta `/cancelar/[appointmentId]`, el enlace en el correo de confirmación, la lógica en Supabase y la auto-limpieza del evento de Google Calendar.
2.  **Actualización de Llaves Wompi:** Se integraron las nuevas credenciales de producción provistas en el archivo `.env.local`.
3.  **Facturación Anual y Prorrateo:** Se agregó toggle selector de facturación mensual/anual con un 10% de descuento, junto al recálculo y desglose detallado de saldo a favor del plan anterior.
4.  **Actualizaciones de Webhook:** El endpoint `/api/webhooks/wompi` ahora procesa referencias del tipo `SUB_[clinicId]_[planId]_[billingPeriod]_[timestamp]` para calcular y establecer correctamente `plan_type` y `subscription_ends_at`.
