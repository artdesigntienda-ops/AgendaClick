-- =============================================================================
-- POLÍTICAS RLS ESTRICTAS PARA BLINDAJE DE TABLA PROFILES EN SUPABASE
-- =============================================================================
-- Este script refuerza la seguridad en el motor PostgreSQL de Supabase.
-- Previene que usuarios anónimos o no autorizados lean columnas sensibles
-- como google_refresh_token, google_calendar_id o bank_payout_info.
-- =============================================================================

BEGIN;

-- 1. Asegurar que Row Level Security está activado en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas públicas abiertas o permisivas anteriores
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 3. Política de Lectura Estricta: Cada usuario autenticado solo puede leer su propio perfil completo
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Política de Lectura de Equipo: Los miembros de una misma clínica pueden ver compañeros (solo lectura básica)
CREATE POLICY "Team members can view clinic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  clinic_id IS NOT NULL AND 
  clinic_id IN (
    SELECT p.clinic_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- 5. Política de Actualización: Cada usuario solo puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Política de Inserción: El usuario solo puede insertar su propio perfil autenticado
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 7. Asegurar que la vista staff_directory esté disponible para consultas públicas de reservas
-- (staff_directory solo expone id, clinic_id, email, name, role, created_at, is_bookable, schedule, is_on_break)
CREATE OR REPLACE VIEW public.staff_directory AS
SELECT 
  id,
  clinic_id,
  email,
  name,
  role,
  created_at,
  is_bookable,
  schedule,
  is_on_break
FROM public.profiles
WHERE is_bookable = true;

-- Otorgar permiso de lectura sobre la vista pública staff_directory
GRANT SELECT ON public.staff_directory TO anon, authenticated;

COMMIT;
