#!/usr/bin/env python3
import os
import subprocess
import tempfile
import base64

EXPLICACION_DIR = "/home/rocua/Proyectos/AgendaClick/public/promos/explicacion"
SOCIOS_DIR = "/home/rocua/Proyectos/AgendaClick/public/promos/socios"
os.makedirs(EXPLICACION_DIR, exist_ok=True)
os.makedirs(SOCIOS_DIR, exist_ok=True)

# Read logo
LOGO_PATH = "/home/rocua/Proyectos/AgendaClick/public/full-logo.png"
with open(LOGO_PATH, "rb") as f:
    LOGO_B64 = base64.b64encode(f.read()).decode("utf-8")
LOGO_DATA_URI = f"data:image/png;base64,{LOGO_B64}"

# Common SVGs
CALENDAR_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>"""
CHECK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>"""
CROSS_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>"""
CLOCK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>"""
PHONE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>"""
MAP_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>"""
SYNC_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>"""
WHATSAPP_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>"""
SPARKLE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>"""
ARROW_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>"""

COMMON_STYLE = f"""
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1920px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      overflow: hidden;
      position: relative;
    }}
    .bg-dots {{
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#cbd5e1 1.6px, transparent 1.6px);
      background-size: 36px 36px;
      opacity: 0.55;
      pointer-events: none;
    }}
    .top-announcement {{
      background: #090d16;
      color: #f1f5f9;
      padding: 16px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #10b981;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }}
    .top-announcement .badge {{
      background: #10b981;
      color: #042f2e;
      font-size: 15px;
      font-weight: 900;
      padding: 6px 16px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }}
    .header-branding {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 36px 60px 24px;
    }}
    .header-branding img {{
      height: 72px;
      object-fit: contain;
    }}
    .header-badge {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: #065f46;
      padding: 10px 22px;
      border-radius: 9999px;
      font-size: 19px;
      font-weight: 800;
    }}
    .card-clean {{
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 30px;
      box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
    }}
    .card-dark {{
      background: #090d16;
      border: 1.5px solid #1e293b;
      border-radius: 30px;
      color: #ffffff;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
    }}
    .footer-bar {{
      margin-top: auto;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 32px;
      padding: 30px 44px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 16px 36px -10px rgba(15, 23, 42, 0.1);
    }}
    .footer-top {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .footer-btn-main {{
      background: #090d16;
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      padding: 16px 32px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.3);
    }}
    .footer-wa {{
      display: flex;
      align-items: center;
      gap: 14px;
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      padding: 14px 28px;
      border-radius: 9999px;
      color: #166534;
      font-size: 22px;
      font-weight: 800;
    }}
    .footer-badges {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1.5px solid #f1f5f9;
      font-size: 18px;
      font-weight: 700;
      color: #64748b;
    }}
  </style>
"""

def make_layout(content_html, top_title="SISTEMA OFICIAL DE RESERVAS 24/7 EN COLOMBIA 🇨🇴", top_badge="OFICIAL", footer_cta="Probar 14 Días Gratis", footer_link="www.agendaclick.com.co"):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  {COMMON_STYLE}
</head>
<body>
  <div class="bg-dots"></div>

  <!-- TOP BAR -->
  <div class="top-announcement">
    <div style="display: flex; align-items: center; gap: 14px;">
      <span class="badge">{top_badge}</span>
      <span>{top_title}</span>
    </div>
    <span style="color: #10b981; font-weight: 800;">agendaclick.com.co</span>
  </div>

  <div style="position: relative; z-index: 10; padding: 24px 60px 48px; height: calc(100% - 62px); display: flex; flex-direction: column;">
    
    <!-- HEADER BRAND -->
    <div class="header-branding" style="padding: 10px 0 24px;">
      <img src="{LOGO_DATA_URI}" alt="AgendaClick Logo" />
      <div class="header-badge">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
        <span>Sin comisiones por cita</span>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <div style="display: flex; flex-direction: column; gap: 26px; flex: 1;">
      {content_html}
    </div>

    <!-- FOOTER WITH WHATSAPP -->
    <div class="footer-bar">
      <div class="footer-top">
        <div class="footer-wa">
          {WHATSAPP_SVG}
          <span>WhatsApp: <strong>+57 323 9306599</strong></span>
        </div>
        <div class="footer-btn-main">
          <span>{footer_cta}</span>
          {ARROW_SVG}
        </div>
      </div>
      <div class="footer-badges">
        <span style="color: #0f172a;">👉 <strong>{footer_link}</strong></span>
        <span>⚡ Configuración en 5 Minutos</span>
        <span>🔒 Sin Tarjetas de Crédito</span>
      </div>
    </div>

  </div>
</body>
</html>
"""

# ==============================================================================
# FLYER 1: ¿CÓMO FUNCIONA AGENDACLICK? (El Flujo en 3 Pasos)
# ==============================================================================
FLYER_1_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      {SPARKLE_SVG}
      <span>TU NEGOCIO EN AUTOMÁTICO</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      ¿Cómo funciona <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">AgendaClick</span> para tu negocio?
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Tus clientes se agendan solos las 24 horas, sin que tengas que contestar mensajes a deshoras.
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="card-clean" style="padding: 28px 36px; display: flex; align-items: center; gap: 28px;">
      <div style="width: 74px; height: 74px; border-radius: 22px; background: #090d16; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; flex-shrink: 0; box-shadow: 0 8px 16px -4px rgba(0,0,0,0.2);">
        1
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <h3 style="font-size: 26px; font-weight: 800; color: #090d16;">Tu propio enlace web 24/7</h3>
          <span style="background: #ecfdf5; color: #059669; font-size: 15px; font-weight: 800; padding: 4px 12px; border-radius: 8px;">EN TU PERFIL</span>
        </div>
        <p style="font-size: 20px; color: #475569; line-height: 1.35;">
          Pones tu link <strong>agendaclick.com.co/tunegocio</strong> en tu Instagram, WhatsApp y Google Maps. Tu cliente entra en 1 clic <strong>sin descargar apps</strong>.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 28px 36px; display: flex; align-items: center; gap: 28px; border-left: 8px solid #059669;">
      <div style="width: 74px; height: 74px; border-radius: 22px; background: #059669; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; flex-shrink: 0; box-shadow: 0 8px 16px -4px rgba(5,150,105,0.3);">
        2
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <h3 style="font-size: 26px; font-weight: 800; color: #090d16;">El cliente elige en 30 segundos</h3>
          <span style="background: #eff6ff; color: #2563eb; font-size: 15px; font-weight: 800; padding: 4px 12px; border-radius: 8px;">CERO CONFUSIÓN</span>
        </div>
        <p style="font-size: 20px; color: #475569; line-height: 1.35;">
          Selecciona el servicio, el profesional que lo atiende y los horarios <strong>realmente disponibles</strong>. Cero citas cruzadas o dobles turnos.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 28px 36px; display: flex; align-items: center; gap: 28px;">
      <div style="width: 74px; height: 74px; border-radius: 22px; background: #090d16; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; flex-shrink: 0; box-shadow: 0 8px 16px -4px rgba(0,0,0,0.2);">
        3
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <h3 style="font-size: 26px; font-weight: 800; color: #090d16;">Directo a tu Google Calendar</h3>
          <span style="background: #ecfdf5; color: #059669; font-size: 15px; font-weight: 800; padding: 4px 12px; border-radius: 8px;">EN TU CELULAR</span>
        </div>
        <p style="font-size: 20px; color: #475569; line-height: 1.35;">
          La cita entra al instante al calendario de tu celular. El cliente recibe confirmación inmediata y recordatorios para que <strong>nunca falte</strong>.
        </p>
      </div>
    </div>
  </div>

  <div class="card-dark" style="padding: 30px 40px; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 26px;">📱</span>
        <h4 style="font-size: 24px; font-weight: 800; color: #ffffff;">Experiencia VIP para tus clientes</h4>
      </div>
      <p style="font-size: 18px; color: #94a3b8; max-width: 580px; line-height: 1.35;">
        Sin registros difíciles ni contraseñas. Validación rápida por código único (OTP) para blindar tu negocio contra citas falsas.
      </p>
    </div>
    <div style="background: #1e293b; border: 1.5px solid #334155; padding: 14px 24px; border-radius: 20px; text-align: center;">
      <p style="font-size: 14px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Ahorro Promedio</p>
      <p style="font-size: 36px; font-weight: 900; color: #10b981;">15 Horas</p>
      <p style="font-size: 14px; color: #cbd5e1; font-weight: 600;">al mes en WhatsApp</p>
    </div>
  </div>
"""

# ==============================================================================
# FLYER 2: ANTES VS DESPUÉS (El Contraste Real de Negocio)
# ==============================================================================
FLYER_2_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #fee2e2; border: 1.5px solid #fecaca; color: #991b1b; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>⚠️ DEJA DE PERDER DINERO</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      El cambio que tu negocio <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">necesita hoy</span>
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Compara cómo manejas tu negocio hoy vs. cómo trabaja en automático con AgendaClick.
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 28px; padding: 26px 36px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 30px;">❌</span>
          <h3 style="font-size: 28px; font-weight: 900; color: #991b1b;">ANTES: El método tradicional</h3>
        </div>
        <span style="background: #fee2e2; color: #991b1b; font-size: 16px; font-weight: 800; padding: 6px 14px; border-radius: 8px;">PÉRDIDA DE TIEMPO</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #7f1d1d; font-weight: 600;">
          {CROSS_SVG}
          <span>Cuaderno de papel arrugado con tachones y citas que se cruzan.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #7f1d1d; font-weight: 600;">
          {CROSS_SVG}
          <span>Responder <em>"¿Qué hora tienes disponible?"</em> 30 veces al día en WhatsApp.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #7f1d1d; font-weight: 600;">
          {CROSS_SVG}
          <span>Clientes que se olvidan de ir y te dejan el sillón o la cancha vacía.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #7f1d1d; font-weight: 600;">
          {CROSS_SVG}
          <span>Mensajes a las 11:00 PM interrumpiendo tu tiempo en familia.</span>
        </div>
      </div>
    </div>

    <div style="background: #f0fdf4; border: 2.5px solid #86efac; border-radius: 28px; padding: 26px 36px; box-shadow: 0 12px 30px -8px rgba(5,150,105,0.15);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 30px;">✅</span>
          <h3 style="font-size: 28px; font-weight: 900; color: #14532d;">DESPUÉS: Con AgendaClick</h3>
        </div>
        <span style="background: #059669; color: #ffffff; font-size: 16px; font-weight: 900; padding: 6px 14px; border-radius: 8px;">100% PROFESIONAL</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #166534; font-weight: 700;">
          {CHECK_SVG}
          <span>Enlace web 24/7 en Instagram, WhatsApp y Google Maps.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #166534; font-weight: 700;">
          {CHECK_SVG}
          <span>Tus clientes ven horas libres y se agendan solos en 30 segundos.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #166534; font-weight: 700;">
          {CHECK_SVG}
          <span>Sincronización automática a tu Google Calendar en tu celular.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 20px; color: #166534; font-weight: 700;">
          {CHECK_SVG}
          <span>Confirmación instantánea al cliente para garantizar que asista.</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card-clean" style="padding: 24px 36px; display: flex; align-items: center; justify-content: space-around; background: #ffffff;">
    <div style="text-align: center;">
      <p style="font-size: 40px; font-weight: 900; color: #059669;">+30%</p>
      <p style="font-size: 18px; color: #475569; font-weight: 700;">Más Citas Concretadas</p>
    </div>
    <div style="width: 2px; height: 50px; background: #e2e8f0;"></div>
    <div style="text-align: center;">
      <p style="font-size: 40px; font-weight: 900; color: #090d16;">0%</p>
      <p style="font-size: 18px; color: #475569; font-weight: 700;">Comisiones por Cita</p>
    </div>
    <div style="width: 2px; height: 50px; background: #e2e8f0;"></div>
    <div style="text-align: center;">
      <p style="font-size: 40px; font-weight: 900; color: #2563eb;">24/7</p>
      <p style="font-size: 18px; color: #475569; font-weight: 700;">Reservas en Piloto Automático</p>
    </div>
  </div>
"""

# ==============================================================================
# FLYER 3: ¿PARA QUÉ NEGOCIOS ES AGENDACLICK? (Los 6 Sectores)
# ==============================================================================
FLYER_3_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>🇨🇴 HECHO A LA MEDIDA EN COLOMBIA</span>
    </div>
    <h1 style="font-size: 56px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      ¿Tu negocio atiende por turnos? <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">Esto es para ti.</span>
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Miles de negocios en Colombia ya no usan papel. Conoce cómo se adapta a tu rubro:
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
    <div class="card-clean" style="padding: 24px; border-top: 6px solid #090d16;">
      <div style="font-size: 38px; margin-bottom: 10px;">💈</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Barberías y Salones</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Agenda por sillón o barbero favorito sin cruce de horarios.</p>
    </div>

    <div class="card-clean" style="padding: 24px; border-top: 6px solid #059669;">
      <div style="font-size: 38px; margin-bottom: 10px;">⚽</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Canchas Sintéticas</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Control de canchas de fútbol 5 y 8 por horas y franjas nocturnas.</p>
    </div>

    <div class="card-clean" style="padding: 24px; border-top: 6px solid #059669;">
      <div style="font-size: 38px; margin-bottom: 10px;">💅</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Spas y Estética</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Uñas, masajes y limpiezas faciales con tiempos exactos.</p>
    </div>

    <div class="card-clean" style="padding: 24px; border-top: 6px solid #090d16;">
      <div style="font-size: 38px; margin-bottom: 10px;">🩺</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Consultorios y Salud</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Odontología, psicología y terapias con verificación OTP anti-spam.</p>
    </div>

    <div class="card-clean" style="padding: 24px; border-top: 6px solid #090d16;">
      <div style="font-size: 38px; margin-bottom: 10px;">🐾</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Veterinarias & Mascotas</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Baño, peluquería canina y citas médicas programadas con orden.</p>
    </div>

    <div class="card-clean" style="padding: 24px; border-top: 6px solid #059669;">
      <div style="font-size: 38px; margin-bottom: 10px;">🚗</div>
      <h3 style="font-size: 22px; font-weight: 900; color: #090d16; margin-bottom: 6px;">Talleres y Detailing</h3>
      <p style="font-size: 17px; color: #475569; line-height: 1.35;">Mantenimiento y lavado con registro de placa y marca del carro.</p>
    </div>
  </div>

  <div style="background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 24px; padding: 22px 32px; display: flex; align-items: center; gap: 20px;">
    <span style="font-size: 36px;">🌐</span>
    <div>
      <p style="font-size: 22px; font-weight: 900; color: #065f46;">Cada negocio recibe su página web personalizada</p>
      <p style="font-size: 18px; color: #047857; font-weight: 600;">Con su logo, fotos de servicios, profesionales y enlace directo de WhatsApp.</p>
    </div>
  </div>
"""

# ==============================================================================
# FLYER 4: LOS 4 SUPERPODERES DE AGENDACLICK
# ==============================================================================
FLYER_4_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>🚀 MÁS QUE UNA SIMPLE AGENDA</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      Los 4 superpoderes que <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">hacen crecer</span> tu negocio
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Tecnología de primer nivel diseñada para que vendas más y trabajes menos:
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 18px;">
    <div class="card-clean" style="padding: 24px 32px; display: flex; align-items: center; gap: 24px;">
      <div style="width: 66px; height: 66px; border-radius: 20px; background: #090d16; color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        {MAP_SVG}
      </div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16; margin-bottom: 4px;">
          1. Botón Oficial en Google Maps
        </h3>
        <p style="font-size: 18px; color: #475569; line-height: 1.35;">
          Aparece en Google Maps con el botón oficial <strong>"Reservar Cita"</strong>. Captura clientes que buscan en tu barrio en piloto automático.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 24px 32px; display: flex; align-items: center; gap: 24px; border-left: 6px solid #059669;">
      <div style="width: 66px; height: 66px; border-radius: 20px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        {CALENDAR_SVG}
      </div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16; margin-bottom: 4px;">
          2. Sincronización Viva con Google Calendar
        </h3>
        <p style="font-size: 18px; color: #475569; line-height: 1.35;">
          Las citas entran a tu celular. Si tienes un compromiso personal y lo anotas en tu calendario, esa hora se bloquea sola en tu web.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 24px 32px; display: flex; align-items: center; gap: 24px;">
      <div style="width: 66px; height: 66px; border-radius: 20px; background: #090d16; color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        {SYNC_SVG}
      </div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16; margin-bottom: 4px;">
          3. Reagendamiento Autónomo de Citas
        </h3>
        <p style="font-size: 18px; color: #475569; line-height: 1.35;">
          ¿Un cliente no puede asistir? Él mismo cambia su fecha y hora en tu web sin tener que llamarte ni perder el cupo.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 24px 32px; display: flex; align-items: center; gap: 24px; border-left: 6px solid #059669;">
      <div style="width: 66px; height: 66px; border-radius: 20px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        {PHONE_SVG}
      </div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16; margin-bottom: 4px;">
          4. App Instalable en Celular (PWA)
        </h3>
        <p style="font-size: 18px; color: #475569; line-height: 1.35;">
          Tus clientes pueden instalar el icono de tu negocio directamente en la pantalla de su iPhone o Android sin pasar por App Store.
        </p>
      </div>
    </div>
  </div>
"""

# ==============================================================================
# FLYER SOCIOS 1: LA FÓRMULA DEL 70% RECURRENTE
# ==============================================================================
FLYER_SOCIOS_1_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>💰 PROGRAMA OFICIAL DE DISTRIBUIDORES</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      Gana hasta el <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">70% mensual</span> por cada negocio
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Software real con clientes que pagan mes a mes. La comisión es tuya de por vida mientras el cliente esté activo.
    </p>
  </div>

  <div class="card-clean" style="padding: 32px 40px; border-top: 8px solid #059669;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <span style="background: #ecfdf5; color: #059669; font-size: 16px; font-weight: 900; padding: 6px 14px; border-radius: 8px;">PLAN MÁS VENDIDO</span>
        <h2 style="font-size: 34px; font-weight: 900; color: #090d16; margin-top: 8px;">Plan Negocio (Hasta 8 Profesionales)</h2>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 16px; color: #64748b; font-weight: 700;">VALOR MENSUAL</p>
        <p style="font-size: 38px; font-weight: 900; color: #090d16;">$349.000 <span style="font-size: 18px; color: #64748b; font-weight: 600;">COP</span></p>
      </div>
    </div>
    <p style="font-size: 20px; color: #475569; line-height: 1.35;">
      Ideal para barberías medianas, salones de belleza, centros de estética, clínicas y canchas sintéticas.
    </p>
  </div>

  <div class="card-dark" style="padding: 30px 40px;">
    <p style="font-size: 18px; color: #10b981; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">LA MATEMÁTICA ES EXACTA:</p>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1e293b; font-size: 22px;">
      <span style="color: #cbd5e1;">1 Negocio activo ($349.000 × 70%):</span>
      <span style="color: #34d399; font-weight: 900; font-size: 26px;">$244.300 COP / mes</span>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1e293b; font-size: 22px;">
      <span style="color: #cbd5e1;">5 Negocios activos (Ganas mensual):</span>
      <span style="color: #34d399; font-weight: 900; font-size: 28px;">$1.221.500 COP / mes</span>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 0; font-size: 22px;">
      <span style="color: #cbd5e1;">10 Negocios activos (Ganas mensual):</span>
      <span style="color: #34d399; font-weight: 900; font-size: 30px;">$2.443.000 COP / mes</span>
    </div>
  </div>

  <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 24px; padding: 20px 32px; display: flex; align-items: center; gap: 20px;">
    <span style="font-size: 34px;">🤝</span>
    <p style="font-size: 19px; color: #334155; font-weight: 700; line-height: 1.35;">
      Tú solo conectas al dueño del negocio con tu enlace de distribuidor. Nosotros nos encargamos de los servidores, el soporte y las actualizaciones.
    </p>
  </div>
"""

# ==============================================================================
# FLYER SOCIOS 2: TABLA DE INGRESOS MENSUALES RECURRENTES
# ==============================================================================
FLYER_SOCIOS_2_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>📈 ESCALA TUS INGRESOS EN COLOMBIA</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      ¿Cuánto dinero puedes <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">ganar cada mes</span>?
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Proyección real de comisiones recurrentes con el Plan Negocio ($349.000 COP):
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div class="card-clean" style="padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #94a3b8;">
      <div>
        <p style="font-size: 26px; font-weight: 900; color: #090d16;">3 Negocios Activos</p>
        <p style="font-size: 18px; color: #64748b; font-weight: 600;">Ingreso extra sin dejar tu empleo</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 34px; font-weight: 900; color: #090d16;">$732.900</span>
        <span style="font-size: 18px; color: #64748b; font-weight: 700;">COP / mes</span>
      </div>
    </div>

    <div class="card-clean" style="padding: 26px 36px; display: flex; justify-content: space-between; align-items: center; border: 2.5px solid #059669; background: #f0fdf4; box-shadow: 0 12px 30px -8px rgba(5,150,105,0.2);">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
          <p style="font-size: 28px; font-weight: 900; color: #14532d;">5 Negocios Activos</p>
          <span style="background: #059669; color: #ffffff; font-size: 14px; font-weight: 900; padding: 4px 10px; border-radius: 6px;">SUELDO MENSUAL</span>
        </div>
        <p style="font-size: 18px; color: #166534; font-weight: 600;">Equivale a un salario mínimo completo en Colombia</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 38px; font-weight: 900; color: #059669;">$1.221.500</span>
        <span style="font-size: 18px; color: #166534; font-weight: 700;">COP / mes</span>
      </div>
    </div>

    <div class="card-clean" style="padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #090d16;">
      <div>
        <p style="font-size: 26px; font-weight: 900; color: #090d16;">10 Negocios Activos</p>
        <p style="font-size: 18px; color: #64748b; font-weight: 600;">Libertad financiera y trabajo 100% remoto</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 34px; font-weight: 900; color: #090d16;">$2.443.000</span>
        <span style="font-size: 18px; color: #64748b; font-weight: 700;">COP / mes</span>
      </div>
    </div>

    <div class="card-clean" style="padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid #059669;">
      <div>
        <p style="font-size: 26px; font-weight: 900; color: #090d16;">20 Negocios Activos</p>
        <p style="font-size: 18px; color: #64748b; font-weight: 600;">Tu propia agencia de digitalización de comercios</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 34px; font-weight: 900; color: #059669;">$4.886.000</span>
        <span style="font-size: 18px; color: #64748b; font-weight: 700;">COP / mes</span>
      </div>
    </div>
  </div>

  <div style="background: #090d16; color: #ffffff; border-radius: 24px; padding: 22px 34px; display: flex; align-items: center; gap: 20px;">
    <span style="font-size: 36px;">🔒</span>
    <div>
      <p style="font-size: 20px; font-weight: 800; color: #ffffff;">Ingreso 100% Recurrente</p>
      <p style="font-size: 17px; color: #94a3b8;">Los negocios renuevan el sistema mes a mes para funcionar. Tú cobras sin falta.</p>
    </div>
  </div>
"""

# ==============================================================================
# FLYER SOCIOS 3: SOFTWARE REAL VS CRIPTO / PIRÁMIDES
# ==============================================================================
FLYER_SOCIOS_3_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>💎 NEGOCIO B2B LEGÍTIMO Y SOSTENIBLE</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      Esto es <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">Software Real</span>, no esquemas dudosos
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Dile adiós a las inversiones de riesgo, criptomonedas y pirámides. Vende un servicio que los comercios usan a diario.
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="card-clean" style="padding: 26px 36px; border-left: 8px solid #059669;">
      <h3 style="font-size: 26px; font-weight: 900; color: #090d16; margin-bottom: 8px;">🏢 Negocios de carne y hueso</h3>
      <p style="font-size: 20px; color: #475569; line-height: 1.35;">
        Peluquerías, canchas sintéticas, centros médicos y spas en tu propia ciudad. Negocios que ya existen y necesitan digitalizarse hoy mismo.
      </p>
    </div>

    <div class="card-clean" style="padding: 26px 36px; border-left: 8px solid #090d16;">
      <h3 style="font-size: 26px; font-weight: 900; color: #090d16; margin-bottom: 8px;">💳 Pagos seguros en Pesos Colombianos</h3>
      <p style="font-size: 20px; color: #475569; line-height: 1.35;">
        Sin cuentas en el extranjero ni comisiones ocultas. Pasarelas seguras (Wompi, Bancolombia, PSE) con dispersión bancaria directa.
      </p>
    </div>

    <div class="card-clean" style="padding: 26px 36px; border-left: 8px solid #059669;">
      <h3 style="font-size: 26px; font-weight: 900; color: #090d16; margin-bottom: 8px;">🔄 Retención alta de clientes</h3>
      <p style="font-size: 20px; color: #475569; line-height: 1.35;">
        Una vez un negocio acostumbra a sus clientes a agendarse por internet, <strong>nunca cancela el servicio</strong>. Tu ingreso mensual está protegido.
      </p>
    </div>
  </div>

  <div class="card-dark" style="padding: 26px 36px; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <p style="font-size: 22px; font-weight: 800; color: #ffffff;">¿Listo para emprender en serio?</p>
      <p style="font-size: 18px; color: #94a3b8;">Gana comisiones reales por digitalizar el comercio colombiano.</p>
    </div>
    <div style="background: #10b981; color: #042f2e; font-size: 20px; font-weight: 900; padding: 12px 24px; border-radius: 9999px;">
      100% LEGAL
    </div>
  </div>
"""

# ==============================================================================
# FLYER SOCIOS 4: CONVIÉRTETE EN DISTRIBUIDOR OFICIAL
# ==============================================================================
FLYER_SOCIOS_4_CONTENT = f"""
  <div style="margin-bottom: 8px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: #090d16; color: #10b981; padding: 8px 20px; border-radius: 9999px; font-size: 18px; font-weight: 800; margin-bottom: 16px;">
      <span>💼 TU PROPIO NEGOCIO DIGITAL</span>
    </div>
    <h1 style="font-size: 58px; font-weight: 900; line-height: 1.12; color: #090d16; letter-spacing: -1.5px;">
      Conviértete en <span style="color: #059669; text-decoration: underline; text-underline-offset: 8px;">Distribuidor Oficial</span> de AgendaClick
    </h1>
    <p style="font-size: 24px; color: #475569; font-weight: 600; margin-top: 12px; line-height: 1.35;">
      Te entregamos todas las herramientas necesarias para que empieces a vender desde el día 1:
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="card-clean" style="padding: 26px 36px; display: flex; align-items: center; gap: 24px;">
      <div style="font-size: 40px; flex-shrink: 0;">📊</div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16;">Panel CRM de Socio Exclusivo</h3>
        <p style="font-size: 19px; color: #475569; line-height: 1.35;">
          Monitorea en tiempo real tus comercios activos, fechas de renovación y el valor exacto de tus comisiones.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 26px 36px; display: flex; align-items: center; gap: 24px; border-left: 8px solid #059669;">
      <div style="font-size: 40px; flex-shrink: 0;">🔗</div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16;">Enlace y Código de Referido Único</h3>
        <p style="font-size: 19px; color: #475569; line-height: 1.35;">
          Tus clientes se registran a través de tu link y quedan vinculados de por vida a tu cuenta de comisiones.
        </p>
      </div>
    </div>

    <div class="card-clean" style="padding: 26px 36px; display: flex; align-items: center; gap: 24px;">
      <div style="font-size: 40px; flex-shrink: 0;">🎨</div>
      <div>
        <h3 style="font-size: 24px; font-weight: 900; color: #090d16;">Kit Completo de Marketing</h3>
        <p style="font-size: 19px; color: #475569; line-height: 1.35;">
          Te entregamos imágenes de alta conversión, guiones de prospección para WhatsApp y demos listas para mostrar.
        </p>
      </div>
    </div>
  </div>

  <div style="background: #ecfdf5; border: 2.5px solid #86efac; border-radius: 28px; padding: 24px 36px; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <p style="font-size: 24px; font-weight: 900; color: #065f46;">Soporte Prioritario VIP</p>
      <p style="font-size: 18px; color: #047857; font-weight: 600;">Línea directa con el equipo técnico para ayudarte a cerrar ventas.</p>
    </div>
    <div style="background: #059669; color: #ffffff; font-size: 20px; font-weight: 900; padding: 12px 24px; border-radius: 9999px;">
      SOPORTE 1 A 1
    </div>
  </div>
"""

# LIST OF ALL 8 FLYERS TO RENDER
FLYERS = [
    # PRODUCT EXPLAINER (QUÉ HACE AGENDACLICK)
    (
        os.path.join(EXPLICACION_DIR, "promo_1_como_funciona.png"),
        make_layout(FLYER_1_CONTENT, "SISTEMA OFICIAL DE RESERVAS 24/7 EN COLOMBIA 🇨🇴", "OFICIAL", "Probar 14 Días Gratis", "agendaclick.com.co")
    ),
    (
        os.path.join(EXPLICACION_DIR, "promo_2_antes_vs_despues.png"),
        make_layout(FLYER_2_CONTENT, "ELIMINA EL CUADERNO Y EL CAOS DE WHATSAPP 🚫", "AUTOMATIZACIÓN", "Crear mi Web Gratis", "agendaclick.com.co")
    ),
    (
        os.path.join(EXPLICACION_DIR, "promo_3_sectores_negocios.png"),
        make_layout(FLYER_3_CONTENT, "DISEÑADO PARA TODO TIPO DE NEGOCIOS POR TURNOS 💈", "COLOMBIA", "Ver Demostración", "agendaclick.com.co")
    ),
    (
        os.path.join(EXPLICACION_DIR, "promo_4_funciones_clave.png"),
        make_layout(FLYER_4_CONTENT, "GOOGLE MAPS + GOOGLE CALENDAR + APP INTEGRADA 🚀", "TECNOLOGÍA", "Comenzar Ahora", "agendaclick.com.co")
    ),
    # PARTNERS / DISTRIBUTORS (SOCIOS 70%)
    (
        os.path.join(SOCIOS_DIR, "promo_1_formula_70.jpg"),
        make_layout(FLYER_SOCIOS_1_CONTENT, "PROGRAMA OFICIAL DE DISTRIBUIDORES • GANA EL 70% 💵", "INGRESOS", "Obtener mi Código", "agendaclick.com.co/socios")
    ),
    (
        os.path.join(SOCIOS_DIR, "promo_2_tabla_ingresos.jpg"),
        make_layout(FLYER_SOCIOS_2_CONTENT, "TABLA DE INGRESOS RECURRENTES MENSUALES EN COLOMBIA 📈", "COMISIONES", "Quiero ser Socio", "agendaclick.com.co/socios")
    ),
    (
        os.path.join(SOCIOS_DIR, "promo_3_negocio_real.jpg"),
        make_layout(FLYER_SOCIOS_3_CONTENT, "SOFTWARE B2B CON CLIENTES REALES EN COLOMBIA 🏢", "LEGÍTIMO", "Unirme al Programa", "agendaclick.com.co/socios")
    ),
    (
        os.path.join(SOCIOS_DIR, "promo_4_distribuidor_oficial.jpg"),
        make_layout(FLYER_SOCIOS_4_CONTENT, "KIT OFICIAL DE DISTRIBUIDOR CON CRM EN VIVO 💼", "KIT PRO", "Comenzar a Ganar", "agendaclick.com.co/socios")
    ),
]

print("Iniciando renderizado de las 8 piezas publicitarias con el estilo auténtico de AgendaClick...")
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
    print(f"✓ Generado con éxito: {out_path} ({os.path.getsize(out_path)} bytes)")

print("\n¡Las 8 piezas gráficas han sido completamente regeneradas con la identidad visual real de AgendaClick (Blanco, Negro, Verde Esmeralda, Logo Oficial y WhatsApp)! ✨")
