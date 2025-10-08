const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static('.'));

// Página del QR
app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Crear carpetas si no existen - adaptado para Railway
const uploadsDir = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'uploads')
    : path.join(__dirname, 'uploads');
const partTimeDir = path.join(uploadsDir, 'part-time');
const coopDir = path.join(uploadsDir, 'coop');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(partTimeDir)) {
    fs.mkdirSync(partTimeDir, { recursive: true });
}
if (!fs.existsSync(coopDir)) {
    fs.mkdirSync(coopDir, { recursive: true });
}

// Configuración para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Usar timestamp para evitar conflictos, luego renombraremos
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const tempFileName = `temp_${timestamp}${extension}`;
        
        cb(null, tempFileName);
    }
});

// Solo permitir ciertos tipos de archivo
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo PDF, DOC y DOCX permitidos'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // máximo 5MB
    },
    fileFilter: fileFilter
});

// Ruta para manejar el envío del formulario
app.post('/submit-application', upload.single('resume'), (req, res) => {
    try {
        const { fullName, email, phone, workType } = req.body;
        const resumeFile = req.file;

        // Validar datos requeridos
        if (!fullName || !email || !workType) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios'
            });
        }

        if (!resumeFile) {
            return res.status(400).json({
                success: false,
                message: 'El resume es obligatorio'
            });
        }

        // Crear el nombre final del archivo
        const nombre = fullName || 'Sin_Nombre';
        const nombreLimpio = nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_');
        const extension = path.extname(resumeFile.originalname);
        const nombreFinal = `${nombreLimpio}${extension}`;

        // Determinar la carpeta de destino
        let carpetaDestino = uploadsDir;
        if (workType === 'part-time') {
            carpetaDestino = partTimeDir;
        } else if (workType === 'coop') {
            carpetaDestino = coopDir;
        }

        // Mover el archivo temporal a la carpeta correcta con el nombre correcto
        const archivoTemporal = path.join(uploadsDir, resumeFile.filename);
        const archivoFinal = path.join(carpetaDestino, nombreFinal);

        console.log('📁 Procesando archivo:');
        console.log('  - Archivo temporal:', archivoTemporal);
        console.log('  - Archivo final:', archivoFinal);
        console.log('  - Existe temporal?', fs.existsSync(archivoTemporal));
        console.log('  - Carpeta destino existe?', fs.existsSync(path.dirname(archivoFinal)));

        try {
            // Verificar que el archivo temporal existe
            if (!fs.existsSync(archivoTemporal)) {
                throw new Error(`Archivo temporal no encontrado: ${archivoTemporal}`);
            }

            // Verificar que la carpeta destino existe
            const carpetaDestinoPath = path.dirname(archivoFinal);
            if (!fs.existsSync(carpetaDestinoPath)) {
                console.log('📂 Creando carpeta destino:', carpetaDestinoPath);
                fs.mkdirSync(carpetaDestinoPath, { recursive: true });
            }

            // Mover el archivo
            fs.renameSync(archivoTemporal, archivoFinal);
            console.log('✅ Archivo movido exitosamente a:', archivoFinal);
            
            // Verificar que el archivo se movió correctamente
            if (fs.existsSync(archivoFinal)) {
                console.log('✅ Confirmado: archivo existe en destino final');
            } else {
                console.log('❌ Error: archivo no existe en destino final después del movimiento');
            }
            
        } catch (moveError) {
            console.error('❌ Error moviendo archivo:', moveError);
            try {
                // Si falla el movimiento, intentar copiar y eliminar
                console.log('🔄 Intentando copiar y eliminar...');
                fs.copyFileSync(archivoTemporal, archivoFinal);
                fs.unlinkSync(archivoTemporal);
                console.log('✅ Archivo copiado exitosamente');
            } catch (copyError) {
                console.error('❌ Error copiando archivo:', copyError);
                throw copyError;
            }
        }

        // Crear registro
        const applicationData = {
            timestamp: new Date().toISOString(),
            fullName: fullName,
            email: email,
            phone: phone || 'No proporcionado',
            workType: workType,
            resumeFileName: nombreFinal,
            resumeOriginalName: resumeFile.originalname,
            resumeSize: resumeFile.size
        };

        // Guardar en JSON - adaptado para Railway
        const applicationsFile = process.env.RAILWAY_VOLUME_MOUNT_PATH 
            ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'applications.json')
            : path.join(__dirname, 'applications.json');
        let applications = [];

        if (fs.existsSync(applicationsFile)) {
            const data = fs.readFileSync(applicationsFile, 'utf8');
            applications = JSON.parse(data);
        }

        applications.push(applicationData);
        fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));

        console.log('Nueva aplicación recibida:', applicationData); // debug

        res.json({
            success: true,
            message: 'Aplicación enviada exitosamente',
            applicationId: applications.length
        });

    } catch (error) {
        console.error('Error procesando aplicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para ver las aplicaciones (solo para administradores)
app.get('/admin/applications', (req, res) => {
    try {
        const applicationsFile = process.env.RAILWAY_VOLUME_MOUNT_PATH 
            ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'applications.json')
            : path.join(__dirname, 'applications.json');
        
        if (!fs.existsSync(applicationsFile)) {
            return res.json({ applications: [] });
        }

        const data = fs.readFileSync(applicationsFile, 'utf8');
        const applications = JSON.parse(data);

        res.json({ applications: applications });
    } catch (error) {
        console.error('Error obteniendo aplicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo aplicaciones'
        });
    }
});

// Ruta para descargar resumes (solo para administradores)
app.get('/admin/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Buscar el archivo en las diferentes carpetas
        const possiblePaths = [
            path.join(partTimeDir, filename),
            path.join(coopDir, filename),
            path.join(uploadsDir, filename) // Para archivos antiguos
        ];
        
        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error descargando archivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error descargando archivo'
        });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Acceso público en http://192.168.0.6:${PORT}`);
    console.log(`Directorio de uploads: ${uploadsDir}`);
});