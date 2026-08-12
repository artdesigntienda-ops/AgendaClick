-- =====================================================
-- AgendaClick: Nuevas columnas para personalización visual
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Columnas para personalización del Dashboard (Sidebar)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS sidebar_color TEXT DEFAULT '#111827';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS sidebar_text_color TEXT DEFAULT '#9ca3af';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS dashboard_accent_color TEXT DEFAULT '#10b981';

-- Columnas para personalización de la Página Pública de Reservas
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS booking_bg_color TEXT DEFAULT '#f9fafb';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS booking_text_color TEXT DEFAULT '#111827';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS booking_card_color TEXT DEFAULT '#ffffff';

-- =====================================================
-- NOTA: Estas columnas son opcionales y tienen valores
-- por defecto, así que los negocios existentes NO se
-- verán afectados. Solo se aplicarán los colores
-- personalizados cuando el admin los cambie en Settings.
-- =====================================================
