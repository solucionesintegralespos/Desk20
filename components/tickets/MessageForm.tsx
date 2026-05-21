'use client'

import { useState } from 'react'
import { Send, Paperclip, Sparkles, File, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MessageFormProps {
  ticketId: string
  currentUserId: string
}

export default function MessageForm({ ticketId, currentUserId }: MessageFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
        } else {
          console.error('Error al subir archivo:', await response.text())
        }
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setLoading(true)

    try {
      const attachmentUrls = await uploadFiles(attachments)
      // Detectar si el mensaje contiene @ia
      const hasAiMention = content.toLowerCase().includes('@ia')
      
      if (hasAiMention) {
        // Primero enviar el mensaje del usuario
        const userMessageResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            content,
            isInternal: true, // Los mensajes con @ia son internos por defecto
            attachments: attachmentUrls,
          }),
        })

        if (!userMessageResponse.ok) {
          throw new Error('Error al enviar mensaje')
        }

        // Luego llamar a la IA
        setAiLoading(true)
        const aiResponse = await fetch('/api/ai/ticket-assist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            userMessage: content,
          }),
        })

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json()
          console.error('Error de IA:', errorData)
          // No lanzamos error para que el mensaje del usuario sí se guarde
        }
      } else {
        // Mensaje normal sin IA
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            content,
            isInternal,
            attachments: attachmentUrls,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al enviar mensaje')
        }
      }

      setContent('')
      setIsInternal(false)
      setAttachments([])
      router.refresh()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    } finally {
      setLoading(false)
      setAiLoading(false)
    }
  }

  return (
    <div className="bg-white border-t p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu respuesta... (usa @ia para obtener ayuda del asistente)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          {content.toLowerCase().includes('@ia') && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
              <Sparkles className="h-4 w-4" />
              <span>El asistente de IA analizará el ticket y te ayudará con una respuesta</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="message-file-upload"
              />
              <label
                htmlFor="message-file-upload"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <Paperclip className="h-5 w-5" />
                <span className="text-sm">Adjuntar archivo</span>
              </label>
            </div>
            
            {!content.toLowerCase().includes('@ia') && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Nota interna</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || aiLoading || !content.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Consultando IA...</span>
              </>
            ) : loading ? (
              <>
                <Send className="h-4 w-4" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Enviar</span>
              </>
            )}
          </button>
        </div>

        {attachments.length > 0 && (
          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Archivos seleccionados ({attachments.length}):
            </p>
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg max-w-md"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
