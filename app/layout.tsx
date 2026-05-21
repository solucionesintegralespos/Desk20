import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import { OrgProvider } from '@/components/OrgProvider'
import { prisma } from '@/lib/prisma'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['org_name'] } }
  })
  const orgName = settings.find(s => s.key === 'org_name')?.value || 'Desk20'
  
  return {
    title: `${orgName} - Sistema de Soporte Técnico`,
    description: 'Plataforma de gestión de tickets y soporte al cliente',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['org_name', 'org_logo'] } }
  })
  const orgName = settings.find(s => s.key === 'org_name')?.value || 'Desk20'
  const orgLogo = settings.find(s => s.key === 'org_logo')?.value || ''

  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          <OrgProvider orgName={orgName} orgLogo={orgLogo}>
            {children}
            <Toaster position="top-right" />
          </OrgProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
