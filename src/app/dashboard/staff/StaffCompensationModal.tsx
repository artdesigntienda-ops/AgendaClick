'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Percent, Briefcase, TrendingUp, CheckCircle, Sparkles, DollarSign, Target, Award } from 'lucide-react'
import { updateStaffCompensation } from './actions'
import { toast } from 'sonner'

interface StaffCompensationModalProps {
  isOpen: boolean
  onClose: () => void
  member: any
  clinicName: string
}

export function StaffCompensationModal({ isOpen, onClose, member, clinicName }: StaffCompensationModalProps) {
  const existingCompensation = member?.bank_payout_info?.compensation || {}

  const [compType, setCompType] = useState<'percentage' | 'fixed_salary' | 'base_plus_target'>(
    existingCompensation.compensation_type || 'percentage'
  )

  const [commissionRate, setCommissionRate] = useState<number>(
    existingCompensation.commission_rate !== undefined 
      ? existingCompensation.commission_rate 
      : (member?.default_commission_rate !== undefined ? member.default_commission_rate : 50)
  )

  const [baseSalary, setBaseSalary] = useState<number>(
    existingCompensation.base_salary || 1423500
  )

  const [targetAmount, setTargetAmount] = useState<number>(
    existingCompensation.target_amount || 2500000
  )

  const [targetCommissionRate, setTargetCommissionRate] = useState<number>(
    existingCompensation.target_commission_rate || 20
  )

  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !member) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await updateStaffCompensation(member.id, {
        compensation_type: compType,
        commission_rate: Number(commissionRate) || 0,
        base_salary: Number(baseSalary) || 0,
        target_amount: Number(targetAmount) || 0,
        target_commission_rate: Number(targetCommissionRate) || 0
      })
      toast.success(`Esquema de remuneración para ${member.name} actualizado correctamente.`)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la configuración.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCOP = (val: number) => {
    return `$${Number(val || 0).toLocaleString('es-CO')} COP`
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black p-6 text-white flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Liquidación & Remuneración</span>
              </div>
              <h2 className="text-xl font-black">{member.name || member.email}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{clinicName} • Configurar condiciones salariales</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Selector de Esquema */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Selecciona el modelo de remuneración:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Opción 1: Porcentaje de Comisión */}
                <button
                  type="button"
                  onClick={() => setCompType('percentage')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    compType === 'percentage'
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      compType === 'percentage' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Percent className="w-4 h-4" />
                    </div>
                    {compType === 'percentage' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">Comisión por Servicio</h3>
                    <p className={`text-[11px] mt-0.5 leading-tight ${compType === 'percentage' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Desde 0% hasta 100%
                    </p>
                  </div>
                </button>

                {/* Opción 2: Salario Básico Fijo */}
                <button
                  type="button"
                  onClick={() => setCompType('fixed_salary')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    compType === 'fixed_salary'
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      compType === 'fixed_salary' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    {compType === 'fixed_salary' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">Salario Básico</h3>
                    <p className={`text-[11px] mt-0.5 leading-tight ${compType === 'fixed_salary' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Monto fijo mensual
                    </p>
                  </div>
                </button>

                {/* Opción 3: Salario Básico + Cumplimiento de Meta */}
                <button
                  type="button"
                  onClick={() => setCompType('base_plus_target')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    compType === 'base_plus_target'
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      compType === 'base_plus_target' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    {compType === 'base_plus_target' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">Básico + Meta</h3>
                    <p className={`text-[11px] mt-0.5 leading-tight ${compType === 'base_plus_target' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Fijo + bono por ventas
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Configuración específica según esquema */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
              {compType === 'percentage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Porcentaje de Comisión</h4>
                      <p className="text-xs text-gray-500">
                        El profesional recibe este porcentaje del total de cada servicio que complete.
                      </p>
                    </div>
                    <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      {commissionRate}%
                    </span>
                  </div>

                  {/* Botones de selección rápida */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 mr-1">Rápido:</span>
                    {[100, 70, 60, 50, 45, 40, 30].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionRate(rate)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          commissionRate === rate
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      O escribe un porcentaje exacto (0% a 100%):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                    💡 <strong>Ejemplo:</strong> Si un servicio cuesta <strong>$100.000 COP</strong> y tiene <strong>{commissionRate}%</strong>, el profesional recibe <strong>{formatCOP(100000 * (commissionRate / 100))}</strong> y el negocio retiene <strong>{formatCOP(100000 * ((100 - commissionRate) / 100))}</strong>.
                  </p>
                </div>
              )}

              {compType === 'fixed_salary' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Salario Básico Mensual</h4>
                    <p className="text-xs text-gray-500">
                      Monto fijo asignado para este colaborador, independiente del número de servicios prestados.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Monto Salarial Mensual (COP):
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-gray-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-16 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-xs">COP</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setBaseSalary(1423500)}
                      className="text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      SMLV Colombia ($1.423.500)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseSalary(1800000)}
                      className="text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      $1.800.000 COP
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseSalary(2200000)}
                      className="text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      $2.200.000 COP
                    </button>
                  </div>
                </div>
              )}

              {compType === 'base_plus_target' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Salario Básico + Comisión por Cumplimiento</h4>
                    <p className="text-xs text-gray-500">
                      Garantiza un ingreso base y premia el cumplimiento de metas mensuales de ventas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        1. Salario Básico Fijo:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        2. Meta de Ventas Mensuales:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      3. Porcentaje de Comisión al alcanzar la meta:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={targetCommissionRate}
                        onChange={(e) => setTargetCommissionRate(Math.min(100, Math.max(1, Number(e.target.value))))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="absolute right-4 top-2 text-gray-400 font-bold text-sm">%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                    🎯 <strong>Condición:</strong> Si en el mes el profesional recauda <strong>{formatCOP(targetAmount)}</strong> o más en servicios, recibirá su salario básico de <strong>{formatCOP(baseSalary)}</strong> más el <strong>{targetCommissionRate}%</strong> de comisión sobre lo producido.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Guardar Esquema'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
