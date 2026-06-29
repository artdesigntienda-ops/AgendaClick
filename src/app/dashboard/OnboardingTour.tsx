'use client'

import { useEffect, useRef } from 'react'
import { driver, Config } from 'driver.js'
import 'driver.js/dist/driver.css'
import { markTutorialAsSeen } from './actions'

interface Props {
  hasSeenTutorial: boolean
  role: 'owner' | 'staff'
}

export function OnboardingTour({ hasSeenTutorial, role }: Props) {
  const isOwner = role === 'owner'
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const startTour = () => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        nextBtnText: 'Siguiente &rarr;',
        prevBtnText: '&larr; Anterior',
        doneBtnText: 'Empezar a usar',
        progressText: 'Paso {{current}} de {{total}}',
        onDestroyed: () => {
          // Si el usuario destruye el tour (lo termina o lo salta) 
          // y no lo había visto antes, lo marcamos como visto.
          if (!hasSeenTutorial) {
            markTutorialAsSeen()
          }
        },
        steps: [
          {
            element: '#tour-calendar',
            popover: {
              title: 'Tu Agenda Maestra',
              description: 'Aquí es donde verás todas tus citas. Mantén el control total de tu tiempo día a día.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-settings',
            popover: {
              title: isOwner ? 'Configura tu Estética' : 'Tu Perfil',
              description: isOwner 
                ? 'Sube tu logo, establece tus horarios y genera tu link único de reservas.'
                : 'Completa tu información personal y verifica tus horarios.',
              side: 'right',
              align: 'start'
            }
          },
          ...(isOwner ? [
            {
              element: '#tour-services',
              popover: {
                title: 'El Menú de Servicios',
                description: 'Crea los servicios que ofreces, asígnales un precio y su duración exacta.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-staff',
              popover: {
                title: 'Tu Equipo de Trabajo',
                description: 'Invita a tus profesionales para que tengan su propia agenda sincronizada a la tuya.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-finances',
              popover: {
                title: 'Tus Finanzas',
                description: 'Mira cuánto has facturado, y las comisiones que le tocan a cada profesional de tu equipo.',
                side: 'right',
                align: 'start'
              }
            }
          ] : []),
          {
            element: '#tour-help',
            popover: {
              title: '¿Necesitas ayuda?',
              description: 'Siempre puedes volver a ver este recorrido interactivo haciendo clic aquí.',
              side: 'right',
              align: 'start'
            }
          }
        ]
      })

      // Try to start immediately. 
      // If elements are not rendered yet, it will safely ignore or show warning in console.
      setTimeout(() => {
        driverObj.drive()
      }, 500)
    }

    // Trigger on first load if they haven't seen it
    if (!hasSeenTutorial && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      startTour()
    }

    // Listen to manual triggers from the "Help" button
    const handleManualTrigger = () => {
      startTour()
    }

    document.addEventListener('start-tour', handleManualTrigger)
    return () => document.removeEventListener('start-tour', handleManualTrigger)
  }, [hasSeenTutorial, isOwner])

  return null
}
