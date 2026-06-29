'use client'

import { useState } from 'react'

export interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart: string
  breakEnd: string
}

export interface ClinicSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  special_dates: any[] // Mantenemos para MVP futuro
}

const defaultDay: DaySchedule = {
  isOpen: true,
  openTime: '09:00',
  closeTime: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00'
}

const defaultSchedule: ClinicSchedule = {
  monday: { ...defaultDay },
  tuesday: { ...defaultDay },
  wednesday: { ...defaultDay },
  thursday: { ...defaultDay },
  friday: { ...defaultDay },
  saturday: { ...defaultDay, closeTime: '14:00', breakStart: '', breakEnd: '' },
  sunday: { ...defaultDay, isOpen: false, breakStart: '', breakEnd: '' },
  special_dates: []
}

const DAYS_ES = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

export default function ScheduleManager({ initialSchedule }: { initialSchedule?: any }) {
  const [schedule, setSchedule] = useState<ClinicSchedule>(() => {
    // Si ya existe schedule en DB, lo usamos, si no, default
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      return { ...defaultSchedule, ...initialSchedule }
    }
    return defaultSchedule
  })

  const updateDay = (day: keyof ClinicSchedule, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] as DaySchedule),
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-4">
      {/* Hidden input para mandar todo el JSON en el FormData */}
      <input type="hidden" name="schedule" value={JSON.stringify(schedule)} />

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
        {(Object.keys(DAYS_ES) as Array<keyof typeof DAYS_ES>).map((day) => {
          const config = schedule[day] as DaySchedule
          return (
            <div key={day} className="p-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:bg-gray-100">
              <div className="w-32 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.isOpen}
                  onChange={(e) => updateDay(day, 'isOpen', e.target.checked)}
                  className="w-5 h-5 rounded text-black focus:ring-black border-gray-300"
                />
                <span className={`font-medium ${config.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                  {DAYS_ES[day]}
                </span>
              </div>

              {config.isOpen ? (
                <div className="flex-1 flex flex-wrap items-center gap-4 animate-fade-in-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">De</span>
                    <input
                      type="time"
                      value={config.openTime}
                      onChange={(e) => updateDay(day, 'openTime', e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm focus:ring-black focus:border-black"
                    />
                    <span className="text-sm text-gray-500">a</span>
                    <input
                      type="time"
                      value={config.closeTime}
                      onChange={(e) => updateDay(day, 'closeTime', e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Almuerzo:</span>
                    <input
                      type="time"
                      value={config.breakStart}
                      onChange={(e) => updateDay(day, 'breakStart', e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="text-sm text-gray-500">-</span>
                    <input
                      type="time"
                      value={config.breakEnd}
                      onChange={(e) => updateDay(day, 'breakEnd', e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-gray-400 text-sm italic">Cerrado</div>
              )}
            </div>
          )
        })}
      </div>
      
      <p className="text-xs text-gray-500">
        * Si no tienes hora de almuerzo, puedes dejar esos campos en blanco (--:--).
      </p>
    </div>
  )
}
