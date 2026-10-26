const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const artifactDir = '/home/rocua/.gemini/antigravity/brain/e24322d5-fcf3-4dc1-bf51-759fe4ccafdd';
const publicDir = path.join(__dirname, '..', 'public', 'promos');

// Ensure directories
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const banners = [
  {
    id: 'opcion_1_dinero_tangible',
    title: 'Opción 1: Dinero Tangible en Pesos',
    filename: 'agendaclick_opcion_1_dinero_tangible.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #070B14;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .bg-glow-1 {
    position: absolute;
    top: -150px;
    right: -150px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .bg-glow-2 {
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #10B981, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 25px rgba(16,185,129,0.5);
  }
  .logo-text {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.5px;
  }
  .logo-text span { color: #10B981; }
  .badge-colombia {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(16,185,129,0.4);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 700;
    color: #34D399;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-tag {
    display: inline-block;
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.3);
    color: #10B981;
    font-size: 15px;
    font-weight: 800;
    padding: 6px 16px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .main-title {
    font-size: 54px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -1.5px;
    margin-bottom: 14px;
  }
  .main-title span {
    background: linear-gradient(90deg, #34D399, #10B981, #6EE7B7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-size: 20px;
    color: #94A3B8;
    line-height: 1.4;
    margin-bottom: 30px;
  }
  .cards-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    z-index: 2;
  }
  .income-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 22px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }
  .income-card.highlight {
    background: linear-gradient(90deg, rgba(16,185,129,0.18), rgba(6,78,59,0.25));
    border: 1.5px solid rgba(16,185,129,0.6);
    box-shadow: 0 12px 35px rgba(16,185,129,0.25);
  }
  .card-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(16,185,129,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .card-label {
    font-size: 15px;
    color: #94A3B8;
    font-weight: 600;
  }
  .card-name {
    font-size: 22px;
    font-weight: 800;
    color: #FFFFFF;
  }
  .card-amount {
    font-size: 32px;
    font-weight: 900;
    color: #10B981;
    letter-spacing: -0.5px;
    text-align: right;
  }
  .card-subtext {
    font-size: 13px;
    color: #64748B;
    text-align: right;
    font-weight: 600;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 25px;
    border-top: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 2;
  }
  .payment-methods {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .pay-tag {
    font-size: 13px;
    color: #64748B;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .pay-badge {
    background: #1E293B;
    border: 1px solid rgba(255,255,255,0.1);
    color: #E2E8F0;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 8px;
  }
  .cta-pill {
    background: #10B981;
    color: #000000;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 30px;
    border-radius: 100px;
    box-shadow: 0 0 30px rgba(16,185,129,0.5);
  }
</style>
</head>
<body>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>

  <div class="header">
    <div class="logo-box">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">Agenda<span>Click</span></div>
    </div>
    <div class="badge-colombia">🇨🇴 Programa Oficial Colombia</div>
  </div>

  <div>
    <div class="hero-tag">Dinero Real y Tangible</div>
    <div class="main-title">Gana Ingresos Pasivos<br><span>Sin Cifras Engañosas</span></div>
    <div class="subtitle">Recomienda AgendaClick a peluquerías, barberías y estéticas de tu ciudad y cobra mes tras mes.</div>
  </div>

  <div class="cards-grid">
    <div class="income-card">
      <div class="card-left">
        <div class="card-icon">💈</div>
        <div>
          <div class="card-label">Por cada 1 negocio que vincules</div>
          <div class="card-name">1 Negocio Activo</div>
        </div>
      </div>
      <div>
        <div class="card-amount">Hasta $244.000 COP</div>
        <div class="card-subtext">Mensual Recurrente</div>
      </div>
    </div>

    <div class="income-card highlight">
      <div class="card-left">
        <div class="card-icon">🚀</div>
        <div>
          <div class="card-label">Meta recomendada para iniciar</div>
          <div class="card-name">5 Negocios Activos</div>
        </div>
      </div>
      <div>
        <div class="card-amount">+$1.200.000 COP</div>
        <div class="card-subtext">Mes a Mes en Automático</div>
      </div>
    </div>

    <div class="income-card">
      <div class="card-left">
        <div class="card-icon">💼</div>
        <div>
          <div class="card-label">Ingreso de dedicación comercial</div>
          <div class="card-name">10 Negocios Activos</div>
        </div>
      </div>
      <div>
        <div class="card-amount">+$2.400.000 COP</div>
        <div class="card-subtext">Sin Cumplir Horarios</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="payment-methods">
      <span class="pay-tag">Pagos a:</span>
      <span class="pay-badge">Nequi</span>
      <span class="pay-badge">Daviplata</span>
      <span class="pay-badge">Bancolombia</span>
    </div>
    <div class="cta-pill">Únete en agendaclick.com.co/socios</div>
  </div>
</body>
</html>`
  },
  {
    id: 'opcion_2_modelo_hibrido',
    title: 'Opción 2: El Modelo Híbrido (100% Primer Mes + Mensualidad)',
    filename: 'agendaclick_opcion_2_modelo_hibrido.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #0A0D18;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .bg-glow-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #10B981, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 25px rgba(16,185,129,0.5);
  }
  .logo-text {
    font-size: 28px;
    font-weight: 900;
  }
  .logo-text span { color: #10B981; }
  .badge-hibrido {
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.4);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 800;
    color: #FACC15;
  }
  .center-content {
    position: relative;
    z-index: 2;
  }
  .tagline {
    color: #10B981;
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }
  .headline {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 30px;
  }
  .headline span {
    color: #FACC15;
  }
  .offer-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  .offer-box {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 32px 28px;
    position: relative;
  }
  .offer-box.primary {
    border: 2px solid #FACC15;
    background: linear-gradient(180deg, rgba(234, 179, 8, 0.1), rgba(15, 23, 42, 0.9));
    box-shadow: 0 15px 35px rgba(234, 179, 8, 0.15);
  }
  .offer-box.secondary {
    border: 2px solid #10B981;
    background: linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.9));
    box-shadow: 0 15px 35px rgba(16, 185, 129, 0.15);
  }
  .box-badge {
    position: absolute;
    top: -14px;
    left: 28px;
    padding: 4px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .box-badge.gold { background: #FACC15; color: #000; }
  .box-badge.green { background: #10B981; color: #000; }
  .box-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 12px;
    margin-top: 6px;
  }
  .box-amount {
    font-size: 42px;
    font-weight: 900;
    margin-bottom: 10px;
    letter-spacing: -1px;
  }
  .box-amount.gold { color: #FACC15; }
  .box-amount.green { color: #10B981; }
  .box-desc {
    font-size: 14px;
    color: #94A3B8;
    line-height: 1.4;
  }
  .benefit-strip {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .benefit-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: #E2E8F0;
  }
  .check-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #10B981;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 900;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 25px;
    border-top: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 2;
  }
  .nequi-pill {
    background: #200B3B;
    border: 1px solid #7C3AED;
    color: #E9D5FF;
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 800;
  }
  .cta-button {
    background: #10B981;
    color: #000;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 32px;
    border-radius: 100px;
    box-shadow: 0 0 25px rgba(16,185,129,0.4);
  }
</style>
</head>
<body>
  <div class="bg-glow-center"></div>

  <div class="header">
    <div class="logo-box">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">Agenda<span>Click</span></div>
    </div>
    <div class="badge-hibrido">🔥 El Modelo Más Rentable</div>
  </div>

  <div class="center-content">
    <div class="tagline">Para Comerciales que Buscan Resultados</div>
    <div class="headline">Dinero de Inmediato <span>Hoy</span><br>+ Renta Pasiva <span>de por Vida</span></div>

    <div class="offer-split">
      <div class="offer-box primary">
        <div class="box-badge gold">1. Liquidez Inmediata</div>
        <div class="box-title">El 100% del 1er Mes</div>
        <div class="box-amount gold">$189.000 a $349.000</div>
        <div class="box-desc">Todo el primer pago del cliente va 100% a tu bolsillo el mismo día de la venta. Dinero en mano sin esperar.</div>
      </div>

      <div class="offer-box secondary">
        <div class="box-badge green">2. Ingreso Residual</div>
        <div class="box-title">30% Mensual de por Vida</div>
        <div class="box-amount green">+$$$ Cada Mes</div>
        <div class="box-desc">Desde el mes 2 en adelante, sigues cobrando el 30% recurrente de por vida mientras el negocio use la app.</div>
      </div>
    </div>

    <div class="benefit-strip">
      <div class="benefit-item">
        <div class="check-icon">✓</div>
        <span>Cero Inversión ($0 COP)</span>
      </div>
      <div class="benefit-item">
        <div class="check-icon">✓</div>
        <span>Demo interactiva lista</span>
      </div>
      <div class="benefit-item">
        <div class="check-icon">✓</div>
        <span>Pagos directos a Nequi</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="nequi-pill">📲 Pagos a Nequi, Daviplata o Banco</div>
    <div class="cta-button">Regístrate en agendaclick.com.co/socios</div>
  </div>
</body>
</html>`
  },
  {
    id: 'opcion_3_modelo_escalonado',
    title: 'Opción 3: Modelo Escalonado por Metas (Carrera Comercial)',
    filename: 'agendaclick_opcion_3_modelo_escalonado.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #080C16;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .bg-glow-right {
    position: absolute;
    top: 20%;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #10B981, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 25px rgba(16,185,129,0.5);
  }
  .logo-text { font-size: 28px; font-weight: 900; }
  .logo-text span { color: #10B981; }
  .badge-plan {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.4);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 800;
    color: #34D399;
  }
  .title-section {
    position: relative;
    z-index: 2;
  }
  .tagline {
    color: #10B981;
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
  }
  .headline {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }
  .headline span { color: #10B981; }
  .subtitle { font-size: 18px; color: #94A3B8; }
  .tiers-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 2;
  }
  .tier-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 20px 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tier-card.elite {
    background: linear-gradient(90deg, rgba(16,185,129,0.18), rgba(15,23,42,0.8));
    border: 1.5px solid rgba(16,185,129,0.7);
    box-shadow: 0 10px 30px rgba(16,185,129,0.25);
  }
  .tier-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .tier-badge-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .tier-bronze { background: rgba(205, 127, 50, 0.2); border: 1px solid rgba(205, 127, 50, 0.5); }
  .tier-silver { background: rgba(192, 192, 192, 0.2); border: 1px solid rgba(192, 192, 192, 0.5); }
  .tier-gold { background: rgba(16, 185, 129, 0.3); border: 1.5px solid #10B981; box-shadow: 0 0 20px rgba(16,185,129,0.4); }
  .tier-name {
    font-size: 20px;
    font-weight: 800;
  }
  .tier-meta {
    font-size: 13px;
    color: #94A3B8;
    font-weight: 600;
  }
  .tier-rate {
    font-size: 36px;
    font-weight: 900;
    color: #FFFFFF;
    text-align: right;
  }
  .tier-rate.gold { color: #10B981; }
  .tier-rate-sub {
    font-size: 12px;
    color: #64748B;
    text-align: right;
    font-weight: 700;
    text-transform: uppercase;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 25px;
    border-top: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 2;
  }
  .trust-label {
    font-size: 14px;
    color: #94A3B8;
    font-weight: 700;
  }
  .cta-button {
    background: #10B981;
    color: #000;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 32px;
    border-radius: 100px;
    box-shadow: 0 0 25px rgba(16,185,129,0.4);
  }
</style>
</head>
<body>
  <div class="bg-glow-right"></div>

  <div class="header">
    <div class="logo-box">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">Agenda<span>Click</span></div>
    </div>
    <div class="badge-plan">📈 Carrera Comercial 2026</div>
  </div>

  <div class="title-section">
    <div class="tagline">Transparencia y Crecimiento Real</div>
    <div class="headline">Sube de Nivel y Multiplica<br><span>Tus Comisiones Mensuales</span></div>
    <div class="subtitle">Sin límites de crecimiento. Entre más negocios afilies, mayor es tu comisión recurrente.</div>
  </div>

  <div class="tiers-container">
    <div class="tier-card">
      <div class="tier-left">
        <div class="tier-badge-icon tier-bronze">🥉</div>
        <div>
          <div class="tier-name">Asesor Junior</div>
          <div class="tier-meta">1 a 3 negocios activos</div>
        </div>
      </div>
      <div>
        <div class="tier-rate">30%</div>
        <div class="tier-rate-sub">Mensual Recurrente</div>
      </div>
    </div>

    <div class="tier-card">
      <div class="tier-left">
        <div class="tier-badge-icon tier-silver">🥈</div>
        <div>
          <div class="tier-name">Distribuidor Plata</div>
          <div class="tier-meta">4 a 8 negocios activos</div>
        </div>
      </div>
      <div>
        <div class="tier-rate">45%</div>
        <div class="tier-rate-sub">Mensual Recurrente</div>
      </div>
    </div>

    <div class="tier-card elite">
      <div class="tier-left">
        <div class="tier-badge-icon tier-gold">🥇</div>
        <div>
          <div class="tier-name">Embajador Élite</div>
          <div class="tier-meta">9+ negocios + Bono de Cumplimiento</div>
        </div>
      </div>
      <div>
        <div class="tier-rate gold">60% + Bono</div>
        <div class="tier-rate-sub">Máxima Rentabilidad</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="trust-label">🛡️ Carrera 100% legítima sin letras chiquitas</div>
    <div class="cta-button">Inicia hoy en agendaclick.com.co/socios</div>
  </div>
</body>
</html>`
  },
  {
    id: 'opcion_4_agencia_digital',
    title: 'Opción 4: Monta tu Agencia de Digitalización (Estatus de Negocio)',
    filename: 'agendaclick_opcion_4_agencia_digital.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #080C14;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .bg-glow-left {
    position: absolute;
    top: -100px;
    left: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%);
    pointer-events: none;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #10B981, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 25px rgba(16,185,129,0.5);
  }
  .logo-text { font-size: 28px; font-weight: 900; }
  .logo-text span { color: #10B981; }
  .badge-agency {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.4);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 800;
    color: #60A5FA;
  }
  .center-section {
    position: relative;
    z-index: 2;
  }
  .tagline {
    color: #60A5FA;
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }
  .headline {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 14px;
  }
  .headline span { color: #10B981; }
  .subtitle {
    font-size: 19px;
    color: #94A3B8;
    line-height: 1.4;
    margin-bottom: 28px;
  }
  .agency-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .ag-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 26px 24px;
  }
  .ag-card.highlight {
    background: linear-gradient(180deg, rgba(16,185,129,0.15), rgba(15,23,42,0.85));
    border: 1.5px solid #10B981;
  }
  .ag-step {
    font-size: 12px;
    font-weight: 800;
    color: #10B981;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .ag-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 10px;
  }
  .ag-price {
    font-size: 32px;
    font-weight: 900;
    color: #FFFFFF;
    margin-bottom: 8px;
  }
  .ag-price.green { color: #10B981; }
  .ag-desc {
    font-size: 14px;
    color: #94A3B8;
    line-height: 1.4;
  }
  .client-types {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .client-types span {
    font-size: 14px;
    font-weight: 700;
    color: #CBD5E1;
  }
  .client-chips {
    display: flex;
    gap: 8px;
  }
  .chip {
    background: #1E293B;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #E2E8F0;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 25px;
    border-top: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 2;
  }
  .tech-label {
    font-size: 14px;
    color: #94A3B8;
    font-weight: 700;
  }
  .cta-button {
    background: #10B981;
    color: #000;
    font-size: 17px;
    font-weight: 900;
    padding: 14px 32px;
    border-radius: 100px;
    box-shadow: 0 0 25px rgba(16,185,129,0.4);
  }
</style>
</head>
<body>
  <div class="bg-glow-left"></div>

  <div class="header">
    <div class="logo-box">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">Agenda<span>Click</span></div>
    </div>
    <div class="badge-agency">💼 Estatus de Consultor Digital</div>
  </div>

  <div class="center-section">
    <div class="tagline">Sin Saber Programar</div>
    <div class="headline">Monta Tu Propia Agencia de<br><span>Digitalización de Negocios</span></div>
    <div class="subtitle">Tú eres el consultor tecnológico de tu ciudad. Nosotros te entregamos el software y tú cobras dos veces por cada cliente.</div>

    <div class="agency-cards">
      <div class="ag-card">
        <div class="ag-step">Ganancia 1 • Pago Inmediato</div>
        <div class="ag-title">Setup e Instalación</div>
        <div class="ag-price">$100.000 a $200.000 COP</div>
        <div class="ag-desc">Cobras por configurar el menú, fotos y enlace de WhatsApp del salón. Este valor es 100% tuyo de inmediato.</div>
      </div>

      <div class="ag-card highlight">
        <div class="ag-step">Ganancia 2 • Ingreso Residual</div>
        <div class="ag-title">Comisión Mensual</div>
        <div class="ag-price green">Mensualidad Recurrente</div>
        <div class="ag-desc">Cobras mes tras mes la comisión de suscripción de la plataforma por cada cliente que mantengas activo.</div>
      </div>
    </div>

    <div class="client-types">
      <span>Mercado listo para digitalizar:</span>
      <div class="client-chips">
        <div class="chip">Peluquerías</div>
        <div class="chip">Barberías</div>
        <div class="chip">Estéticas & Spas</div>
        <div class="chip">Consultorios</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="tech-label">⚡ Tecnología SaaS lista para revender en Colombia</div>
    <div class="cta-button">Conviértete en Socio en agendaclick.com.co/socios</div>
  </div>
</body>
</html>`
  }
];

async function generateAll() {
  console.log('🚀 Iniciando renderizado de alta definición para las 4 opciones publicitarias...\n');

  for (const b of banners) {
    const tempHtml = path.join('/tmp', `banner_${b.id}.html`);
    const artifactPath = path.join(artifactDir, b.filename);
    const publicPath = path.join(publicDir, b.filename);

    fs.writeFileSync(tempHtml, b.html, 'utf8');

    console.log(`📸 Renderizando: ${b.title}...`);
    execSync(`google-chrome --headless --no-sandbox --disable-gpu --screenshot="${artifactPath}" --window-size=1080,1080 "${tempHtml}"`);
    
    // Copy to public/promos
    fs.copyFileSync(artifactPath, publicPath);

    console.log(`   ✅ Guardado en: ${artifactPath}`);
    console.log(`   🌐 Disponible en: /promos/${b.filename}\n`);
  }

  console.log('🎉 ¡Las 4 piezas publicitarias fueron renderizadas con éxito en 1080x1080!');
}

generateAll().catch(console.error);
