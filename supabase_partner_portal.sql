-- =============================================================================
-- MIGRACIÓN SQL: PORTAL DE SOCIOS, DISTRIBUIDORES Y ASESORES COMERCIALES
-- =============================================================================

-- 1. Agregar columna para vincular una clínica/negocio al socio comercial que lo refirió
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS referred_by_partner_id UUID REFERENCES public.profiles(id);

-- 2. Agregar columnas de socio/distribuidor en profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS partner_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS partner_commission_rate NUMERIC DEFAULT 25.0,
ADD COLUMN IF NOT EXISTS bank_payout_info JSONB;

-- 3. Asignar códigos de socio iniciales a perfiles existentes si no tienen
UPDATE public.profiles
SET partner_code = UPPER(SUBSTRING(COALESCE(name, email) FROM 1 FOR 4) || '-' || SUBSTRING(id::text FROM 1 FOR 4))
WHERE partner_code IS NULL;
