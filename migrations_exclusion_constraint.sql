-- =============================================================================
-- MIGRACIÓN DE EXCLUSIÓN POSTGRESQL PARA CITAS ACTIVAS (AGENDA CLICK)
-- =============================================================================
-- Previene double-booking a nivel de base de datos impidiendo que dos citas
-- compartan el mismo rango de tiempo para la misma clínica y staff.
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS prevent_overlapping_appointments;

ALTER TABLE public.appointments
ADD CONSTRAINT prevent_overlapping_appointments
EXCLUDE USING gist (
  clinic_id WITH =,
  COALESCE(staff_id, '00000000-0000-0000-0000-000000000000'::uuid) WITH =,
  tstzrange(start_time, end_time) WITH &&
)
WHERE (status != 'cancelled');

COMMIT;
