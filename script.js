// Variables globales
const form = document.getElementById('jobFairForm');
const successMessage = document.getElementById('successMessage');

// Patrones de validación
const patterns = {
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/
};

// Mensajes de error
const errorMessages = {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingresa un correo electrónico válido (ejemplo: usuario@gmail.com)',
    phone: 'Por favor ingresa un número de teléfono válido',
    name: 'El nombre debe contener al menos 2 caracteres y solo letras',
    workType: 'Selecciona una opción de trabajo',
    terms: 'Debes aceptar los términos y condiciones',
    fileSize: 'El archivo no debe superar los 5MB',
    fileType: 'Solo se permiten archivos PDF, DOC o DOCX'
};

// Cuando esté listo el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando formulario...'); // debug
    initializeForm();
    setupEventListeners();
    setupFileUpload();
    addFormAnimations();
});

// Configuración inicial
function initializeForm() {
    // Limpiar errores
    clearAllErrors();
}

// Event listeners
function setupEventListeners() {
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Para radio buttons
    const workTypeRadios = form.querySelectorAll('input[name="workType"]');
    workTypeRadios.forEach(radio => {
        radio.addEventListener('change', validateWorkTypeSelection);
    });
    
    // Envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Prevenir envío con Enter en campos de texto
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.type !== 'submit') {
            e.preventDefault();
        }
    });
}

// Configurar funcionalidad de subida de archivos
function setupFileUpload() {
    const fileInput = document.getElementById('resume');
    const fileLabel = document.querySelector('.file-upload-label');
    
    // Drag and drop
    fileLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#FF0000';
        this.style.background = '#fff5f5';
    });
    
    fileLabel.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '#fafbfc';
    });
    
    fileLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '#fafbfc';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            updateFileLabel(files[0]);
            validateFile(files[0]);
        }
    });
    
    // Cambio de archivo
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            updateFileLabel(e.target.files[0]);
            validateFile(e.target.files[0]);
        }
    });
}

// Actualizar etiqueta del archivo
function updateFileLabel(file) {
    const label = document.querySelector('.file-upload-label span');
    const icon = document.querySelector('.file-upload-label i');
    
    label.textContent = `Archivo seleccionado: ${file.name}`;
    icon.className = 'fas fa-file-check';
    icon.style.color = '#27ae60';
}

// Validar archivo
function validateFile(file) {
    const fileGroup = document.getElementById('resume').closest('.form-group');
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    clearFieldError(document.getElementById('resume'));
    
    if (!allowedTypes.includes(file.type)) {
        showFieldError(fileGroup, errorMessages.fileType);
        return false;
    }
    
    if (file.size > maxSize) {
        showFieldError(fileGroup, errorMessages.fileSize);
        return false;
    }
    
    return true;
}

// Validar campo individual
function validateField(field) {
    const fieldGroup = field.closest('.form-group');
    const value = field.value.trim();
    
    clearFieldError(field);
    
    // Validación de campos requeridos
    if (field.hasAttribute('required') && !value) {
        showFieldError(fieldGroup, errorMessages.required);
        return false;
    }
    
    // Validaciones específicas por tipo de campo
    if (value) {
        switch (field.type) {
            case 'email':
                // Validación básica de formato
                if (!patterns.email.test(value)) {
                    showFieldError(fieldGroup, errorMessages.email);
                    return false;
                }
                
                // Validaciones adicionales para email
                if (value.length > 254) {
                    showFieldError(fieldGroup, 'El correo electrónico es demasiado largo');
                    return false;
                }
                
                // Verificar que no tenga espacios
                if (value.includes(' ')) {
                    showFieldError(fieldGroup, 'El correo electrónico no puede contener espacios');
                    return false;
                }
                
                // Verificar que tenga al menos un punto después del @
                const atIndex = value.indexOf('@');
                const lastDotIndex = value.lastIndexOf('.');
                if (atIndex === -1 || lastDotIndex === -1 || lastDotIndex <= atIndex) {
                    showFieldError(fieldGroup, 'El correo debe tener un dominio válido (ej: @gmail.com)');
                    return false;
                }
                
                // Verificar que el dominio tenga al menos 2 caracteres después del último punto
                const domainExtension = value.substring(lastDotIndex + 1);
                if (domainExtension.length < 2) {
                    showFieldError(fieldGroup, 'El dominio debe tener una extensión válida (ej: .com, .org)');
                    return false;
                }
                
                // Validación de dominios comunes mal escritos
                const domain = value.substring(atIndex + 1).toLowerCase();
                const commonDomains = {
                    'gmauil.com': 'gmail.com',
                    'gmai.com': 'gmail.com',
                    'gmial.com': 'gmail.com',
                    'gmaul.com': 'gmail.com',
                    'hotmial.com': 'hotmail.com',
                    'hotmeil.com': 'hotmail.com',
                    'yahooo.com': 'yahoo.com',
                    'yaho.com': 'yahoo.com',
                    'outlok.com': 'outlook.com',
                    'outloook.com': 'outlook.com'
                };
                
                // Verificar dominios mal escritos
                for (const [wrongDomain, correctDomain] of Object.entries(commonDomains)) {
                    if (domain === wrongDomain || domain.includes(wrongDomain.split('.')[0])) {
                        showFieldError(fieldGroup, `¿Quisiste decir "${correctDomain}"? Verifica la escritura del dominio`);
                        return false;
                    }
                }
                
                // Verificar extensiones válidas comunes
                const validExtensions = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'es', 'mx', 'co', 'info', 'biz'];
                if (!validExtensions.includes(domainExtension.toLowerCase())) {
                    showFieldError(fieldGroup, 'Verifica que la extensión del dominio sea correcta (.com, .org, .net, etc.)');
                    return false;
                }
                
                // Verificar que no tenga caracteres consecutivos extraños
                if (value.includes('..') || value.includes('@@') || value.includes('--')) {
                    showFieldError(fieldGroup, 'El correo contiene caracteres duplicados no válidos');
                    return false;
                }
                
                break;
            case 'tel':
                if (!patterns.phone.test(value)) {
                    showFieldError(fieldGroup, errorMessages.phone);
                    return false;
                }
                break;
            case 'text':
                if (field.id === 'fullName' && !patterns.name.test(value)) {
                    showFieldError(fieldGroup, errorMessages.name);
                    return false;
                }
                break;
        }
    }
    
    return true;
}

// Validar selección de tipo de trabajo
function validateWorkTypeSelection() {
    const workTypeRadios = form.querySelectorAll('input[name="workType"]');
    const isAnyChecked = Array.from(workTypeRadios).some(radio => radio.checked);
    const workTypeGroup = workTypeRadios[0].closest('.form-group');
    
    clearFieldError(workTypeRadios[0]);
    
    if (!isAnyChecked) {
        showFieldError(workTypeGroup, errorMessages.workType);
        return false;
    }
    
    return true;
}

// Mostrar error en campo
function showFieldError(fieldGroup, message) {
    fieldGroup.classList.add('error');
    const errorElement = fieldGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Limpiar error de campo
function clearFieldError(field) {
    const fieldGroup = field.closest('.form-group');
    fieldGroup.classList.remove('error');
    const errorElement = fieldGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Limpiar todos los errores
function clearAllErrors() {
    const errorGroups = form.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
}

// Validar todo el formulario
function validateForm() {
    let isValid = true;
    
    // Limpiar errores previos
    clearAllErrors();
    
    // Validar campos individuales
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    console.log('Campos requeridos encontrados:', inputs.length);
    
    inputs.forEach(input => {
        console.log(`Validando campo: ${input.id}, valor: "${input.value.trim()}"`);
        if (!validateField(input)) {
            console.log(`Campo ${input.id} falló la validación`);
            isValid = false;
        }
    });
    
    // Validar selección de tipo de trabajo
    const workTypeSelected = document.querySelector('input[name="workType"]:checked');
    console.log('Tipo de trabajo seleccionado:', workTypeSelected?.value);
    if (!workTypeSelected) {
        console.log('No se seleccionó tipo de trabajo');
        isValid = false;
    }
    
    // Validar archivo si se subió
    const fileInput = document.getElementById('resume');
    console.log('Archivo seleccionado:', fileInput.files.length > 0 ? fileInput.files[0].name : 'ninguno');
    if (fileInput.files.length > 0) {
        if (!validateFile(fileInput.files[0])) {
            console.log('Archivo falló la validación');
            isValid = false;
        }
    } else if (fileInput.hasAttribute('required')) {
        console.log('Archivo requerido pero no seleccionado');
        isValid = false;
    }
    
    console.log('Validación final:', isValid ? 'VÁLIDO' : 'INVÁLIDO');
    return isValid;
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Mostrar loading
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    try {
        // FormData para enviar
        const formData = new FormData();
        
        // Campos del formulario
        const fullName = document.getElementById('fullName').value;
        
        formData.append('fullName', fullName);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value || '');
        formData.append('workType', document.querySelector('input[name="workType"]:checked')?.value || '');
        
        // Experiencias (si hay)
        const experiencias = Array.from(document.querySelectorAll('input[name="experiencia"]:checked'))
            .map(checkbox => checkbox.value);
        formData.append('experiencias', JSON.stringify(experiencias.length > 0 ? experiencias : []));
        
        // Resume si existe
        const fileInput = document.getElementById('resume');
        if (fileInput.files[0]) {
            formData.append('resume', fileInput.files[0]);
        }
        
        // Validar antes de enviar
        if (!fullName.trim()) {
            throw new Error('El nombre completo es obligatorio');
        }
        if (!document.getElementById('email').value.trim()) {
            throw new Error('El correo electrónico es obligatorio');
        }
        if (!document.querySelector('input[name="workType"]:checked')) {
            throw new Error('Debes seleccionar un tipo de trabajo');
        }
        if (!fileInput.files[0]) {
            throw new Error('Debes subir tu resume');
        }
        
        console.log('Enviando formulario...'); // debug
        
        // Enviar al servidor
        const response = await fetch('/submit-application', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Formulario enviado exitosamente:', result);
            showSuccessMessage();
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error completo:', error);
        let errorMessage = 'Hubo un error al enviar tu aplicación. ';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'Verifica tu conexión a internet y que el servidor esté funcionando.';
        } else if (error.message.includes('413')) {
            errorMessage += 'El archivo es demasiado grande. Máximo 5MB.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Datos inválidos. Verifica todos los campos.';
        } else {
            errorMessage += error.message || 'Por favor intenta nuevamente.';
        }
        
        alert(errorMessage);
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Opcional: reiniciar después de unos segundos
    setTimeout(() => {
        if (confirm('¿Deseas registrar otro participante?')) {
            resetForm();
        }
    }, 5000);
}

// Limpiar formulario
function clearForm() {
    if (confirm('¿Estás seguro de que deseas limpiar todos los campos?')) {
        form.reset();
        clearAllErrors();
        resetFileUpload();
        
        // Animación de limpieza
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                }, 100);
            }, index * 50);
        });
    }
}

// Reiniciar subida de archivos
function resetFileUpload() {
    const label = document.querySelector('.file-upload-label span');
    const icon = document.querySelector('.file-upload-label i');
    
    label.textContent = 'Arrastra tu resume aquí o haz clic para seleccionar';
    icon.className = 'fas fa-cloud-upload-alt';
    icon.style.color = '#FF0000';
}

// Reiniciar formulario completo
function resetForm() {
    form.style.display = 'block';
    successMessage.style.display = 'none';
    form.reset();
    clearAllErrors();
    resetFileUpload();
    form.scrollIntoView({ behavior: 'smooth' });
}

// Agregar animaciones al formulario
function addFormAnimations() {
    // Animación de entrada para las secciones
    const sections = form.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Efecto de focus mejorado
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Funciones de utilidad
function getFormData() {
    const formData = new FormData(form);
    const data = {};
    
    // Campos regulares
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error en el formulario:', e.error);
    // En producción, aquí podrías enviar el error a un servicio de logging
});

// Prevenir pérdida de datos
window.addEventListener('beforeunload', function(e) {
    const formData = new FormData(form);
    let hasData = false;
    
    for (let [key, value] of formData.entries()) {
        if (value && value.trim && value.trim() !== '') {
            hasData = true;
            break;
        }
    }
    
    if (hasData && !successMessage.style.display) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que deseas salir? Los datos del formulario se perderán.';
    }
});

// Autoguardado local
function saveToLocalStorage() {
    const data = getFormData();
    localStorage.setItem('jobFairForm', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('jobFairForm');
    if (saved) {
        const data = JSON.parse(saved);
        // Restaurar datos
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                if (field.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else if (field.type === 'checkbox') {
                    field.checked = data[key] === 'on';
                } else {
                    field.value = data[key];
                }
            }
        });
    }
}

// Guardar cada 30 segundos
setInterval(saveToLocalStorage, 30000);

// esto debería ir en otro lado pero funciona aquí
// console.log('Script cargado completamente');