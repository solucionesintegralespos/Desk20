# Desk20 - Sistema de Soporte Técnico

Sistema de gestión de tickets y soporte al cliente inspirado en Zendesk, construido con Next.js, PostgreSQL y Prisma.

## 🚀 Características

- ✅ **Gestión de Tickets**: Crea, asigna y gestiona tickets de soporte
- 💬 **Sistema de Mensajes**: Conversaciones en tiempo real con clientes
- 👥 **Multi-usuario**: Soporte para agentes, administradores y clientes
- 📊 **Dashboard Analytics**: Estadísticas y métricas de rendimiento
- 🏷️ **Etiquetas y Prioridades**: Organiza tickets por prioridad y categorías
- 📝 **Notas Internas**: Comunicación interna del equipo
- 🔒 **Autenticación**: Sistema seguro con NextAuth
- 📱 **Responsive**: Interfaz adaptable a todos los dispositivos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **UI**: Lucide Icons, date-fns

## 📋 Prerequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## 🔧 Instalación

1. **Clonar e instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Edita `.env` y configura:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/desk20?schema=public"
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Configurar la base de datos**:
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Aplicar migraciones
npm run prisma:push

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

4. **Configurar el almacenamiento de archivos locales**:
```bash
# 1. Asegúrate de que la carpeta exista
mkdir -p public/uploads

# 2. Dale permisos de lectura y escritura a la carpeta
chmod -R 777 public/uploads
```

5. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
desk20.com/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── tickets/      # Gestión de tickets
│   │   ├── messages/     # Mensajes
│   │   └── users/        # Usuarios
│   ├── dashboard/        # Dashboard principal
│   │   └── tickets/      # Vista de tickets
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/        # Componentes del dashboard
│   ├── tickets/          # Componentes de tickets
│   └── ui/               # Componentes UI reutilizables
├── lib/
│   ├── prisma.ts         # Cliente de Prisma
│   └── utils.ts          # Utilidades
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
└── types/                # Tipos de TypeScript
```

## 💾 Modelos de Base de Datos

### User
- Usuarios del sistema (Admin, Agent, Customer)
- Autenticación y perfiles

### Ticket
- Tickets de soporte con estados y prioridades
- Relación con clientes y agentes

### Message
- Mensajes en conversaciones
- Soporte para notas internas

### Interaction
- Historial de interacciones del cliente
- Registros de actividad

### Organization
- Organizaciones de clientes
- Gestión multi-tenant

## 🔐 Autenticación

El sistema usa NextAuth con autenticación por credenciales. Los usuarios pueden:

- Registrarse con email y contraseña
- Iniciar sesión
- Gestionar sesiones seguras

## 📱 Páginas Principales

- `/` - Landing page pública
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/dashboard` - Panel principal con estadísticas
- `/dashboard/tickets/[id]` - Vista detallada de ticket

## 🎨 Personalización

Los colores y estilos se pueden personalizar en:
- [tailwind.config.js](tailwind.config.js) - Tema y colores
- [app/globals.css](app/globals.css) - Estilos globales

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:push       # Aplicar cambios a la BD
npm run prisma:studio     # Abrir Prisma Studio
```

## 🚀 Próximas Funcionalidades

- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con WhatsApp y Email
- [ ] Base de conocimiento (KB)
- [ ] Automatización de tickets
- [ ] Reportes avanzados
- [ ] SLA y métricas de tiempo
- [ ] Integración con Slack/Teams

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para la gestión de soporte técnico moderno.
