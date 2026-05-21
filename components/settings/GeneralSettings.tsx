'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GeneralSettingsProps {
  initialOrgName?: string
  initialOrgEmail?: string
  initialOrgLogo?: string
}

export default function GeneralSettings({
  initialOrgName = 'Desk20',
  initialOrgEmail = 'soporte@desk20.com',
  initialOrgLogo = ''
}: GeneralSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    org_name: initialOrgName,
    org_email: initialOrgEmail,
    org_logo: initialOrgLogo
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save each setting
      for (const [key, value] of Object.entries(formData)) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      }
      toast.success('Configuración guardada correctamente. Refresca la página para ver los cambios.')
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Información General</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Organización
          </label>
          <input
            type="text"
            value={formData.org_name}
            onChange={e => setFormData({ ...formData, org_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Soporte
          </label>
          <input
            type="email"
            value={formData.org_email}
            onChange={e => setFormData({ ...formData, org_email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL (Opcional)
          </label>
          <input
            type="text"
            value={formData.org_logo}
            onChange={e => setFormData({ ...formData, org_logo: e.target.value })}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {formData.org_logo && (
            <div className="mt-2">
              <img src={formData.org_logo} alt="Logo preview" className="h-8 object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
