'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import ScheduleManager from '@/components/ScheduleManager'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

export function StaffScheduleModal({ 
  isOpen, 
  onClose, 
  member,
  clinicName
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  member: any,
  clinicName: string 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  
  // Extraemos useClinicSchedule del JSON, default true
  const initialUseClinicSchedule = member?.schedule?.useClinicSchedule ?? true

  const [useClinicSchedule, setUseClinicSchedule] = useState(initialUseClinicSchedule)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const scheduleRaw = formData.get('schedule') as string
    
    try {
      let finalSchedule = {}
      if (scheduleRaw) {
        finalSchedule = JSON.parse(scheduleRaw)
      }
      // Asegurar que guardamos la preferencia
      finalSchedule = { ...finalSchedule, useClinicSchedule }

      const { error } = await supabase
        .from('profiles')
        .update({ schedule: finalSchedule })
        .eq('id', member.id)

      if (error) throw error

      toast.success('Horario del profesional actualizado.')
      onClose()
      window.location.reload() // MVP reload para ver cambios
    } catch (error) {
      toast.error('Error al guardar el horario.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-lg font-bold">
              Horario de {member?.name || 'Profesional'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useClinicSchedule}
                  onChange={(e) => setUseClinicSchedule(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-semibold text-blue-900">
                  Mismo horario de {clinicName}
                </span>
              </label>
              <p className="text-xs text-blue-700 mt-2 ml-8">
                Si esta opción está marcada, el profesional heredará los horarios de apertura y almuerzo del negocio.
              </p>
            </div>

            {!useClinicSchedule && (
              <div className="animate-fade-in-up">
                <h3 className="text-sm font-bold mb-4 text-gray-700">Horario Personalizado</h3>
                <ScheduleManager initialSchedule={member?.schedule} />
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Horario'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
