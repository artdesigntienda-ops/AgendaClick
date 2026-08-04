-- =============================================================================
-- SCRIPT DE BASE DE DATOS: USUARIO DEMO Y SIMULACIÓN COMPLETA (SUPABASE)
-- Correo del Administrador: j4150nrodriguez@gmail.com
-- Contraseña de Acceso por defecto: JaisonDemo123*
-- =============================================================================

BEGIN;

-- 1. DEFINICIÓN DE VARIABLES DE IDENTIFICACIÓN
DO $$
DECLARE
    v_user_id uuid := '78474838-4229-4331-b023-e17847482602';
    v_clinic_id uuid := 'c1111111-1111-1111-1111-111111111111';
    v_staff_1_id uuid := 'a2222222-2222-2222-2222-222222222222';
    v_staff_2_id uuid := 'b3333333-3333-3333-3333-333333333333';
    
    v_service_psicologia uuid := 'f1111111-1111-1111-1111-111111111111';
    v_service_odontologia uuid := 'f2222222-2222-2222-2222-222222222222';
    v_service_quiropráctica uuid := 'f3333333-3333-3333-3333-333333333333';
    v_service_general uuid := 'f4444444-4444-4444-4444-444444444444';
    
    v_user_exists boolean;
    v_encrypted_password text;
    v_schedule_json jsonb;
    v_staff_schedule_json jsonb;
BEGIN
    -- Generar hash bcrypt seguro para la contraseña 'JaisonDemo123*'
    v_encrypted_password := extensions.crypt('JaisonDemo123*', extensions.gen_salt('bf', 10));

    -- Definición de horario comercial estándar para la clínica
    v_schedule_json := '{
        "monday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00", "breakStart": "12:00", "breakEnd": "14:00"},
        "tuesday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00", "breakStart": "12:00", "breakEnd": "14:00"},
        "wednesday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00", "breakStart": "12:00", "breakEnd": "14:00"},
        "thursday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00", "breakStart": "12:00", "breakEnd": "14:00"},
        "friday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00", "breakStart": "12:00", "breakEnd": "14:00"},
        "saturday": {"isOpen": true, "openTime": "08:00", "closeTime": "13:00", "breakStart": null, "breakEnd": null},
        "sunday": {"isOpen": false, "openTime": "09:00", "closeTime": "17:00", "breakStart": null, "breakEnd": null}
    }'::jsonb;

    v_staff_schedule_json := '{
        "useClinicSchedule": true
    }'::jsonb;

    -- 2. VERIFICACIÓN Y CREACIÓN DEL USUARIO DUEÑO EN AUTH.USERS (Si no existe)
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'j4150nrodriguez@gmail.com') INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at, 
            invited_at, confirmation_token, confirmation_sent_at, recovery_token, 
            recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, 
            last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, 
            created_at, updated_at, phone, phone_confirmed_at, phone_change, 
            phone_change_sent_at, confirmed_at, email_change_confirm_status, 
            banned_until, reauthentication_token, reauthentication_sent_at, 
            is_sso_user, deleted_at, aud, role
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000', 'j4150nrodriguez@gmail.com', v_encrypted_password, now(),
            NULL, '', NULL, '', NULL, '', '', NULL, now(), 
            '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dr. Jaison Rodríguez"}'::jsonb, false, 
            now(), now(), NULL, NULL, '', NULL, now(), 0, NULL, '', NULL, false, NULL, 'authenticated', 'authenticated'
        );
    ELSE
        -- Si existe, actualizamos su ID para la sincronización con el script de mock data
        SELECT id FROM auth.users WHERE email = 'j4150nrodriguez@gmail.com' INTO v_user_id;
    END IF;

    -- 3. CREAR O ACTUALIZAR LA CLÍNICA CON SUSCRIPCIÓN ETERNA (Hasta 2099)
    -- Eliminación en cascada previa para evitar llaves duplicadas de simulación
    DELETE FROM public.appointments WHERE clinic_id = v_clinic_id OR clinic_id IN (SELECT id FROM public.clinics WHERE owner_id = v_user_id);
    DELETE FROM public.services WHERE clinic_id = v_clinic_id OR clinic_id IN (SELECT id FROM public.clinics WHERE owner_id = v_user_id);
    DELETE FROM public.profiles WHERE id IN (v_staff_1_id, v_staff_2_id) OR clinic_id = v_clinic_id;
    DELETE FROM public.clinics WHERE id = v_clinic_id OR owner_id = v_user_id;

    -- Insertar Clínica Premium
    INSERT INTO public.clinics (
        id, owner_id, name, slug, phone, business_type, slogan, 
        address, country, state, city, neighborhood, latitude, longitude,
        subscription_status, subscription_ends_at, staff_limit, schedule
    ) VALUES (
        v_clinic_id, v_user_id, 'Nexora Consultorios Médicos', 'nexora-salud', '+573239306599', 'medicina_general', 
        'Salud integral y medicina especializada con la tecnología de Nexora',
        'Calle 18 #24-42, Pasto, Nariño, Colombia', 'CO', 'Nariño', 'Pasto', 'Centro', 
        1.213611, -77.281111,
        'active', '2099-12-31 23:59:59+00', 999, v_schedule_json
    );

    -- 4. INSERTAR/ACTUALIZAR PERFIL DEL DUEÑO (Dr. Jaison Rodríguez)
    INSERT INTO public.profiles (
        id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule
    ) VALUES (
        v_user_id, 'Dr. Jaison Rodríguez', 'j4150nrodriguez@gmail.com', 'owner', v_clinic_id, true, false, true, v_staff_schedule_json
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        clinic_id = EXCLUDED.clinic_id,
        is_bookable = EXCLUDED.is_bookable,
        is_on_break = EXCLUDED.is_on_break,
        has_seen_tutorial = EXCLUDED.has_seen_tutorial,
        schedule = EXCLUDED.schedule;

    -- 5. CREAR PROFESIONALES DEL STAFF (Simulados)
    -- Crear cuentas básicas en auth.users si no existen
    IF NOT EXISTS(SELECT 1 FROM auth.users WHERE email = 'carolina.gomez@nexora.co') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
        VALUES (v_staff_1_id, 'carolina.gomez@nexora.co', v_encrypted_password, now(), '{"provider":"email"}'::jsonb, '{"name":"Dra. Carolina Gómez"}'::jsonb, 'authenticated', 'authenticated', now(), now());
    END IF;

    IF NOT EXISTS(SELECT 1 FROM auth.users WHERE email = 'andres.paz@nexora.co') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
        VALUES (v_staff_2_id, 'andres.paz@nexora.co', v_encrypted_password, now(), '{"provider":"email"}'::jsonb, '{"name":"Dr. Andrés Paz"}'::jsonb, 'authenticated', 'authenticated', now(), now());
    END IF;

    -- Insertar perfiles de empleados vinculados a la clínica
    INSERT INTO public.profiles (id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule)
    VALUES 
    (v_staff_1_id, 'Dra. Carolina Gómez', 'carolina.gomez@nexora.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule_json),
    (v_staff_2_id, 'Dr. Andrés Paz', 'andres.paz@nexora.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule_json);

    -- 6. CREAR SERVICIOS MÉDICOS
    INSERT INTO public.services (id, clinic_id, name, duration_minutes, price, created_at)
    VALUES
    (v_service_psicologia, v_clinic_id, 'Consulta Psicológica', 60, 120000, now() - interval '10 days'),
    (v_service_odontologia, v_clinic_id, 'Limpieza Dental Completa', 45, 90000, now() - interval '10 days'),
    (v_service_quiropráctica, v_clinic_id, 'Ajuste Quiropráctico', 30, 80000, now() - interval '10 days'),
    (v_service_general, v_clinic_id, 'Consulta Médica General', 20, 60000, now() - interval '10 days');

    -- 7. SIMULACIÓN DE CITAS (Historial y Próximas reservas)
    -- Nota: Usamos intervalos relativos (now()) para que los datos siempre estén al día sin importar cuándo se ejecute el script
    INSERT INTO public.appointments (clinic_id, service_id, staff_id, client_name, client_email, client_phone, start_time, end_time, status)
    VALUES
    -- Citas completadas (Ayer)
    (v_clinic_id, v_service_psicologia, v_user_id, 'Mariana Delgado', 'mariana.del@gmail.com', '3157849201', now() - interval '1 day 4 hours', now() - interval '1 day 3 hours', 'completed'),
    (v_clinic_id, v_service_odontologia, v_staff_1_id, 'Carlos Restrepo', 'carlos.restre@hotmail.com', '3004561234', now() - interval '1 day 2 hours', now() - interval '1 day 1 hours 15 mins', 'completed'),
    (v_clinic_id, v_service_quiropráctica, v_staff_2_id, 'Sofía Villota', 'sofi.vi@gmail.com', '3219876543', now() - interval '1 day 1 hours', now() - interval '1 day 30 mins', 'completed'),
    
    -- Citas de Hoy (Completadas, confirmadas y pendientes)
    (v_clinic_id, v_service_general, v_staff_2_id, 'Juan David Erazo', 'juan.erazo@outlook.com', '3182547896', now() - interval '3 hours', now() - interval '2 hours 40 mins', 'completed'),
    (v_clinic_id, v_service_psicologia, v_user_id, 'Gabriela Rosero', 'gaby.roser@gmail.com', '3164589721', now() - interval '1 hours', now(), 'completed'),
    (v_clinic_id, v_service_odontologia, v_staff_1_id, 'Diego Jurado', 'diego.j@gmail.com', '3017485962', now() + interval '1 hours', now() + interval '1 hours 45 mins', 'confirmed'),
    (v_clinic_id, v_service_quiropráctica, v_staff_2_id, 'Beatriz Pantoja', 'beatriz.pan@yahoo.com', '3148596321', now() + interval '3 hours', now() + interval '3 hours 30 mins', 'confirmed'),
    (v_clinic_id, v_service_general, v_staff_1_id, 'Felipe Guerrero', 'felipe.gue@gmail.com', '3104523698', now() + interval '4 hours', now() + interval '4 hours 20 mins', 'pending'),

    -- Citas para Mañana (Programadas)
    (v_clinic_id, v_service_general, v_staff_1_id, 'Angélica Narváez', 'angy.nar@gmail.com', '3236541278', now() + interval '1 day 1 hours', now() + interval '1 day 1 hours 20 mins', 'confirmed'),
    (v_clinic_id, v_service_psicologia, v_user_id, 'Esteban Caicedo', 'esteban.cai@gmail.com', '3115478962', now() + interval '1 day 2 hours', now() + interval '1 day 3 hours', 'confirmed'),
    (v_clinic_id, v_service_odontologia, v_staff_1_id, 'Luz Marina Bastidas', 'luz.bastidas@gmail.com', '3024589632', now() + interval '1 day 4 hours', now() + interval '1 day 4 hours 45 mins', 'confirmed'),
    
    -- Citas para Pasado Mañana
    (v_clinic_id, v_service_quiropráctica, v_staff_2_id, 'Héctor Fabio Muñoz', 'hector.mun@gmail.com', '3174569852', now() + interval '2 days 2 hours', now() + interval '2 days 2 hours 30 mins', 'confirmed'),
    (v_clinic_id, v_service_general, v_staff_1_id, 'Valeria Portilla', 'valeria.port@gmail.com', '3049874521', now() + interval '2 days 3 hours', now() + interval '2 days 3 hours 20 mins', 'confirmed'),
    (v_clinic_id, v_service_psicologia, v_user_id, 'Santiago Ojeda', 'santi.oje@gmail.com', '3124587896', now() + interval '2 days 5 hours', now() + interval '2 days 6 hours', 'confirmed'),

    -- Cita Cancelada (Estadísticas)
    (v_clinic_id, v_service_general, v_staff_1_id, 'Diana Rivas', 'diana.rivas@gmail.com', '3154859632', now() - interval '2 days 5 hours', now() - interval '2 days 4 hours 40 mins', 'cancelled');

END $$;

COMMIT;
