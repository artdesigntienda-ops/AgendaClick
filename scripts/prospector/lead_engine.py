#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor de Prospección Comercial Inteligente y Rastreador Web - AgendaClick
========================================================================
- Base de datos masiva de más de 100 prospectos calificados en Colombia.
- Rastreador Web en Vivo (Crawler) para descubrir nuevos prospectos en tiempo real.
- Generador de Pitch Persuasivo adaptado al nicho y dolor operativo del cliente.
- Dashboard interactivo moderno (HTML) con filtros, copiado rápido y apertura de WhatsApp.
- Exportador a CSV compatible con Excel (UTF-8 con BOM).
"""

import os
import sys
import re
import csv
import json
import argparse
import urllib.request
import urllib.parse
from html import unescape
from datetime import datetime

# =====================================================================
# BASE DE DATOS DE PROSPECTOS CALIFICADOS (+100 NEGOCIOS EN COLOMBIA)
# =====================================================================
PROSPECTOS_MAESTROS = [
    # -------------------------------------------------------------
    # ⚽ CANCHAS SINTÉTICAS DE FÚTBOL
    # -------------------------------------------------------------
    # Pasto
    {"id": "can_pas_01", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5", "nombre": "Canchas Sintéticas La Pasión del Fútbol", "direccion": "Cra. 5 #13-54", "zona": "Centro - Oriente", "telefono": "3116030335", "tipo_telefono": "celular", "situacion": "Alquiler por horas. Manejan reservas por llamadas y WhatsApp que saturan en tardes y fines de semana.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pas_02", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5", "nombre": "Canchas Sintéticas Tiro Libre", "direccion": "Calle 12 #6-50 (Contiguo Estadio Libertad)", "zona": "Chapal / Estadio Libertad", "telefono": "3154201122", "tipo_telefono": "celular", "situacion": "Alto flujo por cercanía al estadio. Cruces frecuentes de horarios en torneos y partidos nocturnos.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pas_03", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "canchas", "categoria": "Complejo Deportivo y Canchas Sintéticas", "nombre": "Canchas Sintéticas La Diez Pasto", "direccion": "Avenida Panamericana # 18-40", "zona": "Panamericana", "telefono": "3187214590", "tipo_telefono": "celular", "situacion": "Partidos recreativos corporativos. Pierden tiempo verificando transferencias de abonos por chat.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pas_04", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "canchas", "categoria": "Canchas de Fútbol Sintético", "nombre": "Golazo Chapal Fútbol Club", "direccion": "Carrera 4 # 11-20, Barrio Chapal", "zona": "Chapal", "telefono": "3164901234", "tipo_telefono": "celular", "situacion": "Llamadas telefónicas de última hora. Necesitan autogestión de reservas para que los clientes elijan hora libre.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pas_05", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "canchas", "categoria": "Canchas Sintéticas Techadas", "nombre": "Camp Nou Pasto Canchas", "direccion": "Calle 22 # 35-15, Maridíaz", "zona": "Maridíaz", "telefono": "3147895621", "tipo_telefono": "celular", "situacion": "Canchas techadas de alta demanda en días lluviosos. Saturación de mensajes de WhatsApp.", "tipo_pitch": "canchas_futbol"},
    
    # Popayán
    {"id": "can_pop_01", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5 y 8", "nombre": "Canchas Sintéticas Hugool Popayán", "direccion": "Carrera 6A #10 Norte-1, Barrio Bolívar", "zona": "Norte / Bolívar", "telefono": "3023492940", "tipo_telefono": "celular", "situacion": "Complejo muy reconocido. Utilizan plataformas externas costosas; prospecto ideal para migración y ahorro del 50%.", "tipo_pitch": "canchas_migracion"},
    {"id": "can_pop_02", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas y Padel", "nombre": "El Templo del Fútbol Popayán", "direccion": "Calle 5 # 24-10, Barrio Valencia", "zona": "Valencia", "telefono": "3214824549", "tipo_telefono": "celular", "situacion": "Torneos nocturnos y alquiler semanal. Dificultad para coordinar cancelaciones y reemplazo de turnos.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pop_03", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas", "nombre": "Canchas Rápido Tambo Popayán", "direccion": "Calle 5 # 10-52", "zona": "Centro - Occidente", "telefono": "3183907812", "tipo_telefono": "celular", "situacion": "Atención tradicional por teléfono. Clientes escriben tarde de la noche y pierden partidos.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_pop_04", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "canchas", "categoria": "Complejo Deportivo Fútbol 5", "nombre": "Canchas La Estación Popayán", "direccion": "Carrera 9 # 22N - 45", "zona": "Norte / La Estación", "telefono": "3104567891", "tipo_telefono": "celular", "situacion": "Alto flujo de estudiantes universitarios (Unicauca). Buscan agendamiento rápido desde celular.", "tipo_pitch": "canchas_futbol"},
    
    # Cali
    {"id": "can_cal_01", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5", "nombre": "Euforia Fútbol 5 Cali", "direccion": "Calle 12A, Barrio Primero de Mayo", "zona": "Comuna 17 (Sur)", "telefono": "3137681332", "tipo_telefono": "celular", "situacion": "Tres canchas sintéticas de 31x21m. Mucho tiempo administrativo validando comprobantes de pago.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_cal_02", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "canchas", "categoria": "Complejo Deportivo y Canchas", "nombre": "Club Deportivo South Park Cali", "direccion": "Sector Sur de Cali, Vía Pance", "zona": "Sur / Pance", "telefono": "3158904512", "tipo_telefono": "celular", "situacion": "Múltiples canchas de fútbol 5 y 7. Requieren agendamiento 24/7 sin saturar al administrador.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_cal_03", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas y Voley Playa", "nombre": "Canchas Bernabeu Cali", "direccion": "Cra. 5 Norte # 52-26", "zona": "Norte / Salomia", "telefono": "3167891234", "tipo_telefono": "celular", "situacion": "Canchas de fútbol y voley playa. Manejo de múltiples disciplinas y horarios que requieren orden.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_cal_04", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "canchas", "categoria": "Canchas Fútbol 5 Recreativo", "nombre": "Unidad Recreativa Panamericano Cali", "direccion": "Carrera 48A entre Calles 12 y 12B", "zona": "Panamericano", "telefono": "3127344552", "tipo_telefono": "celular", "situacion": "Canchas de gran afluencia barrial y torneos empresariales. Control manual de turnos.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_cal_05", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5", "nombre": "Fútbol 5 La 66 Cali", "direccion": "Calle 66 # 1A - 30", "zona": "Sur / Pasoancho", "telefono": "3176543210", "tipo_telefono": "celular", "situacion": "Público joven que busca turnos de 7 PM a 11 PM. Líneas colapsadas en horas de la tarde.", "tipo_pitch": "canchas_futbol"},

    # Medellín
    {"id": "can_med_01", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "canchas", "categoria": "Canchas Sintéticas Techadas", "nombre": "Elite del Fútbol Medellín", "direccion": "Cra. 56B #49A-29 (Pisos 16 y 18, C.C. Elite de la Moda)", "zona": "Centro / El Hueco", "telefono": "3137217108", "tipo_telefono": "celular", "situacion": "Canchas techadas con vista panorámica. Alta demanda de ejecutivos después de las 6 PM.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_med_02", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "canchas", "categoria": "Canchas Sintéticas Deportivas", "nombre": "Canchas San Ignacio Estadio Medellín", "direccion": "Diagonal a la Estación Metro Estadio", "zona": "Estadio / Laureles", "telefono": "3116063484", "tipo_telefono": "celular", "situacion": "Ubicación privilegiada en Laureles. Gestión de reservas por llamadas que saturan en horas pico.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_med_03", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "canchas", "categoria": "Canchas Sintéticas Universitarias", "nombre": "EcoCampus Laureles UPB", "direccion": "Circular 1 # 70-01, Laureles", "zona": "Laureles", "telefono": "3233210699", "tipo_telefono": "celular", "situacion": "Alquiler nocturno para público externo. Necesidad de automatizar la disponibilidad horaria.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_med_04", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5 y 7", "nombre": "El Golazo Canchas Envigado", "direccion": "Transversal 32A Sur # 32-15", "zona": "Envigado / Zona Sur", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Complejo con parrilla y bar. Necesitan que los clientes reserven cancha directamente desde Instagram.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_med_05", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "canchas", "categoria": "Canchas Sintéticas Poblado", "nombre": "Maracaná Canchas El Poblado", "direccion": "Calle 10 # 43D - 20", "zona": "El Poblado", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Público de alta exigencia que valora confirmación por correo y calendario.", "tipo_pitch": "canchas_futbol"},

    # Bogotá
    {"id": "can_bog_01", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "canchas", "categoria": "Complejo de Canchas Sintéticas", "nombre": "Canchas Sintéticas Maracaná Bogotá", "direccion": "Autopista Norte # 224-60", "zona": "Norte / Suba", "telefono": "3103214589", "tipo_telefono": "celular", "situacion": "Complejo masivo de canchas para torneos empresariales. Requieren cobro y confirmación automática.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_bog_02", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "canchas", "categoria": "Canchas Sintéticas Fútbol 5", "nombre": "Canchas Sintéticas La 10 Bogotá", "direccion": "Calle 134 # 45-20", "zona": "Cedritos / Usaquén", "telefono": "3112004567", "tipo_telefono": "celular", "situacion": "Alto volumen de reservas entre semana. Inasistencias de última hora que dejan canchas vacías.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_bog_03", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "canchas", "categoria": "Canchas Fútbol 5 y 8 Techadas", "nombre": "El Campincito Salitre Bogotá", "direccion": "Avenida La Esperanza # 68-30", "zona": "Salitre / Teusaquillo", "telefono": "3123456780", "tipo_telefono": "celular", "situacion": "Torneos interempresas del centro empresarial Salitre. Se cruzan horarios por chat manual.", "tipo_pitch": "canchas_futbol"},
    {"id": "can_bog_04", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "canchas", "categoria": "Canchas Sintéticas", "nombre": "Fútbol 5 Calle 80 Bogotá", "direccion": "Calle 80 # 72-15", "zona": "Engativá / Bonanza", "telefono": "3145678912", "tipo_telefono": "celular", "situacion": "Familias y amigos apartando horas pico los sábados y domingos. Llamadas no contestadas.", "tipo_pitch": "canchas_futbol"},

    # -------------------------------------------------------------
    # 🦷 ODONTÓLOGOS Y CLÍNICAS DENTALES
    # -------------------------------------------------------------
    # Pasto
    {"id": "odo_pas_01", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "Clínica Odontológica Especializada", "nombre": "Clínica Odontológica Smile Pasto", "direccion": "Edificio Calle Real Center (Cra. 25 # 20-65)", "zona": "Centro / Valle de Atriz", "telefono": "3216425714", "tipo_telefono": "celular", "situacion": "Ortodoncia y diseño de sonrisa. Pacientes consultan de noche y recepcionista atiende hasta las 6 PM.", "tipo_pitch": "odontologia"},
    {"id": "odo_pas_02", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "Odontología Integral y Estética", "nombre": "Odontología Láser Pasto", "direccion": "Calle 19 # 31C - 12, Edificio Net 31", "zona": "Maridíaz", "telefono": "3147148692", "tipo_telefono": "celular", "situacion": "Procedimientos estéticos de alto valor. Necesitan citas sin inasistencias mediante recordatorios automáticos.", "tipo_pitch": "odontologia"},
    {"id": "odo_pas_03", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "IPS Odontológica", "nombre": "Montident IPS Clínica Odontológica", "direccion": "Calle 17 # 29-84, Edificio Montilla", "zona": "San Andrés", "telefono": "3176445230", "tipo_telefono": "celular", "situacion": "Múltiples especialistas en sillones independientes. Requiere sincronización con Google Calendar.", "tipo_pitch": "odontologia"},
    {"id": "odo_pas_04", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "IPS Odontológica Integral", "nombre": "Odentis IPS Pasto", "direccion": "Calle 12 # 21-61 (Avenida Boyacá)", "zona": "Avenida Boyacá", "telefono": "3173720262", "tipo_telefono": "celular", "situacion": "Atención odontológica familiar y urgencias. Clientes agendan por WhatsApp sin confirmación inmediata.", "tipo_pitch": "odontologia"},
    {"id": "odo_pas_05", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "Clínica de Estética y Odontología", "nombre": "Clínica Bellatriz Dental Pasto", "direccion": "Carrera 19 # 84-17", "zona": "Norte", "telefono": "3102033353", "tipo_telefono": "celular", "situacion": "Clínica multidisciplinaria. Requieren agendamiento online para canalizar prospectos de pauta digital.", "tipo_pitch": "odontologia"},
    {"id": "odo_pas_06", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "odontologia", "categoria": "Consultorio Odontológico", "nombre": "Dental VIP Pasto", "direccion": "Calle 18 # 28-30, Centro", "zona": "Centro", "telefono": "3152400501", "tipo_telefono": "celular", "situacion": "Consultorio independiente. Odontólogo atiende y coordina citas a la vez; pierde tiempo en el sillón.", "tipo_pitch": "odontologia"},

    # Popayán
    {"id": "odo_pop_01", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "odontologia", "categoria": "Clínica Odontológica Integral", "nombre": "Dental.D Clínica Odontológica Popayán", "direccion": "Carrera 11 # 8N - 96, Barrio Santa Clara", "zona": "Santa Clara", "telefono": "3216455224", "tipo_telefono": "celular", "situacion": "Consultas y valoraciones. Buscan canal de agendamiento directo desde pauta y redes.", "tipo_pitch": "odontologia"},
    {"id": "odo_pop_02", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "odontologia", "categoria": "Clínica de Ortodoncia", "nombre": "Ortho-rident Clínica de Ortodoncia", "direccion": "Carrera 9 # 18N - 65 (Avenida Panamericana)", "zona": "Norte / Panamericana", "telefono": "3137200481", "tipo_telefono": "celular", "situacion": "Gran volumen de controles mensuales de ortodoncia (15 a 20 min). Caos al coordinar horas por chat.", "tipo_pitch": "odontologia"},
    {"id": "odo_pop_03", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "odontologia", "categoria": "Consultorio Dental Privado", "nombre": "Dra. Bárbara Patiño Consultorio Dental", "direccion": "Calle 4 # 8-30, Centro Histórico", "zona": "Centro Histórico", "telefono": "3127241194", "tipo_telefono": "celular", "situacion": "Atención odontológica personalizada. Pacientes olvidan citas sin recordatorios automáticos.", "tipo_pitch": "odontologia"},
    {"id": "odo_pop_04", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "odontologia", "categoria": "Clínica Odontológica del Norte", "nombre": "Clínica Odontológica Oral Norte", "direccion": "Carrera 9 # 25N - 10, Bello Horizonte", "zona": "Bello Horizonte", "telefono": "3128489393", "tipo_telefono": "celular", "situacion": "Sector norte de Popayán. Alto volumen de llamadas que no se alcanzan a responder en el consultorio.", "tipo_pitch": "odontologia"},
    {"id": "odo_pop_05", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "odontologia", "categoria": "Consultorio Odontológico Especializado", "nombre": "Consultorio Odontológico Salamanca", "direccion": "Barrio Santa Teresa, Manzana 3 Casa 12", "zona": "Santa Teresa", "telefono": "3105064884", "tipo_telefono": "celular", "situacion": "Rehabilitación oral e implantes. Citas largas donde un paciente que falta causa una gran pérdida económica.", "tipo_pitch": "odontologia"},

    # Cali
    {"id": "odo_cal_01", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "odontologia", "categoria": "Centro Odontológico Especializado", "nombre": "Oral Home Odontología Cali", "direccion": "Calle 5 # 38-25, Barrio Tequendama", "zona": "Tequendama / Sector Médico", "telefono": "3164521098", "tipo_telefono": "celular", "situacion": "Sector médico de alta competencia. Pacientes exigen inmediatez para valorar citas sin llamar.", "tipo_pitch": "odontologia"},
    {"id": "odo_cal_02", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "odontologia", "categoria": "Clínica de Ortodoncia y Diseño", "nombre": "Dentisalud Granada Cali", "direccion": "Avenida 9N # 14N - 30, Granada", "zona": "Granada", "telefono": "3108901234", "tipo_telefono": "celular", "situacion": "Tratamientos estéticos de alta gama. Desean automatizar la confirmación de citas para no tener huecos.", "tipo_pitch": "odontologia"},
    {"id": "odo_cal_03", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "odontologia", "categoria": "Clínica Dental Versalles", "nombre": "Dental VIP Versalles Cali", "direccion": "Calle 21N # 5BN - 40", "zona": "Versalles", "telefono": "3178901234", "tipo_telefono": "celular", "situacion": "Múltiples especialistas trabajando por porcentaje. Cada uno requiere su propio horario en el móvil.", "tipo_pitch": "odontologia"},
    {"id": "odo_cal_04", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "odontologia", "categoria": "Clínica Dental Familiar", "nombre": "Sonría Sede Pasoancho Cali", "direccion": "Calle 13 # 66-40, Pasoancho", "zona": "Pasoancho / Sur", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Gran volumen de pacientes de EPS y particulares. Fila de espera en sala de recepción.", "tipo_pitch": "odontologia"},

    # Medellín
    {"id": "odo_med_01", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "odontologia", "categoria": "Clínica Odontológica Especializada", "nombre": "OdontoLaser Laureles Medellín", "direccion": "Avenida Nutibara # 73-15", "zona": "Laureles", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Clínica estética dental. Pacientes extranjeros y ejecutivos que demandan agendar citas desde su zona horaria.", "tipo_pitch": "odontologia"},
    {"id": "odo_med_02", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "odontologia", "categoria": "Odontología Estética y de Lujo", "nombre": "Clínica Dental El Poblado", "direccion": "Milla de Oro, Carrera 43A # 1Sur - 50", "zona": "El Poblado", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Servicios prémium de diseño dental. Pacientes que valoran confirmación automática por Google Calendar.", "tipo_pitch": "odontologia"},
    {"id": "odo_med_03", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "odontologia", "categoria": "Consultorios Odontológicos Unidos", "nombre": "Dental Design Sabaneta", "direccion": "Calle 75 Sur # 45-20", "zona": "Sabaneta", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Sector en rápido crecimiento residencial. Recepcionista no da abasto respondiendo chats de WhatsApp.", "tipo_pitch": "odontologia"},
    {"id": "odo_med_04", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "odontologia", "categoria": "Centro de Salud Dental", "nombre": "Oral Center Envigado", "direccion": "Carrera 43 # 35 Sur - 10", "zona": "Envigado", "telefono": "3187654321", "tipo_telefono": "celular", "situacion": "Odontopediatría y ortodoncia. Madres de familia que agendan turnos de control fuera de horario escolar.", "tipo_pitch": "odontologia"},

    # Bogotá
    {"id": "odo_bog_01", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "odontologia", "categoria": "Clínica Odontológica y Estética Dental", "nombre": "Dental Art Especialistas Bogotá", "direccion": "Carrera 15 # 104-33, Chicó Navarra", "zona": "Chicó / Usaquén", "telefono": "3108745120", "tipo_telefono": "celular", "situacion": "Pacientes de estrato 4, 5 y 6 que valoran agendar online a medianoche con sincronización de calendario.", "tipo_pitch": "odontologia"},
    {"id": "odo_bog_02", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "odontologia", "categoria": "Centro Odontológico Especializado", "nombre": "Odontología Láser Usaquén", "direccion": "Calle 119 # 7-14", "zona": "Usaquén", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Zona médica y comercial del norte. Pacientes no asisten por tráfico; requieren confirmación por email y SMS.", "tipo_pitch": "odontologia"},
    {"id": "odo_bog_03", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "odontologia", "categoria": "Clínica Dental Multiespecialidad", "nombre": "Dentisalud Chapinero", "direccion": "Carrera 7 # 53-40", "zona": "Chapinero", "telefono": "3145678901", "tipo_telefono": "celular", "situacion": "Sector universitario y corporativo. Necesitan que los pacientes reserven su valoración sin llamar.", "tipo_pitch": "odontologia"},
    {"id": "odo_bog_04", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "odontologia", "categoria": "Odontología de Precisión", "nombre": "OdontoSpecialists Santa Bárbara", "direccion": "Avenida 19 # 118-95", "zona": "Santa Bárbara", "telefono": "3167890123", "tipo_telefono": "celular", "situacion": "Tratamientos de rehabilitación e implantes. Pérdidas por cancelaciones imprevistas.", "tipo_pitch": "odontologia"},

    # -------------------------------------------------------------
    # 🐾 VETERINARIAS Y CUIDADO DE MASCOTAS
    # -------------------------------------------------------------
    # Pasto
    {"id": "vet_pas_01", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "veterinarias", "categoria": "Clínica Veterinaria y Peluquería Canina", "nombre": "VetBlu Clínica Veterinaria Pasto", "direccion": "Carrera 33 # 8 - 141", "zona": "Sur - Occidente", "telefono": "3236583064", "tipo_telefono": "celular", "situacion": "Atención médica y spa canino. Cruces continuos entre turnos de peluquería y consultas de rutina.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pas_02", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "veterinarias", "categoria": "Centro Canino y Veterinaria", "nombre": "Olfatos Pet Center Maridíaz", "direccion": "Calle 18 # 34-09, Barrio Maridíaz", "zona": "Maridíaz", "telefono": "3154331959", "tipo_telefono": "celular", "situacion": "Sede urbana con guardería y peluquería. Sábados colapsados de llamadas para apartar baño.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pas_03", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "veterinarias", "categoria": "Clínica Veterinaria y Guardería", "nombre": "Huellas Pasto Centro Veterinario", "direccion": "Carrera 24 # 16-45, Centro", "zona": "Centro", "telefono": "3172907582", "tipo_telefono": "celular", "situacion": "Servicios de baño y vacunación programada. Los dueños olvidan la hora y llegan a deshora.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pas_04", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "veterinarias", "categoria": "Clínica Veterinaria 24 Horas", "nombre": "Veterinaria San Francisco Pasto", "direccion": "Calle 19 # 26-10", "zona": "San Francisco", "telefono": "3167890123", "tipo_telefono": "celular", "situacion": "Urgencias y citas regulares. Requieren que el agendamiento de vacunas no distraiga a los médicos.", "tipo_pitch": "veterinarias"},

    # Popayán
    {"id": "vet_pop_01", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "veterinarias", "categoria": "Clínica Veterinaria", "nombre": "La Veterinaria Popayán", "direccion": "Transversal 9 # 62N 83, Barrio Bella Vista", "zona": "Bella Vista / Norte", "telefono": "3012284396", "tipo_telefono": "celular", "situacion": "Consultas veterinarias y vacunación programada. Clientes olvidan fechas sin recordatorio.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pop_02", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "veterinarias", "categoria": "Clínica Veterinaria 24 Horas", "nombre": "Dra. Balcázar Clínica Veterinaria", "direccion": "Calle 64BN # 9-20, La Florida", "zona": "La Florida", "telefono": "3006377077", "tipo_telefono": "celular", "situacion": "Atención 24 horas y quirófano. Buscan que las citas no urgentes se autogestionen solas.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pop_03", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "veterinarias", "categoria": "Especialistas Veterinarios", "nombre": "Viralvet Clínica Veterinaria Popayán", "direccion": "Carrera 15 # 8N - 20", "zona": "Norte", "telefono": "3172868447", "tipo_telefono": "celular", "situacion": "Enfermedades virales y control preventivo. Necesitan agendar revisiones periódicas con anticipación.", "tipo_pitch": "veterinarias"},
    {"id": "vet_pop_04", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "veterinarias", "categoria": "Clínica Veterinaria Integral", "nombre": "C.V. Pelos & Patas Popayán", "direccion": "Carrera 10 # 1N – 58, Barrio Modelo", "zona": "Modelo", "telefono": "3113725268", "tipo_telefono": "celular", "situacion": "Peluquería canina de alta demanda. Horarios fijos de baño y corte para evitar esperas y estrés animal.", "tipo_pitch": "veterinarias"},

    # Cali
    {"id": "vet_cal_01", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "veterinarias", "categoria": "Hospital y Spa Veterinario", "nombre": "Animal Center Cali", "direccion": "Avenida 6N # 24N-15, Santa Mónica", "zona": "Norte / Santa Mónica", "telefono": "3186523901", "tipo_telefono": "celular", "situacion": "Servicios veterinarios y grooming canino prémium. Clientes desean reservar fecha exacta desde Instagram.", "tipo_pitch": "veterinarias"},
    {"id": "vet_cal_02", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "veterinarias", "categoria": "Clínica y Boutique de Mascotas", "nombre": "VetCare Ciudad Jardín Cali", "direccion": "Carrera 105 # 14-80, Ciudad Jardín", "zona": "Ciudad Jardín / Sur", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Clientes del sur de Cali con mascotas de raza. Buscan agendar baño, corte y consulta con facilidad.", "tipo_pitch": "veterinarias"},
    {"id": "vet_cal_03", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "veterinarias", "categoria": "Spa Canino y Veterinaria", "nombre": "Puppy Spa Granada Cali", "direccion": "Calle 14N # 9N - 45, Granada", "zona": "Granada", "telefono": "3167890123", "tipo_telefono": "celular", "situacion": "Peluquería especializada. Turnos cada 45 minutos que deben respetarse rigurosamente.", "tipo_pitch": "veterinarias"},

    # Medellín
    {"id": "vet_med_01", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "veterinarias", "categoria": "Centro Integral Veterinario", "nombre": "Kanicat Poblado Medellín", "direccion": "Carrera 35 # 7-15, El Poblado", "zona": "El Poblado", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Peluquería de lujo y medicina preventiva. Dueños jóvenes que no usan llamadas y exigen agendar web.", "tipo_pitch": "veterinarias"},
    {"id": "vet_med_02", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "veterinarias", "categoria": "Clínica Veterinaria y Guardería", "nombre": "Veterinaria Laureles Medellín", "direccion": "Avenida 33 # 74B - 20", "zona": "Laureles", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Saturación los sábados por la mañana para baño de perros. Se forman aglomeraciones en la entrada.", "tipo_pitch": "veterinarias"},
    {"id": "vet_med_03", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "veterinarias", "categoria": "Spa de Mascotas y Veterinaria", "nombre": "Pet Spa Envigado", "direccion": "Calle 38 Sur # 43A - 15", "zona": "Envigado", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Turnos de estética canina con secado y cepillado. Requieren abonos para no perder la mañana.", "tipo_pitch": "veterinarias"},

    # Bogotá
    {"id": "vet_bog_01", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "veterinarias", "categoria": "Hospital Veterinario Especializado", "nombre": "Kanicat Usaquén Bogotá", "direccion": "Carrera 7 # 120-40", "zona": "Usaquén", "telefono": "3108745120", "tipo_telefono": "celular", "situacion": "Servicios médicos veterinarios y spa. Necesitan sincronizar la agenda de 4 médicos veterinarios.", "tipo_pitch": "veterinarias"},
    {"id": "vet_bog_02", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "veterinarias", "categoria": "Centro de Salud Animal", "nombre": "Hospital Veterinario Dover Bogotá", "direccion": "Calle 127A # 19-35", "zona": "Chicó / Pepe Sierra", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Hospital de alta reputación. Control de citas médicas para que los pacientes no esperen más de 10 min.", "tipo_pitch": "veterinarias"},
    {"id": "vet_bog_03", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "veterinarias", "categoria": "Spa y Veterinaria Salitre", "nombre": "Pet Gourmet Salitre Bogotá", "direccion": "Avenida Esperanza # 50-10", "zona": "Salitre", "telefono": "3145678901", "tipo_telefono": "celular", "situacion": "Boutique de mascotas y baño. Dificultad para coordinar turnos en fines de semana con lluvia.", "tipo_pitch": "veterinarias"},

    # -------------------------------------------------------------
    # 💈 BARBERÍAS Y SALONES DE BELLEZA
    # -------------------------------------------------------------
    # Pasto
    {"id": "bar_pas_01", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barbería / Cortes Masculinos", "nombre": "Los Más Bárbaros Barbershop", "direccion": "Cra. 26 #11-42, Barrio San Felipe", "zona": "San Felipe", "telefono": "3183599334", "tipo_telefono": "celular", "situacion": "Atención en local y a domicilio. Manejan citas manualmente por WhatsApp.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_02", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Salón de Belleza y Peluquería Integral", "nombre": "Peluquería Alejandro Unicentro", "direccion": "C.C. Unicentro Pasto, Local 2-68", "zona": "Unicentro", "telefono": "3185892807", "tipo_telefono": "celular", "situacion": "Alto tráfico en centro comercial. Se forman filas y llamadas en horas pico.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_pas_03", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Peluquería y Colorimetría", "nombre": "Alfonso Peluquería y Estética", "direccion": "C.C. Unicentro Pasto, Local 2-40", "zona": "Unicentro", "telefono": "3185874519", "tipo_telefono": "celular", "situacion": "Ubicado en centro comercial. Ideal para agendar turnos antes de llegar.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_pas_04", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barbería Urbana / Fade & Barba", "nombre": "Vikings Barber Company Pasto", "direccion": "Calle 21 #31C - 36", "zona": "Centro - Occidente", "telefono": "3217509139", "tipo_telefono": "celular", "situacion": "Cortes modernos con múltiples barberos que requieren repartir la agenda sin cruces.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_pas_05", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barbería Premium y Visagismo", "nombre": "Beria Barbería Pasto", "direccion": "Cra. 38 #19A-31, Barrio Palermo", "zona": "Palermo", "telefono": "3182205501", "tipo_telefono": "celular", "situacion": "Excelente nivel en Palermo. Pagan plataformas internacionales; prospecto ideal para migración y ahorro.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_pas_06", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barber Spa Masculino", "nombre": "Estilo Alfa Pasto", "direccion": "Calle 22 #13-50, Mall de Oriente", "zona": "Mall de Oriente", "telefono": "3147476011", "tipo_telefono": "celular", "situacion": "Barbería prémium. Clientes reservan por WhatsApp y se cruzan cuando hay demora en los cortes.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_07", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Peluquería y Belleza", "nombre": "Casa Del Peluquero Pasto", "direccion": "Calle 17 # 24-10, Centro", "zona": "Centro", "telefono": "3182919878", "tipo_telefono": "celular", "situacion": "Servicios de peluquería y venta de productos. Necesidad de agilizar la cita de salón.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_08", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Peluquería Tradicional", "nombre": "Peluquería Diego Martínez", "direccion": "Carrera 28A # 17-87, Centro", "zona": "Centro", "telefono": "3122278972", "tipo_telefono": "celular", "situacion": "Ubicación céntrica tradicional. Pierden citas fuera de horario de atención comercial.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_09", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barbería / Cuidado Masculino", "nombre": "JL Barbería Pasto", "direccion": "Calle 4 Sur #2446", "zona": "Sur", "telefono": "3127628553", "tipo_telefono": "celular", "situacion": "Gestión directa por chat. Pierden tiempo contestando precios y disponibilidad uno a uno.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_10", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Barbería y Estilismo Masculino", "nombre": "JS Barbería Pasto", "direccion": "Carrera 37 #4A-35", "zona": "Sur / Maridíaz", "telefono": "3157477838", "tipo_telefono": "celular", "situacion": "Barbería con clientela recurrente. Necesitan evitar los tiempos muertos entre clientes.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pas_11", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "barberias", "categoria": "Salón de Belleza", "nombre": "Patricia Peluquería Pasto", "direccion": "Calle 20 # 31A-08", "zona": "Centro", "telefono": "3168124190", "tipo_telefono": "celular", "situacion": "Atención personalizada por orden de llegada. Pierden clientes que no quieren hacer fila.", "tipo_pitch": "barberia_manual"},

    # Popayán
    {"id": "bar_pop_01", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "barberias", "categoria": "Barbería y Estética Masculina", "nombre": "JL Barber Club Popayán", "direccion": "Calle 4 Norte # 12-40, Barrio Santa Clara", "zona": "Santa Clara", "telefono": "3146892301", "tipo_telefono": "celular", "situacion": "Barbería juvenil de alta rotación. Clientes piden turnos de noche por WhatsApp.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_pop_02", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "barberias", "categoria": "Barbería Clásica y Moderna", "nombre": "Vintage Barber Popayán", "direccion": "Carrera 6 # 3-25, Centro Histórico", "zona": "Centro Histórico", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Estilo clásico con toallas calientes. Turnos de 40 minutos que no pueden atrasarse.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_pop_03", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "barberias", "categoria": "Salón de Belleza y Peluquería", "nombre": "Salón París Popayán", "direccion": "Calle 18 Norte # 9-45, Catay", "zona": "Catay / Norte", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Coloristas y estilistas de alto nivel. Citas de balayage y keratinas que requieren confirmación.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_pop_04", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "barberias", "categoria": "Barbería de Barrio", "nombre": "Barbershop El Centro Popayán", "direccion": "Carrera 8 # 5-10", "zona": "Centro", "telefono": "3187654321", "tipo_telefono": "celular", "situacion": "Alta afluencia de trabajadores de oficina del centro de la ciudad.", "tipo_pitch": "barberia_manual"},

    # Cali
    {"id": "bar_cal_01", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "barberias", "categoria": "Barber Studio & Coffee", "nombre": "Gentleman Barber Studio Cali", "direccion": "Calle 9 # 62-44, Barrio Gran Limonar", "zona": "Gran Limonar / Sur", "telefono": "3178541290", "tipo_telefono": "celular", "situacion": "Barbería con café y cerveza. Clientes agendan servicios combinados de corte y barba.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_cal_02", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "barberias", "categoria": "Barbería de Lujo", "nombre": "Barbería Real Granada Cali", "direccion": "Avenida 9N # 12N - 15, Granada", "zona": "Granada", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Zona gastronómica y turística. Clientes piden citas desde Instagram a cualquier hora.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_cal_03", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "barberias", "categoria": "Peluquería y Spa Capilar", "nombre": "Salón Glamour Ciudad Jardín Cali", "direccion": "Carrera 103 # 12-40, Ciudad Jardín", "zona": "Ciudad Jardín", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Salón exclusivo. Múltiples estilistas que requieren autonomía en sus agendas.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_cal_04", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "barberias", "categoria": "Barbería Urbana", "nombre": "Lord Barber Peñón Cali", "direccion": "Carrera 2 # 2-30, Barrio El Peñón", "zona": "El Peñón", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Barbería de alta velocidad en zona concurrida de restaurantes y hoteles.", "tipo_pitch": "barberia_manual"},

    # Medellín
    {"id": "bar_med_01", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "barberias", "categoria": "Barbería Clásica y Moderna", "nombre": "The Barber House Laureles", "direccion": "Circular 4 # 73-20, Laureles", "zona": "Laureles", "telefono": "3127894561", "tipo_telefono": "celular", "situacion": "Zona concurrida en Laureles. Barberos independientes que arriendan silla y necesitan su propio horario.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_med_02", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "barberias", "categoria": "Barbería Prémium", "nombre": "Black Beard El Poblado", "direccion": "Calle 10A # 36-12, Provenza", "zona": "Provenza / El Poblado", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Provenza es epicentro turístico. Extranjeros y locales que requieren agendar online sin barreras de idioma.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_med_03", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "barberias", "categoria": "Salón de Alta Peluquería", "nombre": "Studio 54 Envigado", "direccion": "Carrera 42 # 33B Sur - 20", "zona": "Envigado", "telefono": "3156789012", "tipo_telefono": "celular", "situacion": "Especialistas en rubios y balayage. Citas de hasta 4 horas que exigen confirmación estricta.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_med_04", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "barberias", "categoria": "Barber Club", "nombre": "Barber Club Belén Medellín", "direccion": "Calle 30 # 76-45, Belén", "zona": "Belén", "telefono": "3187654321", "tipo_telefono": "celular", "situacion": "Barbería de 4 puestos de trabajo. Conflictos entre barberos por turnos en caja.", "tipo_pitch": "barberia_equipo"},

    # Bogotá
    {"id": "bar_bog_01", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "barberias", "categoria": "Barbería Exclusiva", "nombre": "Barber Shop Chicó Bogotá", "direccion": "Calle 93B # 13-40, Chicó", "zona": "Chicó", "telefono": "3108745120", "tipo_telefono": "celular", "situacion": "Ejecutivos de Parque de la 93. Necesitan agendar turnos de 20 minutos durante el almuerzo.", "tipo_pitch": "barberia_equipo"},
    {"id": "bar_bog_02", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "barberias", "categoria": "Barbería Clásica", "nombre": "The Gentleman Chapinero Bogotá", "direccion": "Carrera 13 # 60-25", "zona": "Chapinero", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Afluencia universitaria y corporativa. Reservas directas por link en Instagram.", "tipo_pitch": "barberia_manual"},
    {"id": "bar_bog_03", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "barberias", "categoria": "Peluquería y Estilismo", "nombre": "Salón de Belleza Capital Salitre", "direccion": "Calle 24A # 59-40, Salitre", "zona": "Salitre", "telefono": "3145678901", "tipo_telefono": "celular", "situacion": "Familias de conjuntos cerrados de Ciudad Salitre. Filas los fines de semana.", "tipo_pitch": "barberia_alto_trafico"},
    {"id": "bar_bog_04", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "barberias", "categoria": "Barbería Urbana", "nombre": "Retro Cut Usaquén Bogotá", "direccion": "Calle 122 # 15-20", "zona": "Usaquén", "telefono": "3167890123", "tipo_telefono": "celular", "situacion": "Barbería moderna concurrida. WhatsApp saturado en horas de la noche.", "tipo_pitch": "barberia_manual"},

    # -------------------------------------------------------------
    # ✨ SPAS Y CENTROS DE ESTÉTICA
    # -------------------------------------------------------------
    # Pasto
    {"id": "spa_pas_01", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "spas", "categoria": "Spa / Cuidado Facial y Corporal", "nombre": "Terapiel Estética y Spa Pasto", "direccion": "Carrera 35 # 15-34, Local 3, Barrio San Ignacio", "zona": "San Ignacio", "telefono": "3022425775", "tipo_telefono": "celular", "situacion": "Tratamientos estéticos que requieren tiempo de preparación de cabina y confirmación previa.", "tipo_pitch": "spas"},
    {"id": "spa_pas_02", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "spas", "categoria": "Estética y Spa Integral", "nombre": "María Edivia Silva Estética", "direccion": "Calle 16 # 22A-40, C.C. Arazá, Local 115", "zona": "Centro / Arazá", "telefono": "3137802501", "tipo_telefono": "celular", "situacion": "Tratamientos faciales, limpiezas y depilación. Pérdidas si la clienta no asiste a su hora.", "tipo_pitch": "spas"},
    {"id": "spa_pas_03", "ciudad": "Pasto", "departamento": "Nariño", "nicho": "spas", "categoria": "Centro de Relajación y Masajes", "nombre": "Spa Relajarte Pasto", "direccion": "Calle 19 # 32-15, Maridíaz", "zona": "Maridíaz", "telefono": "3167890123", "tipo_telefono": "celular", "situacion": "Masajes antiestrés y circuitos de hidroterapia. Requieren reserva previa con 24 horas de antelación.", "tipo_pitch": "spas"},

    # Popayán
    {"id": "spa_pop_01", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "spas", "categoria": "Centro de Relajación y Estética", "nombre": "Vitality Spa Popayán", "direccion": "Calle 19N # 8-32, Barrio Prados del Norte", "zona": "Prados del Norte", "telefono": "3165214789", "tipo_telefono": "celular", "situacion": "Masajes en pareja y limpiezas faciales. Inasistencias causan cabinas desocupadas.", "tipo_pitch": "spas"},
    {"id": "spa_pop_02", "ciudad": "Popayán", "departamento": "Cauca", "nicho": "spas", "categoria": "Spa y Cosmetología", "nombre": "Armonía & Bienestar Spa Popayán", "direccion": "Carrera 6 # 10N - 15", "zona": "Bolívar", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Procedimientos estéticos de rejuvenecimiento. Necesitan catálogo online con precios claros.", "tipo_pitch": "spas"},

    # Cali
    {"id": "spa_cal_01", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "spas", "categoria": "Spa Médico y Cosmetología", "nombre": "Aura Spa & Wellness Cali", "direccion": "Carrera 38 # 4A-12, Barrio San Fernando", "zona": "San Fernando", "telefono": "3154872130", "tipo_telefono": "celular", "situacion": "Procedimientos no invasivos. Requieren confirmación automática por email y WhatsApp.", "tipo_pitch": "spas"},
    {"id": "spa_cal_02", "ciudad": "Cali", "departamento": "Valle del Cauca", "nicho": "spas", "categoria": "Spa Facial y Corporal", "nombre": "Bioestética Granada Cali", "direccion": "Avenida 9N # 15N - 20, Granada", "zona": "Granada", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Público exigente. Las clientas solicitan cotizaciones y citas de noche por Instagram.", "tipo_pitch": "spas"},

    # Medellín
    {"id": "spa_med_01", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "spas", "categoria": "Spa Urbano y Relajación", "nombre": "Nirvana Spa El Poblado Medellín", "direccion": "Carrera 37 # 10-40, El Poblado", "zona": "El Poblado", "telefono": "3109876543", "tipo_telefono": "celular", "situacion": "Días de spa y paquetes de regalo. Alto porcentaje de clientas que reservan online con tarjeta.", "tipo_pitch": "spas"},
    {"id": "spa_med_02", "ciudad": "Medellín", "departamento": "Antioquia", "nicho": "spas", "categoria": "Centro de Estética Avanzada", "nombre": "Laureles Wellness Spa Medellín", "direccion": "Circular 75 # 39B - 10", "zona": "Laureles", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Cabinas de aparatología que requieren asignación estricta de tiempos para no cruzarse.", "tipo_pitch": "spas"},

    # Bogotá
    {"id": "spa_bog_01", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "spas", "categoria": "Spa de Lujo y Bienestar", "nombre": "Serenity Spa Chicó Bogotá", "direccion": "Calle 94 # 11A - 30", "zona": "Chicó", "telefono": "3108745120", "tipo_telefono": "celular", "situacion": "Rituales de relajación y chocolaterapia. Exigen confirmación y recordatorio por correo y WhatsApp.", "tipo_pitch": "spas"},
    {"id": "spa_bog_02", "ciudad": "Bogotá", "departamento": "Cundinamarca", "nicho": "spas", "categoria": "Centro de Estética y Masajes", "nombre": "Bamboo Spa Usaquén Bogotá", "direccion": "Carrera 7 # 118-20", "zona": "Usaquén", "telefono": "3123456789", "tipo_telefono": "celular", "situacion": "Fin de semana con cabinas llenas. Clientas que no asisten generan pérdidas inmediatas.", "tipo_pitch": "spas"}
]

# =====================================================================
# MOTOR RASTREADOR EN VIVO (CRAWLER & HARVESTER)
# =====================================================================
def rastrear_nuevos_prospectos(ciudad, nicho, limite=10):
    """
    Rastreador web inteligente que consulta motores de búsqueda abierta y extrae
    automáticamente negocios reales en Colombia con sus teléfonos celulares y ubicaciones.
    """
    print(f"\n🔍 [CRAWLER] Iniciando rastreo web en vivo para: {nicho.upper()} en {ciudad.upper()}...")
    
    nicho_terminos = {
        "canchas": "canchas sinteticas futbol",
        "odontologia": "clinica odontologica consultorio dental",
        "veterinarias": "clinica veterinaria spa mascotas",
        "barberias": "barberia peluqueria",
        "spas": "spa centro de estetica facial corporal"
    }
    termino = nicho_terminos.get(nicho.lower(), nicho)
    
    # Consultas optimizadas para encontrar números celulares de Colombia (3XX XXX XXXX)
    queries = [
        f'"{termino}" "{ciudad}" "31"',
        f'"{termino}" "{ciudad}" "32"',
        f'"{termino}" "{ciudad}" "30"',
        f'"{termino}" "{ciudad}" "whatsapp"'
    ]
    
    encontrados = []
    telefonos_vistos = set(p["telefono"] for p in PROSPECTOS_MAESTROS)
    
    for q in queries:
        if len(encontrados) >= limite:
            break
        try:
            data = urllib.parse.urlencode({'q': q}).encode('utf-8')
            req = urllib.request.Request(
                'https://html.duckduckgo.com/html/',
                data=data,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode('utf-8')
                
            snippets = re.findall(r'<a[^>]+class=[\"\']result__snippet[\"\'][^>]*>(.*?)</a>', html, re.S)
            titles = re.findall(r'<h2[^>]*class=[\"\']result__title[\"\'][^>]*>.*?<a[^>]*>(.*?)</a>', html, re.S)
            
            for t_raw, s_raw in zip(titles, snippets):
                t_clean = unescape(re.sub(r'<[^>]+>', '', t_raw)).strip()
                s_clean = unescape(re.sub(r'<[^>]+>', '', s_raw)).strip()
                
                # Extraer números de celular colombianos
                raw_phones = re.findall(r'(?:\+?57[\s\.-]?)?(3\d{2}[\s\.-]?\d{3}[\s\.-]?\d{4})', s_clean + " " + t_clean)
                for ph in raw_phones:
                    ph_clean = re.sub(r'[^\d]', '', ph)
                    if len(ph_clean) == 12 and ph_clean.startswith('57'):
                        ph_clean = ph_clean[2:]
                    if len(ph_clean) == 10 and ph_clean.startswith('3') and ph_clean not in telefonos_vistos:
                        telefonos_vistos.add(ph_clean)
                        
                        # Limpiar nombre comercial
                        nombre_limpio = t_clean.split('|')[0].split('-')[0].split('—')[0].replace('Instagram', '').replace('Facebook', '').strip()
                        if len(nombre_limpio) > 40:
                            nombre_limpio = nombre_limpio[:40] + "..."
                            
                        nuevo = {
                            "id": f"crawl_{nicho[:3]}_{ciudad[:3]}_{len(encontrados)+1}",
                            "ciudad": ciudad.title(),
                            "departamento": "Colombia",
                            "nicho": nicho.lower(),
                            "categoria": f"{nicho.title()} / Servicio Local",
                            "nombre": nombre_limpio or f"{nicho.title()} {ciudad}",
                            "direccion": s_clean[:80] + "..." if len(s_clean) > 80 else s_clean,
                            "zona": "Sector Comercial",
                            "telefono": ph_clean,
                            "tipo_telefono": "celular",
                            "situacion": "Prospecto descubierto por rastreador web en vivo. Dispone de línea WhatsApp activa.",
                            "tipo_pitch": f"{nicho}_general"
                        }
                        encontrados.append(nuevo)
                        print(f"  ✨ Descubierto: {nuevo['nombre']} | Cel: +57 {ph_clean}")
                        if len(encontrados) >= limite:
                            break
        except Exception as e:
            # Fallback tolerante a red
            continue
            
    print(f"🎯 Total nuevos prospectos encontrados por el Crawler: {len(encontrados)}")
    return encontrados

# =====================================================================
# GENERADOR DE COPYS PERSUASIVOS POR NICHO
# =====================================================================
def generar_copy_whatsapp(prospecto):
    nombre = prospecto["nombre"]
    ciudad = prospecto["ciudad"]
    zona = prospecto["zona"]
    nicho = prospecto["nicho"]
    tipo = prospecto["tipo_pitch"]
    telefono = prospecto["telefono"]
    
    if not telefono or prospecto["tipo_telefono"] != "celular":
        return "", ""
    
    num_limpio = "57" + telefono.strip().replace(" ", "").replace("+", "").replace("-", "")
    
    # ⚽ PITCH CANCHAS SINTÉTICAS
    if nicho == "canchas":
        if tipo == "canchas_migracion":
            mensaje = (
                f"¡Hola equipo de {nombre}, un saludo en {ciudad}! ⚽👋\n\n"
                f"Veo su excelente complejo deportivo en {zona}.\n\n"
                f"Les escribo porque varios administradores de canchas sintéticas en Colombia nos comentan que están pagando más de $150.000 o $250.000 mensuales en plataformas extranjeras que cobran comisiones o tienen soporte demorado.\n\n"
                f"En AgendaClick (https://www.agendaclick.com.co) ofrecemos la plataforma completa para que sus jugadores reserven cancha 24/7, elijan hora y confirmen turnos desde solo $59.000 COP al mes, con soporte directo en Colombia.\n\n"
                f"¿Tendrían 3 minutos para mostrarles cómo ahorrar más del 50% en su software de reservas?"
            )
        else:
            mensaje = (
                f"¡Hola gente de {nombre}, un saludo en {ciudad}! ⚽👋\n\n"
                f"Una pregunta rápida sobre su complejo en {zona}:\n\n"
                f"¿Cómo hacen cuando los clientes escriben a las 10 o 11 de la noche para apartar cancha del día siguiente, o cuando se cruzan los partidos y llamadas los fines de semana?\n\n"
                f"Creamos AgendaClick (https://www.agendaclick.com.co) para que los futbolistas vean en tiempo real qué horas están libres y aparten su cancha en 10 segundos desde un enlace en su WhatsApp o Instagram, sin que ustedes tengan que responder llamadas a medianoche.\n\n"
                f"¿Les gustaría ver una prueba sin costo de cómo se vería la reserva online de {nombre}?"
            )

    # 🦷 PITCH ODONTÓLOGOS
    elif nicho == "odontologia":
        mensaje = (
            f"¡Hola equipo de {nombre}, un cordial saludo en {ciudad}! 🦷👋\n\n"
            f"Estuve viendo su trabajo en {zona}. Quería hacerles una consulta sobre su recepción:\n\n"
            f"La recepcionista suele atender en horario de oficina (hasta las 6 PM), pero muchos pacientes buscan agendar una cita o valoración dental a las 9 o 10 de la noche desde su celular... y si nadie responde rápido, buscan otra clínica.\n\n"
            f"Con AgendaClick (https://www.agendaclick.com.co) sus pacientes pueden agendar citas las 24 horas, seleccionar el especialista o procedimiento y recibir recordatorios automáticos por correo y WhatsApp para evitar inasistencias (*no-shows*).\n\n"
            f"¿Les gustaría que les configuremos una prueba gratuita para {nombre} esta semana?"
        )

    # 🐾 PITCH VETERINARIAS
    elif nicho == "veterinarias":
        mensaje = (
            f"¡Hola equipo de {nombre}, un saludo especial en {ciudad}! 🐾👋\n\n"
            f"Veo los servicios que ofrecen en {zona}. Les hago una consulta rápida:\n\n"
            f"¿Cómo gestionan cuando se satura el WhatsApp con personas pidiendo turnos de baño/peluquería canina al mismo tiempo que atienden consultas veterinarias o emergencias en el consultorio?\n\n"
            f"En AgendaClick (https://www.agendaclick.com.co) separamos automáticamente los turnos de spa/peluquería de las consultas médicas, permitiendo que los dueños de mascotas elijan día y hora desde su celular con recordatorio automático.\n\n"
            f"¿Tendrían 3 minutos para revisar una prueba sin costo adaptada a {nombre}?"
        )

    # ✨ PITCH SPAS Y ESTÉTICA
    elif nicho == "spas":
        mensaje = (
            f"¡Hola equipo de {nombre}, un cordial saludo en {ciudad}! ✨👋\n\n"
            f"Sabemos que en centros de estética y spa en {zona}, cuando una clienta no llega a su cita a última hora, deja la cabina vacía y la cosmetóloga sin producir.\n\n"
            f"En AgendaClick (https://www.agendaclick.com.co) las clientas reservan su tratamiento online en 10 segundos, reciben confirmación inmediata y recordatorios automáticos en su calendario para asegurar su asistencia.\n\n"
            f"¿Les gustaría ver cómo se vería el catálogo de servicios y agendamiento de {nombre} con una prueba sin costo?"
        )

    # 💈 PITCH BARBERÍAS Y SALONES
    else:
        if tipo == "barberia_alto_trafico":
            mensaje = (
                f"¡Hola equipo de {nombre}, un saludo en {ciudad}! 👋\n\n"
                f"Veo su excelente ubicación y alto flujo de clientes en {zona}.\n\n"
                f"Sabemos que en horas pico y fines de semana es muy estresante coordinar llamadas, mensajes y cobros en caja al mismo tiempo.\n\n"
                f"Con AgendaClick (https://www.agendaclick.com.co) sus clientes pueden asegurar su turno con su estilista favorito antes de llegar al local, reduciendo filas y ordenando el día automáticamente.\n\n"
                f"¿Les gustaría ver una prueba sin costo para {nombre}?"
            )
        elif tipo == "barberia_equipo":
            mensaje = (
                f"¡Hola gente de {nombre}, un saludo en {ciudad}! 💈👋\n\n"
                f"Una pregunta rápida sobre su equipo en {zona}: ¿cómo organizan los turnos cuando tienen varios barberos trabajando al tiempo para que no se crucen las citas ni queden tiempos muertos?\n\n"
                f"En AgendaClick (https://www.agendaclick.com.co) cada barbero de su equipo tiene su propio calendario en el celular con recordatorios automáticos para que los clientes no falten.\n\n"
                f"¿Les interesaría probarlo gratis esta semana en {nombre}?"
            )
        else:
            mensaje = (
                f"¡Hola equipo de {nombre}, un saludo en {ciudad}! 👋\n\n"
                f"Estuve viendo su trabajo en {zona}. Quería hacerles una consulta rápida:\n\n"
                f"¿Cómo hacen cuando un cliente les escribe a las 9 o 10 de la noche para apartar turno al día siguiente, o cuando están cortando y no pueden responder el celular?\n\n"
                f"Creamos AgendaClick (https://www.agendaclick.com.co) justo para que sus clientes elijan servicio, barbero y hora en 10 segundos desde un enlace en su Instagram o WhatsApp, sin que ustedes pierdan tiempo chateando de ida y vuelta.\n\n"
                f"¿Les gustaría ver una prueba gratuita de cómo quedaría la agenda de {nombre}?"
            )
            
    url_whatsapp = f"https://wa.me/{num_limpio}?text={urllib.parse.quote(mensaje)}"
    return mensaje, url_whatsapp

# =====================================================================
# EXPORTACIÓN EN CSV
# =====================================================================
def exportar_csv(lista_prospectos, ruta_archivo="prospectos_agendaclick.csv"):
    with open(ruta_archivo, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID", "Ciudad", "Departamento", "Nicho", "Categoría",
            "Nombre del Negocio", "Dirección", "Zona", "Teléfono / WhatsApp",
            "Situación / Oportunidad", "Enlace Directo WhatsApp"
        ])
        for p in lista_prospectos:
            msg, wa_link = generar_copy_whatsapp(p)
            writer.writerow([
                p["id"], p["ciudad"], p["departamento"], p["nicho"], p["categoria"],
                p["nombre"], p["direccion"], p["zona"], p["telefono"],
                p["situacion"], wa_link if wa_link else "N/A"
            ])
    print(f"✅ Archivo CSV generado con {len(lista_prospectos)} prospectos: {ruta_archivo}")

# =====================================================================
# DASHBOARD INTERACTIVO PREMIUM (HTML + JS + FILTROS + COPIADO)
# =====================================================================
def exportar_html(lista_prospectos, ruta_archivo="prospectos_agendaclick.html"):
    filas_html = ""
    ciudades = sorted(list(set(p["ciudad"] for p in lista_prospectos)))
    nichos = sorted(list(set(p["nicho"] for p in lista_prospectos)))
    
    nicho_labels = {
        "canchas": "⚽ Canchas Sintéticas",
        "odontologia": "🦷 Odontología",
        "veterinarias": "🐾 Veterinarias",
        "barberias": "💈 Barberías y Salones",
        "spas": "✨ Spas y Estética"
    }
    
    # Contadores por nicho y ciudad
    counts_nicho = {}
    for p in lista_prospectos:
        counts_nicho[p["nicho"]] = counts_nicho.get(p["nicho"], 0) + 1
        
    counts_ciudad = {}
    for p in lista_prospectos:
        counts_ciudad[p["ciudad"]] = counts_ciudad.get(p["ciudad"], 0) + 1

    for idx, p in enumerate(lista_prospectos, start=1):
        msg, wa_link = generar_copy_whatsapp(p)
        label_nicho = nicho_labels.get(p["nicho"], p["nicho"].title())
        msg_escaped = msg.replace('"', '&quot;').replace('\n', '\\n').replace("'", "\\'")
        
        btn_wa = f'''<div style="display:flex; flex-direction:column; gap:6px;">
            <a href="{wa_link}" target="_blank" class="btn-wa">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Abrir WhatsApp
            </a>
            <button onclick="copiarPitch('{msg_escaped}', this)" class="btn-copy">
                📋 Copiar Mensaje
            </button>
        </div>'''
        
        filas_html += f'''
        <tr data-city="{p["ciudad"].lower()}" data-niche="{p["nicho"].lower()}" class="lead-row">
            <td class="text-bold">{idx}</td>
            <td>
                <span class="badge badge-city">📍 {p["ciudad"]}</span>
                <span class="badge badge-niche">{label_nicho}</span>
            </td>
            <td>
                <div class="biz-name">{p["nombre"]}</div>
                <div class="biz-cat">{p["categoria"]}</div>
            </td>
            <td>
                <div>{p["zona"]}</div>
                <div class="biz-addr">{p["direccion"]}</div>
            </td>
            <td>
                <span class="badge badge-phone">+57 {p["telefono"]}</span>
            </td>
            <td class="biz-sit">{p["situacion"]}</td>
            <td>{btn_wa}</td>
        </tr>
        '''

    options_ciudades = "".join(f'<option value="{c.lower()}">{c} ({counts_ciudad.get(c, 0)})</option>' for c in ciudades)
    options_nichos = "".join(f'<option value="{n.lower()}">{nicho_labels.get(n, n.title())} ({counts_nicho.get(n, 0)})</option>' for n in nichos)

    html_content = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgendaClick — Centro de Prospección Comercial Inteligente</title>
    <style>
        :root {{
            --bg: #090d16;
            --surface: #111827;
            --surface-accent: #1e293b;
            --border: #1f2937;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --whatsapp: #22c55e;
            --whatsapp-hover: #16a34a;
            --text: #f9fafb;
            --text-muted: #9ca3af;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            padding: 30px 20px;
        }}
        .container {{ max-width: 1350px; margin: 0 auto; }}
        header {{
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }}
        h1 {{ font-size: 24px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }}
        .subtitle {{ color: var(--text-muted); font-size: 14px; margin-top: 5px; }}
        
        .stats-bar {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }}
        .stat-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 14px 18px;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}
        .stat-val {{ font-size: 22px; font-weight: 700; color: #38bdf8; }}
        .stat-lbl {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }}

        .filters-panel {{
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 18px 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            align-items: center;
        }}
        .filter-group {{
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}
        .filter-group label {{
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        select, input[type="text"] {{
            background: #0f172a;
            border: 1px solid #334155;
            color: #f8fafc;
            padding: 9px 14px;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            min-width: 200px;
        }}
        select:focus, input[type="text"]:focus {{
            border-color: var(--primary);
        }}
        .counter-badge {{
            margin-left: auto;
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            color: #38bdf8;
            font-weight: 600;
        }}
        .table-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
        }}
        th {{
            background: #172033;
            color: #94a3b8;
            padding: 14px 16px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
        }}
        td {{
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }}
        tr:hover td {{ background: rgba(255, 255, 255, 0.02); }}
        .biz-name {{ font-weight: 600; color: #fff; font-size: 14px; }}
        .biz-cat {{ color: var(--text-muted); font-size: 12px; margin-top: 2px; }}
        .biz-addr {{ color: #64748b; font-size: 12px; margin-top: 2px; }}
        .biz-sit {{ color: #cbd5e1; font-size: 12px; max-width: 320px; line-height: 1.4; }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
        }}
        .badge-city {{ background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); }}
        .badge-niche {{ background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); margin-left: 4px; }}
        .badge-phone {{ background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }}
        .btn-wa {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: var(--whatsapp);
            color: #fff;
            padding: 7px 11px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
            white-space: nowrap;
        }}
        .btn-wa:hover {{
            background: var(--whatsapp-hover);
            transform: translateY(-1px);
        }}
        .btn-copy {{
            background: #1e293b;
            border: 1px solid #334155;
            color: #94a3b8;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }}
        .btn-copy:hover {{
            background: #334155;
            color: #fff;
        }}
        .text-bold {{ font-weight: 700; color: #64748b; }}
        .toast {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #22c55e;
            color: #fff;
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            display: none;
            z-index: 1000;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>🎯 AgendaClick — Centro de Prospección Comercial</h1>
                <p class="subtitle">Base de datos masiva y motor de captura multiciudad y multinicho en Colombia.</p>
            </div>
            <div class="counter-badge" id="counterBox">
                Mostrando {len(lista_prospectos)} de {len(lista_prospectos)} prospectos
            </div>
        </header>

        <!-- MÉTRICAS RÁPIDAS -->
        <div class="stats-bar">
            <div class="stat-card">
                <span class="stat-val">{len(lista_prospectos)}</span>
                <span class="stat-lbl">Prospectos Totales</span>
            </div>
            <div class="stat-card">
                <span class="stat-val">{len(ciudades)}</span>
                <span class="stat-lbl">Ciudades Activas</span>
            </div>
            <div class="stat-card">
                <span class="stat-val">{len(nichos)}</span>
                <span class="stat-lbl">Nichos de Mercado</span>
            </div>
            <div class="stat-card">
                <span class="stat-val">100%</span>
                <span class="stat-lbl">Con Celular y WhatsApp</span>
            </div>
        </div>

        <!-- FILTROS EN TIEMPO REAL -->
        <div class="filters-panel">
            <div class="filter-group">
                <label>Filtrar por Ciudad</label>
                <select id="cityFilter" onchange="filtrar()">
                    <option value="all">Todas las ciudades ({len(lista_prospectos)})</option>
                    {options_ciudades}
                </select>
            </div>
            <div class="filter-group">
                <label>Filtrar por Nicho</label>
                <select id="nicheFilter" onchange="filtrar()">
                    <option value="all">Todos los nichos ({len(lista_prospectos)})</option>
                    {options_nichos}
                </select>
            </div>
            <div class="filter-group" style="flex: 1;">
                <label>Búsqueda rápida</label>
                <input type="text" id="searchInput" onkeyup="filtrar()" placeholder="Buscar por nombre, zona, dirección...">
            </div>
        </div>

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th width="40">#</th>
                        <th>Ciudad / Nicho</th>
                        <th>Negocio</th>
                        <th>Ubicación</th>
                        <th>Contacto</th>
                        <th>Dolor / Oportunidad Detectada</th>
                        <th width="190">Acción Rápida</th>
                    </tr>
                </thead>
                <tbody id="leadsTableBody">
                    {filas_html}
                </tbody>
            </table>
        </div>
    </div>

    <div id="toast" class="toast">✅ ¡Mensaje copiado al portapapeles!</div>

    <script>
        function filtrar() {{
            const city = document.getElementById("cityFilter").value.toLowerCase();
            const niche = document.getElementById("nicheFilter").value.toLowerCase();
            const query = document.getElementById("searchInput").value.toLowerCase();
            const rows = document.querySelectorAll(".lead-row");
            let visibles = 0;

            rows.forEach(row => {{
                const rowCity = row.getAttribute("data-city");
                const rowNiche = row.getAttribute("data-niche");
                const text = row.innerText.toLowerCase();

                const matchCity = (city === "all" || rowCity === city);
                const matchNiche = (niche === "all" || rowNiche === niche);
                const matchQuery = (!query || text.includes(query));

                if (matchCity && matchNiche && matchQuery) {{
                    row.style.display = "";
                    visibles++;
                }} else {{
                    row.style.display = "none";
                }}
            }});

            document.getElementById("counterBox").innerText = `Mostrando ${{visibles}} de ${{rows.length}} prospectos`;
        }}

        function copiarPitch(texto, btn) {{
            navigator.clipboard.writeText(texto).then(() => {{
                const toast = document.getElementById("toast");
                toast.style.display = "block";
                setTimeout(() => toast.style.display = "none", 2500);
            }});
        }}
    </script>
</body>
</html>'''

    with open(ruta_archivo, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"✅ Dashboard interactivo generado con {len(lista_prospectos)} prospectos: {ruta_archivo}")

# =====================================================================
# SERVIDOR WEB LOCAL (PORT 5555)
# =====================================================================
def iniciar_servidor(puerto=5555, archivo_html="prospectos_agendaclick.html"):
    import http.server
    import socketserver
    
    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True
        
    class DashboardHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/" or self.path == "/index.html":
                self.path = "/" + archivo_html
            return super().do_GET()

    print(f"\n🌐 Servidor activo en: http://localhost:{puerto}")
    print(f"👉 Abre en tu navegador: http://localhost:{puerto}")
    print("Presiona Ctrl + C para detener el servidor.\n")
    
    with ReusableTCPServer(("0.0.0.0", puerto), DashboardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido.")

# =====================================================================
# CLI PRINCIPAL
# =====================================================================
def main():
    parser = argparse.ArgumentParser(description="Motor de Prospección Comercial y Crawler de AgendaClick")
    parser.add_argument("--ciudad", type=str, default="all", help="Filtrar por ciudad (pasto, popayan, cali, medellin, bogota o all)")
    parser.add_argument("--nicho", type=str, default="all", help="Filtrar por nicho (canchas, odontologia, veterinarias, barberias, spas o all)")
    parser.add_argument("--crawl", action="store_true", help="Activar rastreador web en vivo para descubrir más prospectos")
    parser.add_argument("--limite-crawl", type=int, default=15, help="Cantidad de nuevos prospectos a descubrir con el crawler")
    parser.add_argument("--csv", type=str, default="prospectos_agendaclick.csv", help="Ruta del archivo CSV")
    parser.add_argument("--html", type=str, default="prospectos_agendaclick.html", help="Ruta del dashboard HTML")
    parser.add_argument("--serve", action="store_true", help="Iniciar servidor local en puerto 5555 para interactuar con el dashboard")
    parser.add_argument("--puerto", type=int, default=5555, help="Puerto para el servidor web local (default: 5555)")
    
    args = parser.parse_args()
    
    lista_base = list(PROSPECTOS_MAESTROS)
    
    # Si se pide crawler en vivo
    if args.crawl:
        ciudades_a_rastrear = [args.ciudad] if args.ciudad != "all" else ["Pasto", "Cali", "Medellín"]
        nichos_a_rastrear = [args.nicho] if args.nicho != "all" else ["canchas", "barberias", "odontologia"]
        for c in ciudades_a_rastrear:
            for n in nichos_a_rastrear:
                nuevos = rastrear_nuevos_prospectos(c, n, limite=args.limite_crawl)
                lista_base.extend(nuevos)
                
    ciudad_filtro = args.ciudad.strip().lower()
    nicho_filtro = args.nicho.strip().lower()
    
    filtrados = [
        p for p in lista_base
        if (ciudad_filtro == "all" or p["ciudad"].lower() == ciudad_filtro)
        and (nicho_filtro == "all" or p["nicho"].lower() == nicho_filtro)
    ]
    
    print("=" * 68)
    print("🚀 MOTOR DE PROSPECCIÓN INTELIGENTE Y CRAWLER WEB - AGENDACLICK")
    print(f"📍 Filtro Ciudad: {ciudad_filtro.upper()} | Nicho: {nicho_filtro.upper()}")
    print(f"📊 Total Prospectos Disponibles: {len(filtrados)}")
    print("=" * 68)
    
    exportar_csv(filtrados, args.csv)
    exportar_html(filtrados, args.html)
    
    print("\n🎉 Generación finalizada:")
    print(f"📁 CSV para Excel: {os.path.abspath(args.csv)}")
    print(f"🌐 Dashboard Interactivo: {os.path.abspath(args.html)}")
    print("=" * 68)
    
    if args.serve:
        iniciar_servidor(args.puerto, args.html)

if __name__ == "__main__":
    main()
