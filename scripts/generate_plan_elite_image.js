const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const artifactDir = '/home/rocua/.gemini/antigravity/brain/e24322d5-fcf3-4dc1-bf51-759fe4ccafdd';
const publicDir = path.join(__dirname, '..', 'public', 'promos');

fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const planEliteHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Producto: Plan Élite AgendaClick</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #060913;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 56px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  /* Background glow effects */
  .glow-top-right {
    position: absolute;
    top: -160px;
    right: -160px;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 50%, transparent 70%);
    pointer-events: none;
  }
  .glow-bottom-left {
    position: absolute;
    bottom: -180px;
    left: -180px;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%);
    pointer-events: none;
  }
  .glow-center {
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(16, 185, 129, 0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Grid overlay subtle texture */
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.55), inset 0 1px 1px rgba(255,255,255,0.4);
  }
  .brand-name {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.6px;
  }
  .brand-name span {
    color: #10B981;
  }
  .header-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #E2E8F0;
    backdrop-filter: blur(10px);
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10B981;
  }

  /* Main Hero / Banner Body */
  .hero-card {
    position: relative;
    z-index: 2;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.75) 0%, rgba(11, 15, 25, 0.95) 100%);
    border: 1px solid rgba(245, 158, 11, 0.35);
    border-radius: 28px;
    padding: 38px 44px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.1);
  }
  .hero-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  .plan-tier-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.12));
    border: 1px solid rgba(245, 158, 11, 0.5);
    color: #FBBF24;
    font-size: 14px;
    font-weight: 800;
    padding: 8px 18px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
  .plan-title {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -1.8px;
    margin-top: 12px;
    margin-bottom: 10px;
  }
  .plan-title .gold-gradient {
    background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .plan-subtitle {
    font-size: 19px;
    color: #94A3B8;
    font-weight: 500;
    max-width: 580px;
    line-height: 1.4;
  }

  /* Price tag container */
  .price-box {
    text-align: right;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 18px 24px;
    border-radius: 20px;
    min-width: 270px;
  }
  .price-label {
    font-size: 12px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 4px;
  }
  .price-amount {
    font-size: 42px;
    font-weight: 900;
    color: #10B981;
    letter-spacing: -1.2px;
    line-height: 1;
    text-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
  }
  .price-amount span {
    font-size: 20px;
    font-weight: 700;
    color: #6EE7B7;
  }
  .price-period {
    font-size: 13px;
    color: #CBD5E1;
    margin-top: 6px;
    font-weight: 600;
  }
  .discount-tag {
    display: inline-block;
    background: rgba(16, 185, 129, 0.2);
    color: #34D399;
    font-size: 11px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 6px;
    margin-top: 4px;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 10px;
  }
  .feat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 18px;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;
  }
  .feat-card.highlight {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    border-color: rgba(16, 185, 129, 0.35);
  }
  .feat-card.gold-highlight {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    border-color: rgba(245, 158, 11, 0.35);
  }
  .feat-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 2px;
  }
  .feat-icon-green {
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  .feat-icon-gold {
    background: rgba(245, 158, 11, 0.18);
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  .feat-title {
    font-size: 16px;
    font-weight: 800;
    color: #F8FAFC;
    letter-spacing: -0.3px;
  }
  .feat-desc {
    font-size: 13px;
    color: #94A3B8;
    line-height: 1.4;
    font-weight: 500;
  }

  /* Target industries strip */
  .target-strip {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 16px 26px;
  }
  .target-label {
    font-size: 13px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .target-pills {
    display: flex;
    gap: 10px;
  }
  .target-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #E2E8F0;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 100px;
  }

  /* Footer */
  .footer {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .trust-marks {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: #94A3B8;
    font-weight: 600;
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .trust-item span {
    color: #34D399;
  }
  .cta-box {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .url-label {
    text-align: right;
  }
  .url-domain {
    font-size: 18px;
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: -0.4px;
  }
  .url-domain span {
    color: #10B981;
  }
  .cta-btn {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 800;
    padding: 14px 28px;
    border-radius: 14px;
    letter-spacing: -0.2px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255,255,255,0.4);
  }
</style>
</head>
<body>
  <div class="glow-top-right"></div>
  <div class="glow-bottom-left"></div>
  <div class="glow-center"></div>
  <div class="grid-bg"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <div class="brand-name">Agenda<span>Click</span></div>
    </div>
    <div class="header-badge">
      <div class="badge-dot"></div>
      <span>CATÁLOGO OFICIAL GOOGLE BUSINESS</span>
      <span>🇨🇴 COLOMBIA</span>
    </div>
  </div>

  <!-- Main Hero Card -->
  <div class="hero-card">
    <div class="hero-top-row">
      <div>
        <div class="plan-tier-pill">
          <span>👑</span> NIVEL CORPORATIVO • PLAN PRODUCTO 4
        </div>
        <h1 class="plan-title">
          Plan <span class="gold-gradient">Élite</span>
        </h1>
        <p class="plan-subtitle">
          La infraestructura definitiva de agendamiento para grandes franquicias, cadenas de clínicas y empresas de alto volumen.
        </p>
      </div>

      <div class="price-box">
        <div class="price-label">Inversión Mensual</div>
        <div class="price-amount">$499.000 <span>COP</span></div>
        <div class="price-period">Precio final sin sorpresas</div>
        <div class="discount-tag">10% OFF en Plan Anual</div>
      </div>
    </div>

    <!-- Features 6-Grid -->
    <div class="features-grid">
      <div class="feat-card gold-highlight">
        <div class="feat-icon-wrapper feat-icon-gold">🚀</div>
        <div class="feat-title">Staff Ilimitado (999+)</div>
        <div class="feat-desc">Agrega todos los profesionales, técnicos, médicos o bahías que tu operación requiera sin cargos extra.</div>
      </div>

      <div class="feat-card highlight">
        <div class="feat-icon-wrapper feat-icon-green">🏢</div>
        <div class="feat-title">Multi-Sede Unificada</div>
        <div class="feat-desc">Controla múltiples sucursales, ciudades y puntos de venta desde un único panel administrativo.</div>
      </div>

      <div class="feat-card">
        <div class="feat-icon-wrapper feat-icon-green">🏷️</div>
        <div class="feat-title">100% Marca Blanca</div>
        <div class="feat-desc">Tu logotipo, colores corporativos y dominio sin marcas de agua de AgendaClick para tus clientes.</div>
      </div>

      <div class="feat-card">
        <div class="feat-icon-wrapper feat-icon-gold">🛡️</div>
        <div class="feat-title">SLA 99.9% + Soporte VIP</div>
        <div class="feat-desc">Disponibilidad contractual garantizada y línea directa dedicada 24/7 con respuesta inmediata.</div>
      </div>

      <div class="feat-card highlight">
        <div class="feat-icon-wrapper feat-icon-green">🤝</div>
        <div class="feat-title">Onboarding Asistido</div>
        <div class="feat-desc">Un consultor experto de AgendaClick migra y configura todo tu catálogo de servicios y equipo de trabajo.</div>
      </div>

      <div class="feat-card">
        <div class="feat-icon-wrapper feat-icon-green">💳</div>
        <div class="feat-title">Pagos & Finanzas Pro</div>
        <div class="feat-desc">Cálculo automático de comisiones de staff, liquidación de nómina y cobros online con Wompi/Bold.</div>
      </div>
    </div>
  </div>

  <!-- Target Audience Strip -->
  <div class="target-strip">
    <div class="target-label">
      <span>🎯 Diseñado para:</span>
    </div>
    <div class="target-pills">
      <div class="target-pill">Franquicias de Belleza</div>
      <div class="target-pill">Clínicas & Centros Médicos</div>
      <div class="target-pill">Talleres y Concesionarios</div>
      <div class="target-pill">Clubes & Complejos Deportivos</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="trust-marks">
      <div class="trust-item"><span>✓</span> Activación Inmediata</div>
      <div class="trust-item"><span>✓</span> Sin Cláusulas de Permanencia</div>
      <div class="trust-item"><span>✓</span> 100% en Pesos Colombianos</div>
    </div>
    <div class="cta-box">
      <div class="url-label">
        <div class="url-domain">agendaclick.com.co</div>
      </div>
      <div class="cta-btn">Solicitar Demo Élite</div>
    </div>
  </div>
</body>
</html>`;

async function main() {
  const tempHtml = '/tmp/plan_elite_catalog.html';
  const artifactPath = path.join(artifactDir, 'agendaclick_producto_plan_elite.png');
  const publicPath = path.join(publicDir, 'agendaclick_producto_plan_elite.png');

  fs.writeFileSync(tempHtml, planEliteHtml, 'utf8');

  console.log('📸 Renderizando imagen oficial de Google Business para Plan Élite (1080x1080)...');
  execSync(`google-chrome --headless --no-sandbox --disable-gpu --screenshot="${artifactPath}" --window-size=1080,1080 "${tempHtml}"`);

  // Copy to public/promos
  fs.copyFileSync(artifactPath, publicPath);

  console.log(`✅ Imagen renderizada con éxito:`);
  console.log(`   📁 Artifact: ${artifactPath}`);
  console.log(`   🌐 Public: ${publicPath}`);
}

main().catch(console.error);
