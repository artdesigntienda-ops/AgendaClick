-- =============================================================================
-- MIGRACIÓN DE BASE DE DATOS: COLUMNAS DE PERSONALIZACIÓN Y NOTAS
-- Ejecuta este script en el editor SQL de Supabase (SQL Editor)
-- para agregar las columnas necesarias de color, tipografía y notas clínicas.
-- =============================================================================

ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#10b981';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Outfit';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT;
