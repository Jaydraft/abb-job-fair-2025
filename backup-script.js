const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Script de Backup para Aplicaciones de la Feria de Trabajo
 * 
 * Este script descarga automáticamente:
 * 1. Todas las aplicaciones (applications.json)
 * 2. Todos los archivos de resume organizados por carpetas
 * 
 * Uso: node backup-script.js [URL_DE_RAILWAY]
 */

const RAILWAY_URL = process.argv[2] || 'https://tu-app.railway.app';

async function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`Error ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadApplications() {
    try {
        console.log('📥 Descargando lista de aplicaciones...');
        
        const applicationsUrl = `${RAILWAY_URL}/admin/applications`;
        const response = await fetch(applicationsUrl);
        const data = await response.json();
        
        // Crear carpeta de backup
        const backupDir = path.join(__dirname, 'backup', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Guardar applications.json
        const applicationsFile = path.join(backupDir, 'applications.json');
        fs.writeFileSync(applicationsFile, JSON.stringify(data, null, 2));
        console.log(`✅ Aplicaciones guardadas en: ${applicationsFile}`);
        
        // Crear carpetas para resumes
        const coopDir = path.join(backupDir, 'coop');
        const partTimeDir = path.join(backupDir, 'part-time');
        fs.mkdirSync(coopDir, { recursive: true });
        fs.mkdirSync(partTimeDir, { recursive: true });
        
        // Descargar cada resume
        console.log('📥 Descargando archivos de resume...');
        
        for (const app of data.applications || []) {
            try {
                const resumeUrl = `${RAILWAY_URL}/admin/download/${app.resumeFileName}`;
                const destinationDir = app.workType === 'coop' ? coopDir : partTimeDir;
                const destinationFile = path.join(destinationDir, app.resumeFileName);
                
                await downloadFile(resumeUrl, destinationFile);
                console.log(`✅ Descargado: ${app.resumeFileName} (${app.workType})`);
                
            } catch (error) {
                console.error(`❌ Error descargando ${app.resumeFileName}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Backup completado en: ${backupDir}`);
        console.log(`📊 Total aplicaciones: ${data.applications?.length || 0}`);
        console.log(`📁 Carpetas creadas: coop/, part-time/`);
        
    } catch (error) {
        console.error('❌ Error en el backup:', error.message);
        console.log('\n💡 Asegúrate de:');
        console.log('1. Que la URL de Railway sea correcta');
        console.log('2. Que la aplicación esté funcionando');
        console.log('3. Que tengas conexión a internet');
    }
}

// Verificar si se proporcionó URL
if (process.argv.length < 3) {
    console.log('⚠️  Uso: node backup-script.js <URL_DE_RAILWAY>');
    console.log('📝 Ejemplo: node backup-script.js https://mi-app.railway.app');
    process.exit(1);
}

console.log(`🚀 Iniciando backup desde: ${RAILWAY_URL}`);
downloadApplications();