-- =============================================================================
-- SCRIPT SQL: CONFIGURACIÓN DEMO GRUPO MOTOR K (PASTO, NARIÑO)
-- AgendaClick - Taller Multimarca & Centro de Recarga para Vehículos Eléctricos
-- Usuario Administrador: j4150nrodriguez@gmail.com
-- =============================================================================

BEGIN;

DO $$
DECLARE
    v_user_id uuid := 'e3ab5c3b-0bc9-4d96-976c-c6f714ffd24f';
    v_clinic_id uuid := 'c1111111-1111-1111-1111-111111111111';
    
    -- Técnicos Especialistas
    v_staff_1 uuid := 'a2222222-2222-2222-2222-222222222222';
    v_staff_2 uuid := 'b3333333-3333-3333-3333-333333333333';
    v_staff_3 uuid := 'c4444444-4444-4444-4444-444444444444';
    v_staff_4 uuid := 'd5555555-5555-5555-5555-555555555555';

    -- Servicios Mecánicos & Taller
    v_s_escaner uuid := 'f1111111-1111-1111-1111-111111111111';
    v_s_frenos uuid := 'f2222222-2222-2222-2222-222222222222';
    v_s_preventivo uuid := 'f3333333-3333-3333-3333-333333333333';
    v_s_alineacion uuid := 'f4444444-4444-4444-4444-444444444444';
    v_s_aceite uuid := 'f5555555-5555-5555-5555-555555555555';
    v_s_suspension uuid := 'f6666666-6666-6666-6666-666666666666';
    v_s_direccion uuid := 'f7777777-7777-7777-7777-777777777777';
    v_s_sincronizacion uuid := 'f8888888-8888-8888-8888-888888888888';
    v_s_llantas uuid := 'f9999999-9999-9999-9999-999999999999';
    v_s_aire uuid := 'faaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_s_latoneria uuid := 'fbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    -- Servicios Electrolinera & Vehículos Eléctricos
    v_s_recarga_dc uuid := 'fe111111-1111-1111-1111-111111111111';
    v_s_recarga_ac uuid := 'fe222222-2222-2222-2222-222222222222';
    v_s_bateria_soh uuid := 'fe333333-3333-3333-3333-333333333333';
    v_s_bateria_refrig uuid := 'fe444444-4444-4444-4444-444444444444';
    v_s_altovoltaje uuid := 'fe555555-5555-5555-5555-555555555555';

    v_schedule_json jsonb;
    v_staff_schedule jsonb;
BEGIN
    -- Horario de atención comercial (Motor K Pasto)
    v_schedule_json := '{
        "monday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00", "breakStart": "12:30", "breakEnd": "14:00"},
        "tuesday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00", "breakStart": "12:30", "breakEnd": "14:00"},
        "wednesday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00", "breakStart": "12:30", "breakEnd": "14:00"},
        "thursday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00", "breakStart": "12:30", "breakEnd": "14:00"},
        "friday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00", "breakStart": "12:30", "breakEnd": "14:00"},
        "saturday": {"isOpen": true, "openTime": "08:00", "closeTime": "13:00", "breakStart": null, "breakEnd": null},
        "sunday": {"isOpen": false, "openTime": "08:00", "closeTime": "13:00", "breakStart": null, "breakEnd": null}
    }'::jsonb;

    v_staff_schedule := '{"useClinicSchedule": true}'::jsonb;

    -- 1. Actualizar / Crear Clínica Grupo Motor K
    INSERT INTO public.clinics (
        id, owner_id, name, slug, phone, business_type, slogan,
        address, country, state, city, neighborhood, latitude, longitude,
        brand_color, subscription_status, subscription_ends_at, staff_limit, schedule
    ) VALUES (
        v_clinic_id, v_user_id, 'Grupo Motor K - Taller Multimarca & Electrolinera', 'motork-pasto', '+573158610110', 'automotriz',
        'Concesionario, Taller Autorizado Multimarca y Centro de Carga para Vehículos Eléctricos en Pasto',
        'Carrera 40A # 17A-10 / Av. Panamericana Cra 41 # 18-31, Pasto, Nariño', 'CO', 'Nariño', 'Pasto', 'Panamericana / San Ignacio',
        1.2165, -77.2845, '#dc2626', 'active', '2099-12-31 23:59:59+00', 999, v_schedule_json
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        phone = EXCLUDED.phone,
        business_type = EXCLUDED.business_type,
        slogan = EXCLUDED.slogan,
        address = EXCLUDED.address,
        brand_color = EXCLUDED.brand_color,
        schedule = EXCLUDED.schedule;

    -- 2. Perfil del Dueño
    INSERT INTO public.profiles (
        id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule
    ) VALUES (
        v_user_id, 'Ing. Jaison Rodríguez - Jefe de Taller & Movilidad Eléctrica', 'j4150nrodriguez@gmail.com', 'owner', v_clinic_id, true, false, true, v_staff_schedule
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'owner',
        clinic_id = v_clinic_id,
        is_bookable = true;

    -- 3. Técnicos Especialistas del Staff
    INSERT INTO public.profiles (id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule)
    VALUES
        (v_staff_1, 'Carlos Benavides - Frenos & Suspensión', 'carlos.benavides@motork.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_2, 'Andrés Villota - Inyección & Escáner Multimarca', 'andres.villota@motork.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_3, 'Diego Erazo - Especialista en Vehículos Eléctricos (VE)', 'diego.erazo@motork.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_4, 'Mauricio Narváez - Alineación 3D & Llantas', 'mauricio.narvaez@motork.co', 'staff', v_clinic_id, true, false, true, v_staff_schedule)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        clinic_id = v_clinic_id,
        role = 'staff';

    -- 4. Limpieza previa de citas y servicios
    DELETE FROM public.appointments WHERE clinic_id = v_clinic_id;
    DELETE FROM public.services WHERE clinic_id = v_clinic_id;

    -- 5. Catálogo de Servicios
    INSERT INTO public.services (id, clinic_id, name, duration_minutes, price, created_at)
    VALUES
        (v_s_escaner, v_clinic_id, 'Diagnóstico Computarizado Multimarca por Escáner', 30, 60000, now() - interval '10 days'),
        (v_s_frenos, v_clinic_id, 'Revisión y Cambio de Pastillas y Discos de Frenos', 45, 95000, now() - interval '10 days'),
        (v_s_preventivo, v_clinic_id, 'Mantenimiento Preventivo de Kilometraje (10k / 20k / 40k km)', 90, 180000, now() - interval '10 days'),
        (v_s_alineacion, v_clinic_id, 'Alineación Láser 3D y Balanceo Computarizado (4 Ruedas)', 40, 70000, now() - interval '10 days'),
        (v_s_aceite, v_clinic_id, 'Cambio de Aceite Sintético de Motor y Filtros Premium', 35, 120000, now() - interval '10 days'),
        (v_s_suspension, v_clinic_id, 'Revisión y Mantenimiento de Suspensión y Amortiguadores', 60, 110000, now() - interval '10 days'),
        (v_s_direccion, v_clinic_id, 'Ajuste y Diagnóstico de Dirección Hidráulica / Electroasistida', 45, 85000, now() - interval '10 days'),
        (v_s_sincronizacion, v_clinic_id, 'Sincronización de Motor y Limpieza de Inyectores por Ultrasonido', 75, 150000, now() - interval '10 days'),
        (v_s_llantas, v_clinic_id, 'Desmonte, Montaje y Rotación de Llantas', 30, 40000, now() - interval '10 days'),
        (v_s_aire, v_clinic_id, 'Revisión y Recarga de Gas de Aire Acondicionado', 40, 90000, now() - interval '10 days'),
        (v_s_latoneria, v_clinic_id, 'Inspección de Colisión, Latonería y Pintura al Horno', 30, 50000, now() - interval '10 days'),
        (v_s_recarga_dc, v_clinic_id, '⚡ Turno de Recarga Rápida DC (Estación 50kW - 60kW)', 45, 45000, now() - interval '10 days'),
        (v_s_recarga_ac, v_clinic_id, '⚡ Turno de Recarga Semi-Rápida AC Tipo 2 / GBT (Electrolinera)', 90, 30000, now() - interval '10 days'),
        (v_s_bateria_soh, v_clinic_id, '🔋 Diagnóstico y Chequeo de Salud de Batería de Alto Voltaje (SoH)', 45, 120000, now() - interval '10 days'),
        (v_s_bateria_refrig, v_clinic_id, '🔋 Mantenimiento de Sistema de Refrigeración de Batería VE', 60, 140000, now() - interval '10 days'),
        (v_s_altovoltaje, v_clinic_id, '🔌 Inspección de Seguridad de Alto Voltaje y Tren Motriz Eléctrico', 50, 110000, now() - interval '10 days');

    -- 6. Citas de Demostración Comercial (Marcas y Vehículos en Pasto)
    INSERT INTO public.appointments (clinic_id, service_id, staff_id, client_name, client_email, client_phone, start_time, end_time, status, total_price)
    VALUES
        -- Citas completadas (Ayer)
        (v_clinic_id, v_s_preventivo, v_user_id, 'Dr. Fernando Chamorro (Toyota Hilux 4x4 - Placa VAP-123)', 'f.chamorro.pasto@gmail.com', '3157849201', now() - interval '1 day 4 hours', now() - interval '1 day 2.5 hours', 'completed', 300000),
        (v_clinic_id, v_s_recarga_dc, v_staff_3, 'Mateo Benavides (JAC E-JS4 Eléctrico 100% - Placa LLL-890)', 'mateo.bena@hotmail.com', '3004561234', now() - interval '1 day 1 hours', now() - interval '1 day 15 mins', 'completed', 165000),
        (v_clinic_id, v_s_alineacion, v_staff_4, 'Dra. Claudia Rosero (Mazda CX-30 Grand Touring - Placa MKP-456)', 'claudia.rosero@saludnarino.gov.co', '3219876543', now() - interval '1 day 2 hours', now() - interval '1 day 1 hours 20 mins', 'completed', 110000),
        
        -- Citas de Hoy (En vivo)
        (v_clinic_id, v_s_recarga_dc, v_staff_3, 'Distribuidora Pasto S.A.S. - Roberto Muñoz (DFSK Van Cargo EC35 Eléctrica)', 'logistica@distribuidorapasto.co', '3182547896', now() - interval '2 hours', now() - interval '1 hours 15 mins', 'completed', 45000),
        (v_clinic_id, v_s_frenos, v_staff_1, 'Patricia Santander (Renault Duster 4x4 - Placa KLR-345) [Frenos + Dirección]', 'patricia.santander@gmail.com', '3164589721', now() + interval '1 hours', now() + interval '2.5 hours', 'confirmed', 180000),
        (v_clinic_id, v_s_escaner, v_staff_2, 'Camilo Guerrero (Honda CR-V Turbo - Placa HND-912) [Escáner + Sincronización]', 'camilo.guerrero@outlook.com', '3017485962', now() + interval '3 hours', now() + interval '4.75 hours', 'confirmed', 210000),
        
        -- Citas de Mañana (Programadas)
        (v_clinic_id, v_s_recarga_ac, v_staff_3, 'Andrés Moncayo (BYD Yuan Pro Eléctrica - Placa BYD-567)', 'andres.moncayo@gmail.com', '3148596321', now() + interval '1 day 1 hours', now() + interval '1 day 2.5 hours', 'confirmed', 150000),
        (v_clinic_id, v_s_aceite, v_user_id, 'Mariana Vallejo (Chevrolet Onix Turbo - Placa CHE-789) [Aceite + Llantas]', 'mariana.vallejo@gmail.com', '3104523698', now() + interval '1 day 2 hours', now() + interval '1 day 3.25 hours', 'confirmed', 160000),
        (v_clinic_id, v_s_suspension, v_staff_1, 'Transportes Nariño - Juan David Erazo (Foton Tunland G7 Diesel - Placa FTN-111)', 'gerencia@transportesnarino.com', '3236541278', now() + interval '1 day 4 hours', now() + interval '1 day 6 hours', 'confirmed', 205000),
        
        -- Próximos días
        (v_clinic_id, v_s_direccion, v_staff_1, 'Gabriel Enríquez (Kia Sportage Revolution - Placa KIA-234)', 'gabriel.enriquez@gmail.com', '3115478962', now() + interval '2 days 2 hours', now() + interval '2 days 3.5 hours', 'confirmed', 85000),
        (v_clinic_id, v_s_bateria_soh, v_staff_3, 'Ing. Felipe Coral (JAC E-Sei4 Pro Eléctrico - Placa JAC-009)', 'felipe.coral@gmail.com', '3024589632', now() + interval '2 days 4 hours', now() + interval '2 days 5 hours', 'confirmed', 230000);

END $$;

COMMIT;
