import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import ReportsDashboard from '@/components/reports/ReportsDashboard'

export const metadata = {
  title: 'Reportes | Desk20',
  description: 'Métricas y estadísticas de tickets'
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener usuario
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true 
    }
  })

  if (!user || user.role === 'CUSTOMER') {
    redirect('/dashboard')
  }

  const openTicketsCount = await prisma.ticket.count({ where: { status: 'OPEN' } })

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      <Sidebar user={user} openTicketsCount={openTicketsCount} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600 mt-1">Analiza el rendimiento y distribución de los tickets</p>
          </div>

          <ReportsDashboard />
        </div>
      </main>
    </div>
  )
}
