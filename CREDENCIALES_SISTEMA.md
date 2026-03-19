# 🔐 Credenciales y Datos Técnicos del Sistema

Este documento contiene la información necesaria para el mantenimiento técnico de la plataforma Alros Inmobiliaria.

> **IMPORTANTE**: No compartas este archivo públicamente, ya que contiene las llaves de acceso a tu base de datos en la nube.

## 1. Acceso a la Web (Desarrollo Local)

- **URL Pública**: [http://localhost:3000](http://localhost:3000)
- **Panel de Administración**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - *Nota*: Actualmente el panel de administración no requiere contraseña para facilitar el desarrollo, pero se recomienda añadir una capa de seguridad (Supabase Auth) antes de publicarlo en internet.

## 2. Base de Datos (Supabase)

La plataforma utiliza **Supabase** como backend. Los datos están sincronizados en la nube.

- **Panel de Control de Supabase**: [https://supabase.com/dashboard/project/mtfpcchshhjazxtfovyt](https://supabase.com/dashboard/project/mtfpcchshhjazxtfovyt)
- **URL del Proyecto**: `https://mtfpcchshhjazxtfovyt.supabase.co`

### Llaves de API (Copia de seguridad del .env.local)

Si por algún motivo pierdes el archivo `.env.local`, estos son los valores que debe contener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mtfpcchshhjazxtfovyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZnBjY2hzaGhqYXp4dGZvdnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDM0MzEsImV4cCI6MjA4MTMxOTQzMX0.VPr4pF-UBoNyVVbHC-vA4IqM3R8D21VnHAOJGNuJB4Y
```

## 3. Almacenamiento de Fotos

- **Fotos Locales**: Se guardan en `public/propiedades/[REFERENCIA]`.
- **Fotos Externas**: Se recomienda usar Google Drive (usando el formato de enlace compartido que el sistema ya sabe convertir).

---
*Para cualquier duda técnica, contacta con el equipo de desarrollo.*
