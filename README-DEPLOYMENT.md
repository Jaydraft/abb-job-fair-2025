# Despliegue en Railway - Feria de Trabajo ABB

## Situación
Como no tendrás tu computadora el día de la feria de trabajo, hemos configurado Railway como solución en la nube.

## ¿Qué es Railway?
Railway es una plataforma de hosting en la nube que:
- ✅ Mantiene las carpetas organizadas (`coop/` y `part-time/`)
- ✅ No tiene límites de uso como Netlify
- ✅ Funciona sin tu computadora
- ✅ Accesible desde cualquier dispositivo móvil
- ✅ Almacenamiento persistente para los archivos

## Pasos para Desplegar

### 1. Crear cuenta en Railway
1. Ve a https://railway.app
2. Regístrate con tu cuenta de GitHub o Google
3. Confirma tu email

### 2. Desplegar desde GitHub
1. Sube este proyecto a un repositorio de GitHub
2. En Railway, haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### 3. Configurar Variables de Entorno
En Railway, ve a Variables y agrega:
```
NODE_ENV=production
PORT=3000
```

### 4. Configurar Volumen Persistente
1. Ve a la pestaña "Settings" de tu proyecto
2. Busca "Volumes"
3. Agrega un volumen montado en `/app/data`
4. Esto asegura que los archivos no se pierdan

## URLs Importantes
- **Aplicación principal**: `https://tu-app.railway.app`
- **Código QR**: `https://tu-app.railway.app/qr`
- **Admin (aplicaciones)**: `https://tu-app.railway.app/admin/applications`

## Para el Día de la Feria
1. Comparte la URL principal con los participantes
2. Usa el código QR para fácil acceso
3. Los archivos se guardarán automáticamente en:
   - `uploads/coop/` - Para posiciones Co-op
   - `uploads/part-time/` - Para posiciones Part-time
4. Revisa las aplicaciones en `/admin/applications`

## Ventajas de Railway
- 🌐 Acceso global (no necesitas Wi-Fi específico)
- 📱 Compatible con dispositivos móviles
- 💾 Almacenamiento persistente
- 🔄 Reinicio automático si hay problemas
- 📊 Sin límites de uso para eventos

## Alternativa Rápida: Render
Si Railway no funciona, también puedes usar Render.com con los mismos archivos.