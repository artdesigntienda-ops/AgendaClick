#!/usr/bin/env python3
import os
import subprocess
import tempfile

EXPLICACION_DIR = "/home/rocua/Proyectos/AgendaClick/public/promos/explicacion"
SOCIOS_DIR = "/home/rocua/Proyectos/AgendaClick/public/promos/socios"
os.makedirs(EXPLICACION_DIR, exist_ok=True)
os.makedirs(SOCIOS_DIR, exist_ok=True)

# Common SVG icons
CALENDAR_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>"""
CHECK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>"""
CROSS_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>"""
CLOCK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>"""
PHONE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>"""
MAP_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>"""
SYNC_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>"""
SPARKLE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>"""
WHATSAPP_ICON = """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>"""

COMMON_HEAD = """
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #030712;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }
    .glow-emerald {
      position: absolute;
      width: 750px;
      height: 750px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%);
      pointer-events: none;
    }
    .glow-cyan {
      position: absolute;
      width: 650px;
      height: 650px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, rgba(6, 182, 212, 0) 70%);
      pointer-events: none;
    }
    .card-glass {
      background: rgba(15, 23, 42, 0.78);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 30px;
      backdrop-filter: blur(20px);
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px 26px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #10b981 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
</head>
"""

def make_footer(cta_btn_text="14 Días Gratis →", url_text="www.agendaclick.com.co"):
    return f"""
    <!-- FOOTER CON WHATSAPP Y ENLACE -->
    <div style="border-top: 1.5px solid rgba(255, 255, 255, 0.15); padding-top: 26px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          {WHATSAPP_ICON}
          <span style="font-size: 26px; font-weight: 800; color: #ffffff;">WhatsApp: <strong style="color: #34d399;">+57 323 9306599</strong></span>
        </div>
        <p style="font-size: 34px; font-weight: 900; color: #38bdf8; letter-spacing: -0.5px;">{url_text}</p>
      </div>
      <div style="background: #10b981; color: #000000; font-size: 24px; font-weight: 900; padding: 22px 42px; border-radius: 9999px; box-shadow: 0 0 40px rgba(16,185,129,0.5);">
        {cta_btn_text}
      </div>
    </div>
    """

# ==========================================
# FLYER 1: ¿CÓMO FUNCIONA AGENDACLICK?
# ==========================================
HTML_FLYER_1 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="top: -100px; right: -150px;"></div>
  <div class="glow-cyan" style="bottom: 250px; left: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill">
          {SPARKLE_SVG}
          Software de Citas 24/7
        </div>
      </div>

      <h1 style="font-size: 60px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 16px;">
        ¿CÓMO FUNCIONA <br><span class="gradient-text">AGENDACLICK?</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4; max-width: 950px;">
        Tu negocio disponible para recibir citas los 7 días de la semana, 100% en automático y sin atender llamadas.
      </p>
    </div>

    <!-- 3 PASOS EN CARDS -->
    <div style="display: flex; flex-direction: column; gap: 28px;">
      
      <!-- PASO 1 -->
      <div class="card-glass" style="padding: 38px 42px; border-left: 8px solid #10b981; display: flex; align-items: center; gap: 32px;">
        <div style="min-width: 80px; height: 80px; border-radius: 24px; background: rgba(16, 185, 129, 0.2); border: 2.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: #10b981;">
          1
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px;">
            <h3 style="font-size: 32px; font-weight: 800; color: #ffffff;">Tu Cliente Abre Tu Enlace</h3>
            <span style="background: rgba(16,185,129,0.18); color: #34d399; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 8px;">Sin apps que descargar</span>
          </div>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            Le envías tu link propio <strong style="color: #38bdf8; font-family: monospace;">agendaclick.com.co/tunegocio</strong> por WhatsApp o Instagram. El cliente entra directo desde cualquier celular.
          </p>
        </div>
      </div>

      <!-- PASO 2 -->
      <div class="card-glass" style="padding: 38px 42px; border-left: 8px solid #06b6d4; display: flex; align-items: center; gap: 32px;">
        <div style="min-width: 80px; height: 80px; border-radius: 24px; background: rgba(6, 182, 212, 0.2); border: 2.5px solid #06b6d4; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: #06b6d4;">
          2
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px;">
            <h3 style="font-size: 32px; font-weight: 800; color: #ffffff;">Elige Servicio, Barbero y Hora</h3>
            <span style="background: rgba(6,182,212,0.18); color: #38bdf8; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 8px;">En 30 segundos</span>
          </div>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            El cliente ve tus servicios con precio, fotos, el profesional que lo atenderá y el calendario con las horas disponibles en tiempo real.
          </p>
        </div>
      </div>

      <!-- PASO 3 -->
      <div class="card-glass" style="padding: 38px 42px; border-left: 8px solid #a855f7; display: flex; align-items: center; gap: 32px;">
        <div style="min-width: 80px; height: 80px; border-radius: 24px; background: rgba(168, 85, 247, 0.2); border: 2.5px solid #a855f7; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: #a855f7;">
          3
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px;">
            <h3 style="font-size: 32px; font-weight: 800; color: #ffffff;">¡Cita Confirmada al Instante!</h3>
            <span style="background: rgba(168,85,247,0.18); color: #c084fc; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 8px;">100% Automático</span>
          </div>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            La cita entra automáticamente al <strong style="color: #ffffff;">Google Calendar</strong> en tu celular y al cliente le llega su confirmación con botón de reagendamiento.
          </p>
        </div>
      </div>

    </div>

    <!-- MOCKUP VISUAL DE CONFIRMACIÓN DE CITA -->
    <div style="background: rgba(16, 185, 129, 0.08); border: 2px dashed rgba(16, 185, 129, 0.4); border-radius: 28px; padding: 34px 42px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-size: 18px; font-weight: 800; text-transform: uppercase; color: #34d399; letter-spacing: 1px;">
          ✓ Notificación en Tiempo Real
        </span>
        <span style="background: #10b981; color: #000; font-size: 14px; font-weight: 900; padding: 4px 12px; border-radius: 6px;">
          SIN ERRORES
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">Nueva Cita Reservada • Corte & Barba</p>
          <p style="font-size: 20px; color: #94a3b8;">Cliente: Camilo Soto • Hoy 4:00 PM • Barbero: Andrés</p>
        </div>
        <div style="font-size: 48px;">📲</div>
      </div>
    </div>

    <!-- SECTORES DESTACADOS -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 24px 34px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <p style="font-size: 16px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Para Todo Tipo de Negocios en Colombia</p>
        <p style="font-size: 22px; font-weight: 700; color: #ffffff;">Barberías • Peluquerías • Canchas • Consultorios • Spas • Talleres</p>
      </div>
      <div style="font-size: 38px;">⚡</div>
    </div>

    {make_footer("14 Días Gratis →", "www.agendaclick.com.co")}

  </div>
</body>
</html>
"""

# ==========================================
# FLYER 2: ANTES VS DESPUÉS (DOLOR VS SOLUCIÓN)
# ==========================================
HTML_FLYER_2 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="bottom: 100px; right: -100px;"></div>
  <div class="glow-cyan" style="top: -100px; left: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill" style="border-color: rgba(244, 63, 94, 0.4); color: #fb7185; background: rgba(244, 63, 94, 0.1);">
          Transformación de Negocio
        </div>
      </div>

      <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 14px;">
        DILE ADIÓS AL CUADERNO <br>Y AL <span style="color: #f43f5e;">WHATSAPP COLAPSADO</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4;">
        Mira cómo cambia tu negocio cuando pasas del desorden manual a la automatización inteligente:
      </p>
    </div>

    <!-- COMPARATIVA EN 2 BLOQUES GRANDES Y COMPLETOS -->
    <div style="display: flex; flex-direction: column; gap: 28px;">
      
      <!-- EL ANTES -->
      <div style="background: rgba(244, 63, 94, 0.08); border: 2.5px solid rgba(244, 63, 94, 0.35); border-radius: 32px; padding: 42px 46px;">
        <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 26px;">
          <div style="width: 58px; height: 58px; border-radius: 18px; background: rgba(244, 63, 94, 0.25); display: flex; align-items: center; justify-content: center;">
            {CROSS_SVG}
          </div>
          <div>
            <h3 style="font-size: 34px; font-weight: 900; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.5px;">El Caos del Cuaderno y Chat Manual</h3>
            <p style="font-size: 20px; color: #94a3b8;">Estrés diario, pérdida de clientes y falta de control</p>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #f43f5e; font-size: 28px; font-weight: 900;">✕</span>
            <span style="font-size: 23px; color: #e2e8f0;">Hojas de papel manchadas, tachadas y citas que se cruzan.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #f43f5e; font-size: 28px; font-weight: 900;">✕</span>
            <span style="font-size: 23px; color: #e2e8f0;">Clientes preguntando a las 11:30 PM: <em>"¿Amigo, tienes turno mañana?"</em></span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #f43f5e; font-size: 28px; font-weight: 900;">✕</span>
            <span style="font-size: 23px; color: #e2e8f0;">Clientes que olvidan su cita y te dejan esperando sin avisar.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #f43f5e; font-size: 28px; font-weight: 900;">✕</span>
            <span style="font-size: 23px; color: #e2e8f0;">Horas perdidas al teléfono en vez de atender y cobrar.</span>
          </div>
        </div>
      </div>

      <!-- EL DESPUÉS (CON AGENDACLICK) -->
      <div style="background: rgba(16, 185, 129, 0.1); border: 3px solid #10b981; border-radius: 32px; padding: 42px 46px; box-shadow: 0 0 60px rgba(16,185,129,0.2);">
        <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 26px;">
          <div style="width: 58px; height: 58px; border-radius: 18px; background: rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center;">
            {CHECK_SVG}
          </div>
          <div>
            <h3 style="font-size: 34px; font-weight: 900; color: #34d399; text-transform: uppercase; letter-spacing: 0.5px;">Con AgendaClick (100% Automático)</h3>
            <p style="font-size: 20px; color: #cbd5e1;">Paz mental, profesionalismo y más ingresos cada día</p>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #10b981; font-size: 28px; font-weight: 900;">✓</span>
            <span style="font-size: 23px; color: #ffffff; font-weight: 600;">Tu propia página web de reservas funcionando 24/7.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #10b981; font-size: 28px; font-weight: 900;">✓</span>
            <span style="font-size: 23px; color: #ffffff; font-weight: 600;">Los clientes ven los horarios libres y se agendan solos en 30s.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #10b981; font-size: 28px; font-weight: 900;">✓</span>
            <span style="font-size: 23px; color: #ffffff; font-weight: 600;">Sincronización instantánea con Google Calendar en tu celular.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="color: #10b981; font-size: 28px; font-weight: 900;">✓</span>
            <span style="font-size: 23px; color: #ffffff; font-weight: 600;">Recordatorios automáticos que reducen ausentismos a cero.</span>
          </div>
        </div>
      </div>

    </div>

    <!-- MOCKUP BENEFICIO VISUAL -->
    <div style="display: flex; gap: 20px;">
      <div class="card-glass" style="flex: 1; padding: 26px 30px; border-color: rgba(16, 185, 129, 0.4); text-align: center;">
        <p style="font-size: 38px; font-weight: 900; color: #10b981; margin-bottom: 2px;">+30%</p>
        <p style="font-size: 19px; font-weight: 700; color: #ffffff;">Más Citas al Mes</p>
        <p style="font-size: 15px; color: #94a3b8;">Por clientes que reservan de noche</p>
      </div>
      <div class="card-glass" style="flex: 1; padding: 26px 30px; border-color: rgba(6, 182, 212, 0.4); text-align: center;">
        <p style="font-size: 38px; font-weight: 900; color: #38bdf8; margin-bottom: 2px;">15 Horas</p>
        <p style="font-size: 19px; font-weight: 700; color: #ffffff;">Ahorradas a la Semana</p>
        <p style="font-size: 15px; color: #94a3b8;">Sin responder mensajes repetidos</p>
      </div>
      <div class="card-glass" style="flex: 1; padding: 26px 30px; border-color: rgba(168, 85, 247, 0.4); text-align: center;">
        <p style="font-size: 38px; font-weight: 900; color: #c084fc; margin-bottom: 2px;">0 Citas</p>
        <p style="font-size: 19px; font-weight: 700; color: #ffffff;">Cruces u Olvidos</p>
        <p style="font-size: 15px; color: #94a3b8;">Sincronizado con Google Calendar</p>
      </div>
    </div>

    {make_footer("Probar 14 Días Gratis →", "www.agendaclick.com.co")}

  </div>
</body>
</html>
"""

# ==========================================
# FLYER 3: ¿PARA QUÉ NEGOCIOS SIRVE?
# ==========================================
HTML_FLYER_3 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="top: 200px; left: -100px;"></div>
  <div class="glow-cyan" style="bottom: -100px; right: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill">
          Multi-Sector Colombia
        </div>
      </div>

      <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 14px;">
        EL SISTEMA DE CITAS QUE <br><span class="gradient-text">TODO NEGOCIO NECESITA</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4;">
        Si tu negocio atiende por citas, turnos o reservas, AgendaClick lo automatiza:
      </p>
    </div>

    <!-- REJILLA DE 6 SECTORES EXPANDIDA -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 26px;">
      
      <!-- 1. BARBERÍAS Y PELUQUERÍAS -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #10b981;">
        <div style="font-size: 52px; margin-bottom: 12px;">💇‍♂️</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Barberías y Salones</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Agenda por barbero o estilista, catálogo de cortes, fotos, precios y duración de cada servicio.
        </p>
      </div>

      <!-- 2. CANCHAS SINTÉTICAS -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #3b82f6;">
        <div style="font-size: 52px; margin-bottom: 12px;">⚽</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Canchas y Pádel</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Alquiler de canchas por horas diurnas o nocturnas, tarifas dinámicas y cero cruces de partidos.
        </p>
      </div>

      <!-- 3. SALUD Y CONSULTORIOS -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #06b6d4;">
        <div style="font-size: 52px; margin-bottom: 12px;">🩺</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Consultorios y Dental</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Gestión de pacientes, consultas médicas y citas sin salas de espera llenas ni cancelaciones.
        </p>
      </div>

      <!-- 4. SPAS Y ESTÉTICA -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #ec4899;">
        <div style="font-size: 52px; margin-bottom: 12px;">💅</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Spas, Uñas y Belleza</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Catálogo visual de manicura, masajes y tratamientos faciales con duración y precio exacto.
        </p>
      </div>

      <!-- 5. VETERINARIAS -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #f59e0b;">
        <div style="font-size: 52px; margin-bottom: 12px;">🐾</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Veterinarias y Grooming</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Turnos de baño, peluquería canina y consultas veterinarias organizadas por especialista.
        </p>
      </div>

      <!-- 6. TALLERES Y LAVADEROS -->
      <div class="card-glass" style="padding: 38px 36px; border-left: 7px solid #a855f7;">
        <div style="font-size: 52px; margin-bottom: 12px;">🚗</div>
        <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">Talleres y Lavaderos</h3>
        <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
          Mantenimiento de autos, motos o carga de vehículos eléctricos sin filas ni demoras.
        </p>
      </div>

    </div>

    <!-- TARJETA: QUÉ INCLUYE -->
    <div style="background: rgba(16, 185, 129, 0.12); border: 2.5px solid rgba(16, 185, 129, 0.4); border-radius: 28px; padding: 30px 42px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <span style="font-size: 50px;">📲</span>
        <div>
          <p style="font-size: 26px; font-weight: 900; color: #ffffff; margin-bottom: 4px;">Tus clientes reservan directamente desde su celular</p>
          <p style="font-size: 20px; color: #cbd5e1;">Sin descargar aplicaciones • Sincronizado en tiempo real con Google Calendar</p>
        </div>
      </div>
      <span style="background: #10b981; color: #000; font-size: 20px; font-weight: 900; padding: 12px 26px; border-radius: 12px;">100% Online</span>
    </div>

    {make_footer("Comenzar Gratis →", "www.agendaclick.com.co")}

  </div>
</body>
</html>
"""

# ==========================================
# FLYER 4: LAS 4 SÚPER FUNCIONES CLAVE
# ==========================================
HTML_FLYER_4 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="top: -50px; left: 100px;"></div>
  <div class="glow-cyan" style="bottom: 150px; right: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill">
          Tecnología Colombiana
        </div>
      </div>

      <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 14px;">
        4 RAZONES POR LAS QUE <br>LOS NEGOCIOS <span class="gradient-text">AMAN AGENDACLICK</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4;">
        Herramientas profesionales diseñadas para que ahorres tiempo y multipliques tus reservas:
      </p>
    </div>

    <!-- 4 SÚPER CARACTERÍSTICAS ROBUSTAS -->
    <div style="display: flex; flex-direction: column; gap: 26px;">
      
      <!-- FUNCIÓN 1 -->
      <div class="card-glass" style="padding: 38px 42px; display: flex; align-items: center; gap: 32px; border-left: 8px solid #10b981;">
        <div style="width: 76px; height: 76px; border-radius: 22px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; shrink: 0;">
          {PHONE_SVG}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">1. Enlace Web de Reservas 24/7</h3>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            Tu propio link personalizado. Tus clientes pueden agendarse un domingo por la noche o de madrugada sin esperar a que les respondas el chat.
          </p>
        </div>
      </div>

      <!-- FUNCIÓN 2 -->
      <div class="card-glass" style="padding: 38px 42px; display: flex; align-items: center; gap: 32px; border-left: 8px solid #06b6d4;">
        <div style="width: 76px; height: 76px; border-radius: 22px; background: rgba(6, 182, 212, 0.2); display: flex; align-items: center; justify-content: center; shrink: 0;">
          {SYNC_SVG}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">2. Sincronización con Google Calendar</h3>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            Cada cita confirmada entra automáticamente al calendario del celular del dueño y de sus profesionales. ¡Cero citas cruzadas!
          </p>
        </div>
      </div>

      <!-- FUNCIÓN 3 -->
      <div class="card-glass" style="padding: 38px 42px; display: flex; align-items: center; gap: 32px; border-left: 8px solid #3b82f6;">
        <div style="width: 76px; height: 76px; border-radius: 22px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; shrink: 0;">
          {MAP_SVG}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">3. Botón Oficial en Google Maps</h3>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            Asistente para integrar el botón "Reservar cita" en tu perfil de Google Maps. Los clientes que te busquen en la calle reservan al instante.
          </p>
        </div>
      </div>

      <!-- FUNCIÓN 4 -->
      <div class="card-glass" style="padding: 38px 42px; display: flex; align-items: center; gap: 32px; border-left: 8px solid #a855f7;">
        <div style="width: 76px; height: 76px; border-radius: 22px; background: rgba(168, 85, 247, 0.2); display: flex; align-items: center; justify-content: center; shrink: 0;">
          {CLOCK_SVG}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">4. Reagendamiento Autónomo de Clientes</h3>
          <p style="font-size: 22px; color: #cbd5e1; line-height: 1.45;">
            Si un cliente no puede asistir, puede cambiar su cita directamente desde su celular sin llamarte ni dejarte el espacio perdido.
          </p>
        </div>
      </div>

    </div>

    <!-- BENEFICIOS CLAVE -->
    <div style="display: flex; gap: 20px; justify-content: space-between;">
      <div style="flex: 1; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.14); border-radius: 22px; padding: 22px 24px; text-align: center;">
        <p style="font-size: 24px; font-weight: 900; color: #10b981; margin-bottom: 4px;">0% Comisiones</p>
        <p style="font-size: 18px; color: #94a3b8;">Tus clientes son 100% tuyos</p>
      </div>
      <div style="flex: 1; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.14); border-radius: 22px; padding: 22px 24px; text-align: center;">
        <p style="font-size: 24px; font-weight: 900; color: #38bdf8; margin-bottom: 4px;">Sin Contratos</p>
        <p style="font-size: 18px; color: #94a3b8;">Cancela cuando quieras</p>
      </div>
      <div style="flex: 1; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.14); border-radius: 22px; padding: 22px 24px; text-align: center;">
        <p style="font-size: 24px; font-weight: 900; color: #c084fc; margin-bottom: 4px;">Listo en 5 Min</p>
        <p style="font-size: 18px; color: #94a3b8;">Configuración fácil y rápida</p>
      </div>
    </div>

    {make_footer("Crear mi Agenda Gratis →", "www.agendaclick.com.co")}

  </div>
</body>
</html>
"""

# ==========================================
# FLYER SOCIOS 1: LA FÓRMULA DEL 70%
# ==========================================
HTML_SOCIOS_1 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="top: -100px; right: -150px;"></div>
  <div class="glow-cyan" style="bottom: 250px; left: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill">
          {SPARKLE_SVG}
          Distribuidores Oficiales
        </div>
      </div>

      <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 14px;">
        ¿CÓMO SE CALCULA <br>TU <span class="gradient-text">70% DE COMISIÓN?</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4; max-width: 950px;">
        Cifras reales en Pesos Colombianos. Sin multinivel ni trucos: software real que los negocios pagan mes a mes.
      </p>
    </div>

    <!-- 3 PASOS DE LA FÓRMULA -->
    <div style="display: flex; flex-direction: column; gap: 26px;">
      
      <!-- PASO 1 -->
      <div class="card-glass" style="padding: 36px 42px; border-left: 8px solid #10b981; display: flex; align-items: center; gap: 30px;">
        <div style="min-width: 76px; height: 76px; border-radius: 22px; background: rgba(16, 185, 129, 0.2); border: 2.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; color: #10b981;">
          1
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">Recomiendas AgendaClick</h3>
          <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
            Le regalas 14 días de prueba gratis a una peluquería, barbería, cancha sintética o consultorio de tu ciudad.
          </p>
        </div>
      </div>

      <!-- PASO 2 -->
      <div class="card-glass" style="padding: 36px 42px; border-left: 8px solid #06b6d4; display: flex; align-items: center; gap: 30px;">
        <div style="min-width: 76px; height: 76px; border-radius: 22px; background: rgba(6, 182, 212, 0.2); border: 2.5px solid #06b6d4; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; color: #06b6d4;">
          2
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">El Negocio Paga su Suscripción</h3>
          <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
            El negocio paga su mensualidad de <strong style="color: #38bdf8;">$349.000 COP al mes</strong> para seguir recibiendo reservas automáticas.
          </p>
        </div>
      </div>

      <!-- PASO 3 -->
      <div class="card-glass" style="padding: 36px 42px; border-left: 8px solid #a855f7; display: flex; align-items: center; gap: 30px;">
        <div style="min-width: 76px; height: 76px; border-radius: 22px; background: rgba(168, 85, 247, 0.2); border: 2.5px solid #a855f7; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; color: #a855f7;">
          3
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">¡Recibes el 70% de Comisión!</h3>
          <p style="font-size: 21px; color: #cbd5e1; line-height: 1.45;">
            Te corresponden <strong style="color: #34d399;">$244.300 COP mensuales</strong> por cada negocio, mientras mantenga su plan activo.
          </p>
        </div>
      </div>

    </div>

    <!-- TARJETA DESTACADA: 5 NEGOCIOS = SUELDO RECURRENTE -->
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.12) 100%); border: 3px solid #10b981; border-radius: 30px; padding: 36px 42px; box-shadow: 0 0 50px rgba(16,185,129,0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #34d399; letter-spacing: 1px;">
          Meta Real de Ingresos Pasivos
        </span>
        <span style="background: #10b981; color: #000; font-size: 16px; font-weight: 900; padding: 6px 16px; border-radius: 8px;">
          RECURRENTE
        </span>
      </div>
      <p style="font-size: 38px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">
        Con solo 5 negocios ganas: <span style="color: #34d399;">$1.221.500 COP/mes</span>
      </p>
      <p style="font-size: 21px; color: #cbd5e1;">
        Consignaciones automáticas a Nequi, Daviplata o Cuenta Bancaria.
      </p>
    </div>

    {make_footer("Quiero ser Distribuidor →", "agendaclick.com.co/socios")}

  </div>
</body>
</html>
"""

# ==========================================
# FLYER SOCIOS 2: TABLA DE INGRESOS
# ==========================================
HTML_SOCIOS_2 = f"""<!DOCTYPE html>
<html>
{COMMON_HEAD}
<body>
  <div class="grid-bg"></div>
  <div class="glow-emerald" style="bottom: 100px; right: -100px;"></div>
  <div class="glow-cyan" style="top: -100px; left: -100px;"></div>

  <div style="padding: 75px 65px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10;">
    
    <!-- HEADER -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px;">
        <div class="brand-title">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
            {CALENDAR_SVG}
          </div>
          <span style="font-size: 46px; font-weight: 900; letter-spacing: -1px;">Agenda<span style="color: #10b981;">Click</span></span>
        </div>
        <div class="badge-pill">
          Distribuidores Comerciales
        </div>
      </div>

      <h1 style="font-size: 56px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 14px;">
        TU CARTERA DE CLIENTES = <br><span class="gradient-text">TU SUELDO PASIVO MENSUAL</span>
      </h1>
      <p style="font-size: 25px; color: #94a3b8; line-height: 1.4;">
        Ganas el 70% recurrente de cada negocio (<strong style="color: #34d399;">$244.300 COP/mes</strong> por cliente activo):
      </p>
    </div>

    <!-- TABLA DE INGRESOS PASIVOS EN 4 TARJETAS -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <div class="card-glass" style="padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #94a3b8;">
        <div>
          <p style="font-size: 30px; font-weight: 800; color: #ffffff;">3 Negocios Activos</p>
          <p style="font-size: 18px; color: #94a3b8;">Ingreso extra para tus gastos</p>
        </div>
        <div style="font-size: 36px; font-weight: 900; color: #38bdf8;">
          $732.900 COP <span style="font-size: 20px; color: #94a3b8; font-weight: 600;">/ mes</span>
        </div>
      </div>

      <div class="card-glass" style="padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #10b981; background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.4);">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
            <p style="font-size: 32px; font-weight: 900; color: #ffffff;">5 Negocios Activos</p>
            <span style="background: #10b981; color: #000; font-size: 14px; font-weight: 900; padding: 4px 10px; border-radius: 6px;">SUELDO MENSUAL</span>
          </div>
          <p style="font-size: 19px; color: #cbd5e1;">Equivale a un salario mínimo mensual garantizado</p>
        </div>
        <div style="font-size: 40px; font-weight: 900; color: #34d399;">
          $1.221.500 COP <span style="font-size: 20px; color: #cbd5e1; font-weight: 600;">/ mes</span>
        </div>
      </div>

      <div class="card-glass" style="padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #06b6d4;">
        <div>
          <p style="font-size: 30px; font-weight: 800; color: #ffffff;">10 Negocios Activos</p>
          <p style="font-size: 18px; color: #94a3b8;">Libertad financiera y trabajo remoto</p>
        </div>
        <div style="font-size: 36px; font-weight: 900; color: #38bdf8;">
          $2.443.000 COP <span style="font-size: 20px; color: #94a3b8; font-weight: 600;">/ mes</span>
        </div>
      </div>

      <div class="card-glass" style="padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #a855f7;">
        <div>
          <p style="font-size: 30px; font-weight: 800; color: #ffffff;">20 Negocios Activos</p>
          <p style="font-size: 18px; color: #94a3b8;">Agencia de digitalización propia</p>
        </div>
        <div style="font-size: 36px; font-weight: 900; color: #c084fc;">
          $4.886.000 COP <span style="font-size: 20px; color: #94a3b8; font-weight: 600;">/ mes</span>
        </div>
      </div>

    </div>

    <!-- TARJETA DE RECURRENCIA -->
    <div style="background: rgba(255, 255, 255, 0.04); border: 1.5px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 24px 34px; display: flex; align-items: center; gap: 20px;">
      <span style="font-size: 42px;">🔒</span>
      <div>
        <p style="font-size: 22px; font-weight: 800; color: #ffffff;">Ingreso 100% Recurrente</p>
        <p style="font-size: 18px; color: #94a3b8;">El negocio renueva el software mes a mes para funcionar. Tú cobras mes a mes sin falta.</p>
      </div>
    </div>

    {make_footer("Obtener mi Código →", "agendaclick.com.co/socios")}

  </div>
</body>
</html>
"""

FLYERS = [
    (os.path.join(EXPLICACION_DIR, "promo_1_como_funciona.png"), HTML_FLYER_1),
    (os.path.join(EXPLICACION_DIR, "promo_2_antes_vs_despues.png"), HTML_FLYER_2),
    (os.path.join(EXPLICACION_DIR, "promo_3_sectores_negocios.png"), HTML_FLYER_3),
    (os.path.join(EXPLICACION_DIR, "promo_4_funciones_clave.png"), HTML_FLYER_4),
    (os.path.join(SOCIOS_DIR, "promo_1_formula_70.jpg"), HTML_SOCIOS_1),
    (os.path.join(SOCIOS_DIR, "promo_2_tabla_ingresos.jpg"), HTML_SOCIOS_2),
]

for out_path, html_content in FLYERS:
    filename = os.path.basename(out_path)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html_content)
        temp_html = f.name

    print(f"Renderizando {filename}...")
    cmd = [
        "google-chrome",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1080,1920",
        f"--screenshot={out_path}",
        temp_html
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(temp_html)
    print(f"✓ Guardado: {out_path} ({os.path.getsize(out_path)} bytes)")

print("\n¡Todas las imágenes fueron renderizadas con éxito incluyendo el número +57 323 9306599!")
