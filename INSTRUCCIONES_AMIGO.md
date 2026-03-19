# Instrucciones para ejecutar el proyecto Alros Inmobiliaria

Este proyecto es una aplicación web moderna construida con **Next.js 15**, **React 19**, **Tailwind CSS** y **Supabase** como base de datos.

## Requisitos Previos

- **Node.js**: Asegúrate de tener instalada la versión 18.x o superior de Node.js. Puedes descargarla en [nodejs.org](https://nodejs.org/).

## Pasos para ejecutar en local

1.  **Copiar los archivos**: Copia todo el contenido de esta carpeta (o del pendrive) a una carpeta local en tu ordenador.
2.  **Instalar dependencias**: Abre una terminal (o símbolo del sistema) en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```
    *Esto descargará todas las librerías necesarias (como Lucide React, Framer Motion, etc.).*

3.  **Variables de Entorno**: El archivo `.env.local` ya está incluido en la carpeta raíz. Contiene las credenciales de conexión a Supabase. **No lo borres**, ya que es necesario para que la web pueda leer las propiedades desde la base de datos.

4.  **Ejecutar el servidor de desarrollo**: Una vez instaladas las dependencias, ejecuta:
    ```bash
    npm run dev
    ```

5.  **Abrir en el navegador**: Abre tu navegador y ve a:
    [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

- `src/app`: Contiene las páginas de la aplicación.
- `src/components`: Componentes reutilizables (Galería, Mapa, Filtros, etc.).
- `public/propiedades`: Aquí puedes añadir carpetas con fotos locales para las propiedades (usando el ID de referencia).
- `src/lib/supabase.ts`: Configuración de la conexión a la base de datos.

## Panel de Administración

Para gestionar las propiedades, puedes acceder a:
[http://localhost:3000/admin](http://localhost:3000/admin)

Desde allí puedes añadir nuevas propiedades, subir fotos (vía URLs de Google Drive o locales) y confirmar la ubicación exacta en el mapa usando coordenadas.

---
*Desarrollado con ❤️ por Antigravity (Google DeepMind Team).*
