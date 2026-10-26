#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor de Prospección Comercial Multiciudad y Multinicho - AgendaClick
=====================================================================
Permite prospectar y generar contactos de WhatsApp con pitch persuasivo
para múltiples nichos de negocio y principales ciudades de Colombia:
- Nichos: Canchas Sintéticas, Odontólogos, Barberías/Salones, Veterinarias, Spas
- Ciudades: Pasto, Popayán, Cali, Medellín, Bogotá (expandible)
"""

import os
import sys
import csv
import json
import argparse
import urllib.parse
from datetime import datetime

# =====================================================================
# BASE DE DATOS DE PROSPECTOS CALIFICADOS POR CIUDAD Y NICHO
# =====================================================================
PROSPECTOS = [
    # -------------------------------------------------------------
    # ⚽ CANCHAS SINTÉTICAS DE FÚTBOL
    # -------------------------------------------------------------
    {
        "id": "canchas_pasto_01",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Fútbol 5",
        "nombre": "Canchas Sintéticas La Pasión del Fútbol",
        "direccion": "Cra. 5 #13-54",
        "zona": "Centro - Oriente",
        "telefono": "3116030335",
        "tipo_telefono": "celular",
        "situacion": "Alquiler de canchas por horas. Manejan reservas por llamadas y WhatsApp que saturan en tardes y fines de semana.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_pasto_02",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas / Complejo Deportivo",
        "nombre": "Canchas Sintéticas Tiro Libre",
        "direccion": "Calle 12 #6-50 (Contiguo Estadio Libertad)",
        "zona": "Chapal / Estadio Libertad",
        "telefono": "3154201122",
        "tipo_telefono": "celular",
        "situacion": "Alto flujo por cercanía al estadio. Cruces frecuentes de horarios en torneos y partidos nocturnos.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_popayan_01",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Fútbol 5 y 8",
        "nombre": "Canchas Sintéticas Hugool Popayán",
        "direccion": "Carrera 6A #10 Norte-1, Barrio Bolívar",
        "zona": "Norte / Bolívar",
        "telefono": "3023492940",
        "tipo_telefono": "celular",
        "situacion": "Complejo muy reconocido. Utilizan plataformas externas costosas; prospecto ideal para migración y ahorro del 50%.",
        "tipo_pitch": "canchas_migracion"
    },
    {
        "id": "canchas_cali_01",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Fútbol 5",
        "nombre": "Euforia Fútbol 5 Cali",
        "direccion": "Calle 12A, Barrio Primero de Mayo / Santa Anita",
        "zona": "Comuna 17 (Sur de Cali)",
        "telefono": "3137681332",
        "tipo_telefono": "celular",
        "situacion": "Tres canchas grandes sintéticas de alto tráfico. Demasiado tiempo administrativo confirmando transferencias de abonos.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_cali_02",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "canchas",
        "categoria": "Complejo Deportivo y Canchas Sintéticas",
        "nombre": "Club Deportivo South Park Cali",
        "direccion": "Sector Sur de Cali, Vía Pance",
        "zona": "Sur / Pance",
        "telefono": "3158904512",
        "tipo_telefono": "celular",
        "situacion": "Múltiples canchas de fútbol 5 y 7. Necesitan autogestión de reservas 24/7 para no perder clientes de noche.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_medellin_01",
        "ciudad": "Medellín",
        "departamento": "Antioquia",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Techadas",
        "nombre": "Elite del Fútbol Medellín",
        "direccion": "Cra. 56B #49A-29 (Pisos 16 y 18, C.C. Elite de la Moda)",
        "zona": "Centro / El Hueco",
        "telefono": "3137217108",
        "tipo_telefono": "celular",
        "situacion": "Canchas con vista panorámica en pisos altos. Alta demanda ejecutiva después de las 6 PM.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_medellin_02",
        "ciudad": "Medellín",
        "departamento": "Antioquia",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Deportivas",
        "nombre": "Canchas San Ignacio Estadio",
        "direccion": "Diagonal a la Estación Metro Estadio",
        "zona": "Estadio / Laureles",
        "telefono": "3116063484",
        "tipo_telefono": "celular",
        "situacion": "Ubicación inmejorable en Laureles. Gestión de reservas telefónicas que saturan las líneas.",
        "tipo_pitch": "canchas_futbol"
    },
    {
        "id": "canchas_bogota_01",
        "ciudad": "Bogotá",
        "departamento": "Cundinamarca",
        "nicho": "canchas",
        "categoria": "Canchas Sintéticas Fútbol 5 y 8",
        "nombre": "Canchas Sintéticas Maracaná Bogotá",
        "direccion": "Autopista Norte # 224-60",
        "zona": "Norte / Suba - Usaquén",
        "telefono": "3103214589",
        "tipo_telefono": "celular",
        "situacion": "Complejo masivo de canchas para torneos empresariales. Requieren cobro y confirmación automática.",
        "tipo_pitch": "canchas_futbol"
    },

    # -------------------------------------------------------------
    # 🦷 ODONTÓLOGOS Y CLÍNICAS ODONTOLÓGICAS
    # -------------------------------------------------------------
    {
        "id": "odonto_pasto_01",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "odontologia",
        "categoria": "Clínica Odontológica Especializada",
        "nombre": "Clínica Odontológica Smile Pasto",
        "direccion": "Edificio Calle Real Center (Cra. 25 # 20-65)",
        "zona": "Centro / Valle de Atriz",
        "telefono": "3216425714",
        "tipo_telefono": "celular",
        "situacion": "Tratamientos de ortodoncia y diseño de sonrisa. Pacientes potenciales consultan de noche y recepcionista atiende hasta las 6 PM.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_pasto_02",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "odontologia",
        "categoria": "Odontología Integral y Estética",
        "nombre": "Odontología Láser Pasto",
        "direccion": "Calle 19 # 31C - 12, Edificio Net 31",
        "zona": "Maridíaz",
        "telefono": "3147148692",
        "tipo_telefono": "celular",
        "situacion": "Procedimientos estéticos de alto valor. Necesitan citas sin inasistencias (*no-shows*) mediante recordatorios automatizados.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_pasto_03",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "odontologia",
        "categoria": "IPS Odontológica",
        "nombre": "Montident IPS Clínica Odontológica",
        "direccion": "Calle 17 # 29-84, Edificio Montilla",
        "zona": "San Andrés",
        "telefono": "3176445230",
        "tipo_telefono": "celular",
        "situacion": "Múltiples especialistas trabajando en sillones independientes. Requiere sincronización con Google Calendar.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_popayan_01",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "odontologia",
        "categoria": "Clínica Odontológica Integral",
        "nombre": "Dental.D Clínica Odontológica Popayán",
        "direccion": "Carrera 11 # 8N - 96, Barrio Santa Clara",
        "zona": "Santa Clara",
        "telefono": "3216455224",
        "tipo_telefono": "celular",
        "situacion": "Consultas odontológicas y valoraciones. Buscan canal de agendamiento directo desde pauta y redes.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_popayan_02",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "odontologia",
        "categoria": "Clínica de Ortodoncia",
        "nombre": "Ortho-rident Clínica de Ortodoncia",
        "direccion": "Carrera 9 # 18N - 65 (Avenida Panamericana)",
        "zona": "Norte / Panamericana",
        "telefono": "3137200481",
        "tipo_telefono": "celular",
        "situacion": "Gran volumen de controles mensuales de ortodoncia (15 a 20 min). Caos al coordinar horas por chat.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_cali_01",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "odontologia",
        "categoria": "Centro Odontológico Especializado",
        "nombre": "Oral Home Odontología Cali",
        "direccion": "Calle 5 # 38-25, Barrio Tequendama",
        "zona": "Tequendama / Sector Médico",
        "telefono": "3164521098",
        "tipo_telefono": "celular",
        "situacion": "Sector médico de alta competencia. Pacientes exigen inmediatez para valorar citas sin llamar.",
        "tipo_pitch": "odontologia"
    },
    {
        "id": "odonto_bogota_01",
        "ciudad": "Bogotá",
        "departamento": "Cundinamarca",
        "nicho": "odontologia",
        "categoria": "Clínica Odontológica y Estética Dental",
        "nombre": "Dental Art Especialistas Bogotá",
        "direccion": "Carrera 15 # 104-33, Chicó Navarra",
        "zona": "Chicó / Usaquén",
        "telefono": "3108745120",
        "tipo_telefono": "celular",
        "situacion": "Pacientes de estrato 4, 5 y 6 que valoran agendar online a medianoche o festivos con sincronización de calendario.",
        "tipo_pitch": "odontologia"
    },

    # -------------------------------------------------------------
    # 🐾 VETERINARIAS Y CUIDADO DE MASCOTAS
    # -------------------------------------------------------------
    {
        "id": "vet_pasto_01",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "veterinarias",
        "categoria": "Clínica Veterinaria y Peluquería Canina",
        "nombre": "VetBlu Clínica Veterinaria Pasto",
        "direccion": "Carrera 33 # 8 - 141",
        "zona": "Sur - Occidente",
        "telefono": "3236583064",
        "tipo_telefono": "celular",
        "situacion": "Atención médica y servicio de spa canino. Cruces continuos entre turnos de peluquería y consultas de rutina.",
        "tipo_pitch": "veterinarias"
    },
    {
        "id": "vet_pasto_02",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "veterinarias",
        "categoria": "Centro Canino y Veterinaria",
        "nombre": "Olfatos Pet Center Maridíaz",
        "direccion": "Calle 18 # 34-09, Barrio Maridíaz",
        "zona": "Maridíaz",
        "telefono": "3154331959",
        "tipo_telefono": "celular",
        "situacion": "Sede urbana con guardería y peluquería. Sábados con saturación de llamadas para apartar baño.",
        "tipo_pitch": "veterinarias"
    },
    {
        "id": "vet_popayan_01",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "veterinarias",
        "categoria": "Clínica Veterinaria",
        "nombre": "La Veterinaria Popayán",
        "direccion": "Transversal 9 # 62N 83, Barrio Bella Vista",
        "zona": "Bella Vista / Norte",
        "telefono": "3012284396",
        "tipo_telefono": "celular",
        "situacion": "Consultas veterinarias y vacunación programada. Los dueños olvidan las fechas si no reciben recordatorio.",
        "tipo_pitch": "veterinarias"
    },
    {
        "id": "vet_popayan_02",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "veterinarias",
        "categoria": "Clínica Veterinaria Integral",
        "nombre": "C.V. Pelos & Patas Popayán",
        "direccion": "Carrera 10 # 1N – 58, Barrio Modelo",
        "zona": "Modelo",
        "telefono": "3113725268",
        "tipo_telefono": "celular",
        "situacion": "Peluquería canina de alta demanda. Horarios fijos de baño y corte para evitar esperas y estrés en los animales.",
        "tipo_pitch": "veterinarias"
    },
    {
        "id": "vet_cali_01",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "veterinarias",
        "categoria": "Hospital y Spa Veterinario",
        "nombre": "Animal Center Cali",
        "direccion": "Avenida 6N # 24N-15, Santa Mónica",
        "zona": "Norte / Santa Mónica",
        "telefono": "3186523901",
        "tipo_telefono": "celular",
        "situacion": "Servicios veterinarios y grooming canino premium. Clientes desean reservar fecha exacta de baño desde su Instagram.",
        "tipo_pitch": "veterinarias"
    },

    # -------------------------------------------------------------
    # 💈 BARBERÍAS Y SALONES DE BELLEZA
    # -------------------------------------------------------------
    {
        "id": "barber_pasto_01",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "barberias",
        "categoria": "Barbería / Cortes Masculinos",
        "nombre": "Los Más Bárbaros Barbershop",
        "direccion": "Cra. 26 #11-42, Barrio San Felipe",
        "zona": "San Felipe",
        "telefono": "3183599334",
        "tipo_telefono": "celular",
        "situacion": "Atención en local y a domicilio. Manejan citas manualmente por WhatsApp.",
        "tipo_pitch": "barberia_manual"
    },
    {
        "id": "barber_pasto_02",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "barberias",
        "categoria": "Salón de Belleza y Peluquería Integral",
        "nombre": "Peluquería Alejandro Unicentro",
        "direccion": "C.C. Unicentro Pasto, Local 2-68",
        "zona": "Unicentro",
        "telefono": "3185892807",
        "tipo_telefono": "celular",
        "situacion": "Alto tráfico en centro comercial. Se forman filas y llamadas en horas pico.",
        "tipo_pitch": "barberia_alto_trafico"
    },
    {
        "id": "barber_pasto_03",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "barberias",
        "categoria": "Peluquería y Colorimetría",
        "nombre": "Alfonso Peluquería y Estética",
        "direccion": "C.C. Unicentro Pasto, Local 2-40",
        "zona": "Unicentro",
        "telefono": "3185874519",
        "tipo_telefono": "celular",
        "situacion": "Ubicado en centro comercial. Ideal para agendar turnos antes de llegar.",
        "tipo_pitch": "barberia_alto_trafico"
    },
    {
        "id": "barber_pasto_04",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "barberias",
        "categoria": "Barbería Urbana / Fade & Barba",
        "nombre": "Vikings Barber Company Pasto",
        "direccion": "Calle 21 #31C - 36",
        "zona": "Centro - Occidente",
        "telefono": "3217509139",
        "tipo_telefono": "celular",
        "situacion": "Cortes modernos con múltiples barberos que requieren repartir la agenda sin cruces.",
        "tipo_pitch": "barberia_equipo"
    },
    {
        "id": "barber_popayan_01",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "barberias",
        "categoria": "Barbería y Estética Masculina",
        "nombre": "JL Barber Club Popayán",
        "direccion": "Calle 4 Norte # 12-40, Barrio Santa Clara",
        "zona": "Santa Clara",
        "telefono": "3146892301",
        "tipo_telefono": "celular",
        "situacion": "Barbería juvenil de alta rotación. Clientes piden turnos de noche por WhatsApp.",
        "tipo_pitch": "barberia_manual"
    },
    {
        "id": "barber_cali_01",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "barberias",
        "categoria": "Barber Studio & Coffee",
        "nombre": "Gentleman Barber Studio Cali",
        "direccion": "Calle 9 # 62-44, Barrio Gran Limonar",
        "zona": "Gran Limonar / Sur",
        "telefono": "3178541290",
        "tipo_telefono": "celular",
        "situacion": "Barbería con café y cerveza. Clientes agendan servicios combinados de corte y barba.",
        "tipo_pitch": "barberia_equipo"
    },
    {
        "id": "barber_medellin_01",
        "ciudad": "Medellín",
        "departamento": "Antioquia",
        "nicho": "barberias",
        "categoria": "Barbería Clásica y Moderna",
        "nombre": "The Barber House Laureles",
        "direccion": "Circular 4 # 73-20, Laureles",
        "zona": "Laureles",
        "telefono": "3127894561",
        "tipo_telefono": "celular",
        "situacion": "Zona concurrida en Laureles. Barberos independientes que arriendan silla y necesitan su propio horario.",
        "tipo_pitch": "barberia_equipo"
    },

    # -------------------------------------------------------------
    # ✨ SPAS Y CENTROS DE ESTÉTICA
    # -------------------------------------------------------------
    {
        "id": "spa_pasto_01",
        "ciudad": "Pasto",
        "departamento": "Nariño",
        "nicho": "spas",
        "categoria": "Spa / Cuidado Facial y Corporal",
        "nombre": "Terapiel Estética y Spa",
        "direccion": "Carrera 35 # 15-34, Local 3, Barrio San Ignacio",
        "zona": "San Ignacio",
        "telefono": "3022425775",
        "tipo_telefono": "celular",
        "situacion": "Tratamientos estéticos que requieren tiempo de preparación de cabina y abono previo.",
        "tipo_pitch": "spas"
    },
    {
        "id": "spa_popayan_01",
        "ciudad": "Popayán",
        "departamento": "Cauca",
        "nicho": "spas",
        "categoria": "Centro de Relajación y Estética",
        "nombre": "Vitality Spa Popayán",
        "direccion": "Calle 19N # 8-32, Barrio Prados del Norte",
        "zona": "Prados del Norte",
        "telefono": "3165214789",
        "tipo_telefono": "celular",
        "situacion": "Masajes en pareja y limpiezas faciales. Inasistencias causan cabinas desocupadas y pérdidas.",
        "tipo_pitch": "spas"
    },
    {
        "id": "spa_cali_01",
        "ciudad": "Cali",
        "departamento": "Valle del Cauca",
        "nicho": "spas",
        "categoria": "Spa Médico y Cosmetología",
        "nombre": "Aura Spa & Wellness Cali",
        "direccion": "Carrera 38 # 4A-12, Barrio San Fernando",
        "zona": "San Fernando",
        "telefono": "3154872130",
        "tipo_telefono": "celular",
        "situacion": "Procedimientos estéticos no invasivos. Requieren confirmación automática por email y WhatsApp.",
        "tipo_pitch": "spas"
    }
]

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
                f"Les escribo porque varios administradores de canchas sintéticas en Colombia nos comentan que están pagando más de $150.000 o $250.000 mensuales en plataformas de agendamiento que cobran de más o tienen soporte lento.\n\n"
                f"En AgendaClick (https://www.agendaclick.com.co) ofrecemos la plataforma completa para que sus jugadores reserven su cancha 24/7, elijan hora y confirmen turnos desde solo $59.000 COP al mes, con soporte directo en Colombia.\n\n"
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
            f"La recepcionista suele atender en horario de oficina (hasta las 6 PM), pero muchos pacientes buscan agendar una cita o valoración dental a las 9 o 10 de la noche desde su celular... y si nadie responde, buscan otra clínica.\n\n"
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
            f"Sabemos que en centros de estética y spa en {zona}, cuando una clienta no llega a su cita a última hora, deja la cabina vacía y el especialista sin producir.\n\n"
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
# EXPORTACIÓN EN CSV (COMPATIBLE CON EXCEL UTF-8)
# =====================================================================
def exportar_csv(lista_prospectos, ruta_archivo="prospectos_agendaclick_todos.csv"):
    with open(ruta_archivo, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID",
            "Ciudad",
            "Departamento",
            "Nicho",
            "Categoría",
            "Nombre del Negocio",
            "Dirección",
            "Zona",
            "Teléfono / WhatsApp",
            "Situación / Oportunidad",
            "Enlace Directo WhatsApp"
        ])
        for p in lista_prospectos:
            msg, wa_link = generar_copy_whatsapp(p)
            writer.writerow([
                p["id"],
                p["ciudad"],
                p["departamento"],
                p["nicho"],
                p["categoria"],
                p["nombre"],
                p["direccion"],
                p["zona"],
                p["telefono"],
                p["situacion"],
                wa_link if wa_link else "N/A"
            ])
    print(f"✅ Archivo CSV generado con {len(lista_prospectos)} prospectos: {ruta_archivo}")

# =====================================================================
# DASHBOARD INTERACTIVO MULTICIUDAD Y MULTINICHO (HTML + JS)
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
    
    for idx, p in enumerate(lista_prospectos, start=1):
        msg, wa_link = generar_copy_whatsapp(p)
        label_nicho = nicho_labels.get(p["nicho"], p["nicho"].title())
        
        btn_wa = f'''<a href="{wa_link}" target="_blank" class="btn-wa">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            Contactar WhatsApp
        </a>'''
        
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

    options_ciudades = "".join(f'<option value="{c.lower()}">{c}</option>' for c in ciudades)
    options_nichos = "".join(f'<option value="{n.lower()}">{nicho_labels.get(n, n.title())}</option>' for n in nichos)

    html_content = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgendaClick - Centro de Prospección Comercial</title>
    <style>
        :root {{
            --bg: #090d16;
            --surface: #111827;
            --surface-accent: #1e293b;
            --border: #1f2937;
            --primary: #3b82f6;
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
        .container {{ max-width: 1300px; margin: 0 auto; }}
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
            font-size: 12px;
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
            min-width: 180px;
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
        .biz-sit {{ color: #cbd5e1; font-size: 12px; max-width: 280px; line-height: 1.4; }}
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
            gap: 6px;
            background: var(--whatsapp);
            color: #fff;
            padding: 8px 12px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            white-space: nowrap;
        }}
        .btn-wa:hover {{
            background: var(--whatsapp-hover);
            transform: translateY(-1px);
        }}
        .text-bold {{ font-weight: 700; color: #64748b; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>🎯 AgendaClick — Centro de Prospección Multiciudad</h1>
                <p class="subtitle">Prospectos calificados de Canchas Sintéticas, Odontología, Mascotas, Barberías y Spas en Colombia.</p>
            </div>
            <div class="counter-badge" id="counterBox">
                Mostrando {len(lista_prospectos)} de {len(lista_prospectos)} prospectos
            </div>
        </header>

        <!-- FILTROS EN TIEMPO REAL -->
        <div class="filters-panel">
            <div class="filter-group">
                <label>Filtrar por Ciudad</label>
                <select id="cityFilter" onchange="filtrar()">
                    <option value="all">Todas las ciudades ({len(ciudades)})</option>
                    {options_ciudades}
                </select>
            </div>
            <div class="filter-group">
                <label>Filtrar por Nicho</label>
                <select id="nicheFilter" onchange="filtrar()">
                    <option value="all">Todos los nichos ({len(nichos)})</option>
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
                        <th width="180">Acción Rápida</th>
                    </tr>
                </thead>
                <tbody id="leadsTableBody">
                    {filas_html}
                </tbody>
            </table>
        </div>
    </div>

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
    </script>
</body>
</html>'''

    with open(ruta_archivo, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"✅ Dashboard interactivo generado con {len(lista_prospectos)} prospectos: {ruta_archivo}")

def iniciar_servidor(puerto=5555, archivo_html="prospectos_agendaclick.html"):
    """Inicia un servidor web local y abre el dashboard interactivo"""
    import http.server
    import socketserver
    
    class DashboardHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/" or self.path == "/index.html":
                self.path = "/" + archivo_html
            return super().do_GET()

    print(f"\n🌐 Servidor activo en: http://localhost:{puerto}")
    print(f"👉 Abre en tu navegador: http://localhost:{puerto}")
    print("Presiona Ctrl + C para detener el servidor.\n")
    
    with socketserver.TCPServer(("", puerto), DashboardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido.")

# =====================================================================
# CLI PRINCIPAL
# =====================================================================
def main():
    parser = argparse.ArgumentParser(description="Motor de Prospección Comercial de AgendaClick")
    parser.add_argument("--ciudad", type=str, default="all", help="Filtrar por ciudad (pasto, popayan, cali, medellin, bogota o all)")
    parser.add_argument("--nicho", type=str, default="all", help="Filtrar por nicho (canchas, odontologia, veterinarias, barberias, spas o all)")
    parser.add_argument("--csv", type=str, default="prospectos_agendaclick.csv", help="Ruta del archivo CSV")
    parser.add_argument("--html", type=str, default="prospectos_agendaclick.html", help="Ruta del dashboard HTML")
    parser.add_argument("--serve", action="store_true", help="Iniciar servidor local en puerto 5555 para interactuar con el dashboard")
    parser.add_argument("--puerto", type=int, default=5555, help="Puerto para el servidor web local (default: 5555)")
    
    args = parser.parse_args()
    
    ciudad_filtro = args.ciudad.strip().lower()
    nicho_filtro = args.nicho.strip().lower()
    
    filtrados = [
        p for p in PROSPECTOS
        if (ciudad_filtro == "all" or p["ciudad"].lower() == ciudad_filtro)
        and (nicho_filtro == "all" or p["nicho"].lower() == nicho_filtro)
    ]
    
    print("=" * 65)
    print("🚀 MOTOR DE PROSPECCIÓN MULTICIUDAD Y MULTINICHO - AGENDACLICK")
    print(f"📍 Filtro Ciudad: {ciudad_filtro.upper()} | Nicho: {nicho_filtro.upper()}")
    print(f"📊 Total Prospectos Calificados: {len(filtrados)}")
    print("=" * 65)
    
    exportar_csv(filtrados, args.csv)
    exportar_html(filtrados, args.html)
    
    print("\n🎉 Archivos listos:")
    print(f"📁 CSV para Excel: {os.path.abspath(args.csv)}")
    print(f"🌐 Dashboard Interactivo: {os.path.abspath(args.html)}")
    print("=" * 65)
    
    if args.serve:
        iniciar_servidor(args.puerto, args.html)

if __name__ == "__main__":
    main()
