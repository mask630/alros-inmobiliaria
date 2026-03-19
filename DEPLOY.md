# Guía de Despliegue - Alros Inmobiliaria

Esta guía te ayudará a poner tu nueva aplicación web en internet para que sea accesible públicamente.

## 1. Requisitos Previos

- Una cuenta en [GitHub](https://github.com/) (para guardar el código).
- Una cuenta en [Vercel](https://vercel.com/) (para alojar la web).
- Una cuenta en [Supabase](https://supabase.com/) (para la base de datos).

## 2. Configurar Base de Datos (Supabase)

1.  Inicia sesión en **Supabase** y crea un "New Project".
2.  Ponle un nombre (ej. `Alros Inmobiliaria`) y una contraseña segura para la base de datos.
3.  Espera a que se configure.
4.  Ve al apartado **SQL Editor** en la barra lateral.
5.  Copia el contenido del archivo `supabase/schema.sql` de este proyecto.
6.  Pégalo en el editor de Supabase y dale a **Run**. Esto creará todas las tablas necesarias.

## 3. Subir Código a GitHub

1.  Crea un **nuevo repositorio** en GitHub (ej. `alros-web`).
2.  En tu ordenador, abre la terminal en la carpeta del proyecto y ejecuta:
    ```bash
    git add .
    git commit -m "Primera versión completa"
    git remote add origin https://github.com/TU_USUARIO/alros-web.git
    git push -u origin main
    ```

## 4. Desplegar en Vercel

1.  Inicia sesión en **Vercel** y haz clic en "Add New..." -> "Project".
2.  Importa el repositorio de GitHub que acabas de crear.
3.  En la configuración del proyecto ("Configure Project"):
    - **Framework Preset**: Next.js (se detectará solo).
    - **Environment Variables**: Aquí tendrás que añadir las claves de Supabase más adelante para que la web real pueda conectar con la base de datos. Por ahora, como estamos usando datos de prueba (mock data) en el frontend, puedes saltar este paso o añadir las claves si ya quieres conectar el backend real.
4.  Haz clic en **Deploy**.

## 5. ¡Listo!

Vercel te dará una URL (ej. `alros-inmobiliaria.vercel.app`) donde tu web estará visible para todo el mundo.

---

## Notas Adicionales

- **Dominio Personalizado**: Si ya tienes un dominio `alros.eu`, puedes conectarlo en la configuración de Vercel en la sección "Domains".
- **Datos Reales**: Actualmente la web muestra datos de prueba. Para conectar datos reales, necesitarás actualizar los componentes para que hagan "fetch" a Supabase usando un cliente de Supabase para Next.js.
