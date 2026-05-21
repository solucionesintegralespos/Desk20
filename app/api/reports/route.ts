import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')

    const where: any = {}
    if (fromStr || toStr) {
      where.createdAt = {}
      if (fromStr) where.createdAt.gte = new Date(fromStr)
      if (toStr) {
        const toDate = new Date(toStr)
        toDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = toDate
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      select: {
        createdAt: true,
        status: true,
        assignee: { select: { name: true, email: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    const assigneeMap = new Map<string, { open: number, closed: number }>()
    const categoryMap = new Map<string, number>()
    const monthMap = new Map<string, number>()
    const statusMap = new Map<string, number>()

    for (const t of tickets) {
      // Asignado
      const agentName = t.assignee?.name || t.assignee?.email || 'Sin Asignar'
      if (!assigneeMap.has(agentName)) assigneeMap.set(agentName, { open: 0, closed: 0 })
      const counts = assigneeMap.get(agentName)!
      if (['OPEN', 'PENDING'].includes(t.status)) {
        counts.open++
      } else {
        counts.closed++
      }

      // Categoría
      const catName = t.category?.name || 'Sin Categoría'
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)

      // Mes
      const monthKey = format(t.createdAt, 'MMM yyyy', { locale: es })
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1)

      // Estado
      statusMap.set(t.status, (statusMap.get(t.status) || 0) + 1)
    }

    const ticketsByAssignee = Array.from(assigneeMap.entries()).map(([name, data]) => ({ name, ...data }))
    const ticketsByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
    const ticketsByMonth = Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }))
    const ticketsByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }))

    return NextResponse.json({
      ticketsByAssignee,
      ticketsByCategory,
      ticketsByMonth,
      ticketsByStatus
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
