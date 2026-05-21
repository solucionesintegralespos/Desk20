import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar un nombre único para evitar conflictos
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    // Sanitize filename to prevent directory traversal
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const fileName = `${uniqueSuffix}-${safeFilename}`
    
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // Asegurarse de que el directorio existe
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignorar si ya existe
    }

    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${fileName}` })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}
