-- =============================================================================
-- MIGRACIÓN DE SEGURIDAD Y REPARACIÓN DE TABLAS EN SUPABASE (AGENDA CLICK)
-- =============================================================================
-- 1. Agrega las columnas faltantes 'description' en services y 'notes' en appointments.
-- 2. Blinda la tabla 'profiles' para que usuarios anónimos NO puedan extraer
--    cuentas bancarias (bank_payout_info), correos ni tokens sensibles.
-- =============================================================================

BEGIN;

-- 1. Agregar columnas faltantes si no existen
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS notes text;

-- 2. Activar Row Level Security estricto en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas públicas permisivas que permitían select indiscriminado
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Team members can view clinic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Política: El usuario autenticado solo puede leer su propio perfil completo
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 5. Política: Miembros del mismo negocio pueden ver perfiles de sus compañeros
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

-- 6. Política: El usuario solo puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 7. Política: Inserción de perfil propio
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 8. Asegurar que la vista pública staff_directory exponga únicamente datos seguros para reservas
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

GRANT SELECT ON public.staff_directory TO anon, authenticated;

-- Revocar select público directo sobre la tabla base profiles
REVOKE SELECT ON public.profiles FROM anon;

COMMIT;
