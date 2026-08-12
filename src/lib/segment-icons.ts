import {
  Scissors,
  HeartHandshake,
  Heart,
  Sparkles,
  Trophy,
  Car,
  GraduationCap,
  PawPrint,
  User,
  Stethoscope,
  Brain,
  Smile,
  Activity,
  Leaf,
  Wrench,
  BookOpen,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'

export interface SegmentConfig {
  /** Icono principal del segmento (para headers) */
  mainIcon: LucideIcon
  /** Icono para la sección "Servicios" en el sidebar */
  servicesIcon: LucideIcon
  /** Icono para la sección "Clientes/CRM" en el sidebar */
  clientsIcon: LucideIcon
  /** Icono por defecto para servicios individuales en la página pública */
  serviceItemIcon: LucideIcon
  /** Label para la sección de clientes en el sidebar */
  clientLabel: string
  /** Label para la sección de servicios en el sidebar */
  serviceLabel: string
  /** Emoji representativo para la UI */
  emoji: string
  /** Nombre legible del segmento */
  displayName: string
}

export const BUSINESS_TYPES: Record<string, SegmentConfig> = {
  belleza: {
    mainIcon: Sparkles,
    servicesIcon: Scissors,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Scissors,
    clientLabel: 'Clientas (CRM)',
    serviceLabel: 'Servicios',
    emoji: '💅',
    displayName: 'Estética y Belleza',
  },
  bienestar: {
    mainIcon: Leaf,
    servicesIcon: Heart,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Leaf,
    clientLabel: 'Clientes (CRM)',
    serviceLabel: 'Servicios',
    emoji: '🧘',
    displayName: 'Spas y Bienestar',
  },
  salud: {
    mainIcon: Heart,
    servicesIcon: Stethoscope,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Heart,
    clientLabel: 'Pacientes (CRM)',
    serviceLabel: 'Servicios',
    emoji: '🏥',
    displayName: 'Clínicas y Centros de Salud',
  },
  psicologia: {
    mainIcon: Brain,
    servicesIcon: Brain,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Brain,
    clientLabel: 'Pacientes (CRM)',
    serviceLabel: 'Servicios',
    emoji: '🧠',
    displayName: 'Psicología y Terapia',
  },
  odontologia: {
    mainIcon: Smile,
    servicesIcon: Smile,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Smile,
    clientLabel: 'Pacientes (CRM)',
    serviceLabel: 'Servicios',
    emoji: '🦷',
    displayName: 'Odontología y Ortodoncia',
  },
  quiropractica: {
    mainIcon: Activity,
    servicesIcon: Activity,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Activity,
    clientLabel: 'Pacientes (CRM)',
    serviceLabel: 'Servicios',
    emoji: '🦴',
    displayName: 'Quiropráctica y Masajes',
  },
  medicina_general: {
    mainIcon: Stethoscope,
    servicesIcon: Stethoscope,
    clientsIcon: HeartHandshake,
    serviceItemIcon: Stethoscope,
    clientLabel: 'Pacientes (CRM)',
    serviceLabel: 'Consultas',
    emoji: '🩺',
    displayName: 'Consulta Médica y Especialistas',
  },
  deportes: {
    mainIcon: Trophy,
    servicesIcon: Trophy,
    clientsIcon: User,
    serviceItemIcon: Trophy,
    clientLabel: 'Jugadores',
    serviceLabel: 'Canchas / Turnos',
    emoji: '🏆',
    displayName: 'Deportes y Canchas',
  },
  automotriz: {
    mainIcon: Car,
    servicesIcon: Wrench,
    clientsIcon: User,
    serviceItemIcon: Car,
    clientLabel: 'Clientes',
    serviceLabel: 'Servicios',
    emoji: '🚗',
    displayName: 'Automotriz y Carga Eléctrica',
  },
  educacion: {
    mainIcon: GraduationCap,
    servicesIcon: BookOpen,
    clientsIcon: User,
    serviceItemIcon: GraduationCap,
    clientLabel: 'Estudiantes',
    serviceLabel: 'Clases / Cursos',
    emoji: '🎓',
    displayName: 'Educación y Clases',
  },
  mascotas: {
    mainIcon: PawPrint,
    servicesIcon: PawPrint,
    clientsIcon: Heart,
    serviceItemIcon: PawPrint,
    clientLabel: 'Clientes',
    serviceLabel: 'Servicios',
    emoji: '🐾',
    displayName: 'Mascotas y Veterinarias',
  },
  profesional: {
    mainIcon: Briefcase,
    servicesIcon: Briefcase,
    clientsIcon: User,
    serviceItemIcon: Briefcase,
    clientLabel: 'Clientes',
    serviceLabel: 'Servicios',
    emoji: '💼',
    displayName: 'Servicios Profesionales',
  },
}

/** Obtiene la configuración de un segmento, con fallback a 'belleza' */
export function getSegmentConfig(businessType: string | null | undefined): SegmentConfig {
  return BUSINESS_TYPES[businessType || 'belleza'] || BUSINESS_TYPES.belleza
}

/** Lista ordenada de opciones para el dropdown de Settings */
export const BUSINESS_TYPE_OPTIONS = Object.entries(BUSINESS_TYPES).map(([key, config]) => ({
  value: key,
  label: `${config.emoji} ${config.displayName}`,
}))
