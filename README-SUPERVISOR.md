# Sistema de Organización de Aplicaciones - ABB Job Fair 2025

## 📁 Estructura de Carpetas

El sistema organiza automáticamente las aplicaciones en carpetas según el tipo de trabajo:

```
uploads/
├── coop/           # Aplicaciones para Co-op
└── part-time/      # Aplicaciones para Part-time
```

## 🔧 Configuración Actual

### Servidor Local (Recomendado para Job Fair)
- **URL**: http://localhost:3000
- **Funcionalidad**: Completa organización por carpetas
- **Archivos**: Se guardan físicamente en las carpetas correspondientes
- **Estado**: ✅ Funcionando correctamente

### Servidor en Vercel (Alternativa en la nube)
- **Funcionalidad**: API serverless con organización por carpetas
- **Archivos**: Se organizan en carpetas temporales y se registran en JSON
- **Estado**: 🔄 Configurado y listo para desplegar

## 📊 Información para el Supervisor

### Acceso a las Aplicaciones

1. **Carpeta Coop**: `/uploads/coop/`
   - Contiene todos los CVs de aplicantes para posiciones Co-op
   - Formato de archivo: `Nombre_Apellido_timestamp_archivo.pdf`

2. **Carpeta Part-time**: `/uploads/part-time/`
   - Contiene todos los CVs de aplicantes para posiciones Part-time
   - Formato de archivo: `Nombre_Apellido_timestamp_archivo.pdf`

### Datos de Aplicaciones

- **Archivo JSON**: `applications.json`
- **Contiene**: Información completa de cada aplicante
- **Campos**: Nombre, apellido, email, teléfono, tipo de trabajo, mensaje, ruta del archivo

### API para Consultas

- **Endpoint**: `/api/applications`
- **Respuesta**: Lista organizada por carpetas con resumen estadístico

```json
{
  "applications": {
    "coop": [...],
    "partTime": [...]
  },
  "summary": {
    "total": 25,
    "coop": 15,
    "partTime": 10
  }
}
```

## 🚀 Instrucciones de Uso

### Durante el Job Fair
1. Usar el servidor local: http://localhost:3000
2. Los archivos se guardan automáticamente en las carpetas correctas
3. Revisar las carpetas `uploads/coop/` y `uploads/part-time/` para acceder a los CVs

### Después del Job Fair
1. Hacer backup de las carpetas `uploads/`
2. Exportar el archivo `applications.json`
3. Organizar los archivos según necesidades del departamento

## 📈 Estadísticas en Tiempo Real

El sistema registra:
- Número total de aplicaciones
- Aplicaciones por tipo de trabajo
- Timestamp de cada aplicación
- Información de contacto completa

## 🔒 Seguridad

- Validación de tipos de archivo (PDF, DOC, DOCX, TXT)
- Límite de tamaño: 5MB por archivo
- Nombres de archivo únicos para evitar conflictos
- Organización automática por carpetas

## 📞 Soporte

Para cualquier consulta técnica o problema con el sistema, contactar al equipo de desarrollo.