'use client'

import { useState, useEffect } from 'react'
import { TicketStatus, TicketPriority } from '@prisma/client'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TicketHeaderProps {
  ticket: {
    id: string
    number: number
    subject: string
    status: TicketStatus
    priority: TicketPriority
    assignee: {
      id: string
      name: string | null
      email: string
    } | null
  }
}

const statusLabels = {
  OPEN: 'Abierto',
  PENDING: 'Pendiente',
  SOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

const priorityLabels = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export default function TicketHeader({ ticket }: TicketHeaderProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<Array<{ id: string; name: string | null; email: string }>>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Fetch agents for assignment
    fetch('/api/users?role=AGENT,ADMIN')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAgents(data)
        } else {
          console.error('Expected array of agents, got:', data)
          setAgents([])
        }
      })
      .catch(err => {
        console.error('Error fetching agents:', err)
        setAgents([])
      })
  }, [])

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating assignee:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center space-x-4">
          <Link 
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 mt-1 md:mt-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-gray-900 break-words">
                Ticket #{ticket.number}
              </h1>
              
              {/* Status Dropdown */}
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                disabled={updating}
                className="px-3 py-1 text-sm font-medium rounded-full border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="OPEN">{statusLabels.OPEN}</option>
                <option value="PENDING">{statusLabels.PENDING}</option>
                <option value="SOLVED">{statusLabels.SOLVED}</option>
                <option value="CLOSED">{statusLabels.CLOSED}</option>
              </select>

              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 whitespace-nowrap">
                Prioridad: {priorityLabels[ticket.priority]}
              </span>
            </div>
            <p className="text-gray-600 mt-2 break-words">{ticket.subject}</p>
          </div>
        </div>
        
        {/* Assignee Dropdown */}
        <div className="flex items-center self-start md:self-auto pl-9 md:pl-0">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <select
              value={ticket.assignee?.id || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              disabled={updating}
              className="w-full md:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">Sin asignar</option>
              {Array.isArray(agents) && agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
