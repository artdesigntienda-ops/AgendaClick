-- =============================================================================
-- SCRIPT SQL: CONFIGURACIÓN DEMO SALÓN DE BELLEZA & ESTILISTAS (MLEC RAVE)
-- AgendaClick - Alta Peluquería, Balayage, Keratinas y Tratamientos Capilares
-- Usuario Administrador: Mlec.rave@gmail.com
-- =============================================================================

BEGIN;

DO $$
DECLARE
    v_user_id uuid := '7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a';
    v_clinic_id uuid := '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b';
    
    -- Equipo de Estilistas Profesionales
    v_staff_1 uuid := 'e1111111-1111-1111-1111-111111111111';
    v_staff_2 uuid := 'e2222222-2222-2222-2222-222222222222';
    v_staff_3 uuid := 'e3333333-3333-3333-3333-333333333333';
    v_staff_4 uuid := 'e4444444-4444-4444-4444-444444444444';

    -- Servicios de Peluquería & Estética
    v_s_balayage uuid := 'a1111111-1111-1111-1111-111111111111';
    v_s_keratina uuid := 'a2222222-2222-2222-2222-222222222222';
    v_s_corte uuid := 'a3333333-3333-3333-3333-333333333333';
    v_s_botox uuid := 'a4444444-4444-4444-4444-444444444444';
    v_s_tinte uuid := 'a5555555-5555-5555-5555-555555555555';
    v_s_maquillaje uuid := 'a6666666-6666-6666-6666-666666666666';
    v_s_manicure uuid := 'a7777777-7777-7777-7777-777777777777';
    v_s_cejas uuid := 'a8888888-8888-8888-8888-888888888888';

    v_schedule_json jsonb;
    v_staff_schedule jsonb;
BEGIN
    v_schedule_json := '{
        "monday": {"isOpen": true, "openTime": "08:00", "closeTime": "19:00", "breakStart": "13:00", "breakEnd": "14:00"},
        "tuesday": {"isOpen": true, "openTime": "08:00", "closeTime": "19:00", "breakStart": "13:00", "breakEnd": "14:00"},
        "wednesday": {"isOpen": true, "openTime": "08:00", "closeTime": "19:00", "breakStart": "13:00", "breakEnd": "14:00"},
        "thursday": {"isOpen": true, "openTime": "08:00", "closeTime": "19:00", "breakStart": "13:00", "breakEnd": "14:00"},
        "friday": {"isOpen": true, "openTime": "08:00", "closeTime": "20:00", "breakStart": "13:00", "breakEnd": "14:00"},
        "saturday": {"isOpen": true, "openTime": "08:00", "closeTime": "20:00", "breakStart": null, "breakEnd": null},
        "sunday": {"isOpen": false, "openTime": "09:00", "closeTime": "14:00", "breakStart": null, "breakEnd": null}
    }'::jsonb;

    v_staff_schedule := '{"useClinicSchedule": true}'::jsonb;

    -- 1. Perfil del Dueño
    INSERT INTO public.profiles (
        id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule
    ) VALUES (
        v_user_id, 'Marly Rave - Master Stylist & Colorista', 'mlec.rave@gmail.com', 'owner', NULL, true, false, true, v_staff_schedule
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = 'owner',
        is_bookable = true;

    -- 2. Crear / Actualizar Negocio (Salón de Belleza) con PLAN ILIMITADO
    INSERT INTO public.clinics (
        id, owner_id, name, slug, phone, business_type, slogan,
        address, country, state, city, neighborhood, latitude, longitude,
        brand_color, header_text_color, font_family,
        sidebar_color, sidebar_text_color, dashboard_accent_color,
        booking_bg_color, booking_text_color, booking_card_color,
        subscription_status, plan_type, subscription_ends_at, staff_limit, schedule
    ) VALUES (
        v_clinic_id, v_user_id, 'Mlec Rave Studio - Salón de Belleza & Estilistas', 'mlec-rave-studio', '+573104508923', 'belleza',
        'Alta Peluquería, Balayage, Keratinas y Tratamientos Capilares Exclusivos en Medellín',
        'Calle 10 # 43E-20, El Poblado', 'CO', 'Antioquia', 'Medellín', 'El Poblado',
        6.2088, -75.5684,
        '#db2777', '#ffffff', 'Outfit',
        '#18181b', '#f4f4f5', '#db2777',
        '#fdf2f8', '#18181b', '#ffffff',
        'active', 'elite', '2099-12-31 23:59:59+00', 999, v_schedule_json
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        phone = EXCLUDED.phone,
        business_type = EXCLUDED.business_type,
        slogan = EXCLUDED.slogan,
        address = EXCLUDED.address,
        brand_color = EXCLUDED.brand_color,
        subscription_status = 'active',
        plan_type = 'elite',
        subscription_ends_at = '2099-12-31 23:59:59+00',
        schedule = EXCLUDED.schedule;

    -- 3. Vincular clinic_id al perfil
    UPDATE public.profiles SET clinic_id = v_clinic_id WHERE id = v_user_id;

    -- 4. Equipo de Estilistas
    INSERT INTO public.profiles (id, name, email, role, clinic_id, is_bookable, is_on_break, has_seen_tutorial, schedule)
    VALUES
        (v_staff_1, 'Valentina Restrepo - Especialista en Balayage & Rubio', 'valentina.restrepo@mlecrave.com', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_2, 'Daniela Zapata - Keratinas Orgánicas & Alisados', 'daniela.zapata@mlecrave.com', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_3, 'Camila Muñoz - Maquillaje Social & Peinados Novia', 'camila.munoz@mlecrave.com', 'staff', v_clinic_id, true, false, true, v_staff_schedule),
        (v_staff_4, 'Sofia Henao - Manicure Ruso & Nail Art Spa', 'sofia.henao@mlecrave.com', 'staff', v_clinic_id, true, false, true, v_staff_schedule)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        clinic_id = v_clinic_id,
        role = 'staff';

END $$;

COMMIT;
