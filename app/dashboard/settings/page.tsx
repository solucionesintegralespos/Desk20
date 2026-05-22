import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatGPTSettings from '@/components/settings/ChatGPTSettings'
import TwoFactorSettings from '@/components/settings/TwoFactorSettings'
import GeneralSettings from '@/components/settings/GeneralSettings'
import { Settings as SettingsIcon, Mail, Globe, Shield } from 'lucide-react'

export const metadata = {
  title: 'Configuración | Desk20',
  description: 'Configuración del sistema'
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener usuario completo con su rol
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      twoFactorEnabled: true
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Validar que solo ADMIN pueda acceder
  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Solo ADMIN ve todos los tickets
  const openTicketsCount = await prisma.ticket.count({ where: { status: 'OPEN' } })

  // Obtener estadísticas del sistema
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.category.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ])

  // Obtener configuración de ChatGPT
  const chatgptSetting = await prisma.setting.findUnique({
    where: { key: 'chatgpt_api_key' }
  })

  // Obtener configuracion de Organizacion
  const orgSettings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['org_name', 'org_email', 'org_logo']
      }
    }
  })

  const orgInfo = orgSettings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      <Sidebar user={user} openTicketsCount={openTicketsCount} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600 mt-1">Administra la configuración del sistema</p>
          </div>

          {/* Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[0]}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[1]}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[2]}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[3]}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

          </div>

          {/* Secciones de Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Autenticación de Dos Factores */}
            <TwoFactorSettings
              initialEnabled={user.twoFactorEnabled}
              userId={user.id}
            />

            {/* Integración ChatGPT */}
            <ChatGPTSettings initialApiKey={chatgptSetting?.value} />

            {/* Configuración General */}
            <GeneralSettings
              initialOrgName={orgInfo.org_name}
              initialOrgEmail={orgInfo.org_email}
              initialOrgLogo={orgInfo.org_logo}
            />

            {/* Configuración de Sistema */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Sistema</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Versión del Sistema</p>
                  <p className="text-sm text-gray-600">v1.1.1</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Base de Datos</p>
                  <p className="text-sm text-gray-600">PostgreSQL (Conectado)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Última Actualización</p>
                  <p className="text-sm text-gray-600">22 de Mayo de 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Las opciones de configuración están en desarrollo. Próximamente podrás editar todos estos valores y personalizar tu sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
