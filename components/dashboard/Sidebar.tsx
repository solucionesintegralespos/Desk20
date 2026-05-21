'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Headphones,
  UserCircle,
  Tag,
  Menu,
  X,
  BarChart2
} from 'lucide-react'
import { useOrg } from '@/components/OrgProvider'

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string
    role?: string
  }
  openTicketsCount?: number
}

export default function Sidebar({ user, openTicketsCount }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { orgName, orgLogo } = useOrg()
  const pathname = usePathname()
  const userRole = user?.role || 'CUSTOMER'


  // Definir navegación según el rol
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    { name: 'Tickets', href: '/dashboard/tickets', icon: MessageSquare, roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    { name: 'Reportes', href: '/dashboard/reports', icon: BarChart2, roles: ['AGENT', 'ADMIN'] },
    { name: 'Categorías', href: '/dashboard/categories', icon: Tag, roles: ['AGENT', 'ADMIN'] },
    { name: 'Clientes', href: '/dashboard/customers', icon: Users, roles: ['AGENT', 'ADMIN'] },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  ]

  // Filtrar navegación por rol
  const navigation = allNavigation.filter(item => item.roles.includes(userRole))

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex flex-shrink-0 items-center justify-between bg-white border-b p-4 w-full">
        <div className="flex items-center space-x-2">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="h-8 object-contain" />
          ) : (
            <Headphones className="h-6 w-6 text-primary-600" />
          )}
          <span className="text-xl font-bold text-gray-900">{orgName}</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b hidden md:block">
          <div className="flex items-center space-x-2">
            {orgLogo ? (
              <img src={orgLogo} alt={orgName} className="h-8 object-contain" />
            ) : (
              <Headphones className="h-8 w-8 text-primary-600" />
            )}
            <span className="text-xl font-bold text-gray-900">{orgName}</span>
          </div>
        </div>

        {/* Mobile header inside sidebar */}
        <div className="p-4 border-b flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-2">
            {orgLogo ? (
              <img src={orgLogo} alt={orgName} className="h-6 object-contain" />
            ) : (
              <Headphones className="h-6 w-6 text-primary-600" />
            )}
            <span className="text-xl font-bold text-gray-900">{orgName}</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isTickets = item.href === '/dashboard/tickets'
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isTickets && openTicketsCount !== undefined && openTicketsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {openTicketsCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition w-full mb-2 ${
              pathname === '/dashboard/profile'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserCircle className="h-5 w-5" />
            <span className="font-medium">Mi Perfil</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  )
}
