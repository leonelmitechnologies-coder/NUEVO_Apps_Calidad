# Guía de Inicio Rápido

Guía paso a paso para configurar y ejecutar el Sistema de Registro de Asistencia en tu entorno local.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Primer Uso](#primer-uso)
- [Solución de Problemas](#solución-de-problemas)
- [Próximos Pasos](#próximos-pasos)

## ✅ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

1. **Node.js** (versión 16 o superior)
   ```bash
   # Verificar instalación
   node --version
   # Debe mostrar: v16.x.x o superior
   ```

2. **npm** (versión 8 o superior)
   ```bash
   # Verificar instalación
   npm --version
   # Debe mostrar: 8.x.x o superior
   ```

3. **Git** (versión 2.30 o superior)
   ```bash
   # Verificar instalación
   git --version
   # Debe mostrar: git version 2.30.x o superior
   ```

### Navegador Moderno

Necesitarás uno de estos navegadores:
- Google Chrome 90+
- Mozilla Firefox 88+
- Safari 14+
- Microsoft Edge 90+

## 🚀 Instalación

### Paso 1: Clonar el Repositorio

```bash
# Opción 1: Clonar desde GitHub
git clone https://github.com/mi-technologies/apps-calidad.git
cd apps-calidad

# Opción 2: Si ya tienes el repositorio descargado
cd C:\Proyectos Claude\NUEVO_Apps_Calidad
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install
```

Este comando instalará:
- Playwright para testing
- Dependencias necesarias para desarrollo

### Paso 3: Instalar Navegadores de Playwright

```bash
# Instalar navegadores para testing (solo primera vez)
npx playwright install
```

Este proceso puede tomar algunos minutos la primera vez.

### Paso 4: Verificar Instalación

```bash
# Ejecutar tests para verificar que todo funciona
npm test
```

Si todos los tests pasan, la instalación fue exitosa.

## ⚙️ Configuración

### Editor de Código

Se recomienda usar **Visual Studio Code** con las siguientes extensiones:

1. **Live Server** - Para servidor local con hot reload
2. **Prettier** - Formateo automático de código
3. **EditorConfig** - Consistencia de código

### Configuración de EditorConfig

El proyecto ya incluye `.editorconfig`. Tu editor lo aplicará automáticamente.

### Configuración de Prettier

El proyecto ya incluye `.prettierrc`. Para formatear código:

```bash
# Formatear todos los archivos
npx prettier --write .

# Verificar formato
npx prettier --check .
```

## 🎮 Ejecución

### Método 1: VS Code Live Server (Recomendado)

1. Abre el proyecto en VS Code
2. Abre el archivo `src/pages/index1000.html`
3. Click derecho > "Open with Live Server"
4. El navegador abrirá automáticamente en `http://127.0.0.1:5500/src/pages/index1000.html`

### Método 2: Python Simple HTTP Server

```bash
# Desde la raíz del proyecto
python -m http.server 8000

# Abrir en navegador:
# http://localhost:8000/src/pages/index1000.html
```

### Método 3: Node.js http-server

```bash
# Instalar http-server globalmente (primera vez)
npm install -g http-server

# Ejecutar servidor
http-server -p 8000

# Abrir en navegador:
# http://localhost:8000/src/pages/index1000.html
```

## 👤 Primer Uso

### 1. Acceder a la Aplicación

Abre tu navegador y navega a la URL del servidor local.

### 2. Página de Login

Verás la pantalla de inicio de sesión con el logo de MI Technologies.

### 3. Credenciales de Prueba

**Actual (Mock):**
- Usuario: cualquier texto con mínimo 3 caracteres
- Contraseña: cualquier texto con mínimo 6 caracteres

**Ejemplo:**
```
Usuario: admin
Contraseña: admin123
```

### 4. Opciones de Login

- **Recordar sesión:** Marca esta casilla para mantener la sesión activa
- **Mostrar/Ocultar contraseña:** Click en el icono del ojo

### 5. Iniciar Sesión

Click en "Iniciar Sesión". Verás:
1. Botón con estado de carga
2. Validación de campos
3. Redirección al dashboard

### 6. Dashboard

Después del login exitoso, serás redirigido al dashboard principal.

### 7. Cerrar Sesión

Click en "Cerrar Sesión" en el header del dashboard.

## 🧪 Ejecutar Tests

### Tests Completos

```bash
# Ejecutar todos los tests
npm test
```

### Tests en Modo UI

```bash
# Abrir interfaz interactiva de Playwright
npm run test:ui
```

### Tests con Navegador Visible

```bash
# Ver tests ejecutándose en tiempo real
npm run test:headed
```

### Tests Específicos

```bash
# Solo Chrome
npm run test:chrome

# Solo móviles
npm run test:mobile

# Test específico
npx playwright test login.spec.js
```

### Ver Reporte de Tests

```bash
# Generar y abrir reporte HTML
npm run test:report
```

## 🔧 Solución de Problemas

### Problema: "Cannot find module '@playwright/test'"

**Solución:**
```bash
npm install
npx playwright install
```

### Problema: Tests fallan con "page.goto timeout"

**Causa:** El servidor no está corriendo.

**Solución:** Ejecuta primero un servidor local (ver sección Ejecución).

### Problema: "EACCES: permission denied"

**Solución en Windows:**
```bash
# Ejecutar terminal como Administrador
```

**Solución en Mac/Linux:**
```bash
sudo npm install
```

### Problema: CSS o JS no se cargan

**Verificar:**
1. Que la URL incluya `/src/pages/index1000.html`
2. Que no haya errores en la consola del navegador (F12)
3. Que los archivos existan en `src/assets/`

**Solución:**
```bash
# Verificar estructura
ls -la src/assets/css/
ls -la src/assets/js/
```

### Problema: localStorage no funciona

**Causa:** Algunos navegadores no permiten localStorage en `file://` protocol.

**Solución:** Usa un servidor local (Live Server, Python, o http-server).

### Problema: Playwright falla al instalar navegadores

**Solución:**
```bash
# Windows: Ejecutar como Administrador
npx playwright install --force

# Mac/Linux:
sudo npx playwright install --force
```

## 📚 Próximos Pasos

### 1. Explora la Documentación

- [ARCHITECTURE.md](ARCHITECTURE.md) - Diseño del sistema
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Guías UI/UX
- [API.md](API.md) - API REST (futuro backend)
- [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue en producción

### 2. Contribuye al Proyecto

Lee [CONTRIBUTING.md](../CONTRIBUTING.md) para conocer:
- Estándares de código
- Proceso de pull request
- Cómo reportar bugs
- Cómo sugerir mejoras

### 3. Desarrollo

#### Agregar Nueva Página

1. Crear HTML en `src/pages/`
2. Crear CSS en `src/assets/css/`
3. Agregar lógica en `src/assets/js/`
4. Crear test en `tests/`

#### Modificar Estilos

1. Editar variables en `src/assets/css/main.css`
2. Modificar componentes en archivos específicos
3. Seguir guías de [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

#### Agregar Funcionalidad

1. Crear función en archivo JS apropiado
2. Documentar con JSDoc comments
3. Agregar tests en Playwright
4. Actualizar documentación

### 4. Testing en Múltiples Dispositivos

```bash
# Desktop browsers
npm run test:chrome

# Mobile devices
npm run test:mobile

# Todos
npm test
```

### 5. Preparar para Producción

Cuando estés listo para desplegar:

1. Ejecutar tests: `npm test`
2. Verificar formato: `npx prettier --check .`
3. Revisar [DEPLOYMENT.md](DEPLOYMENT.md)
4. Seguir checklist de despliegue

## 🆘 ¿Necesitas Ayuda?

### Recursos

- **Documentación del Proyecto:** `docs/`
- **Issues en GitHub:** [github.com/mi-technologies/apps-calidad/issues](https://github.com/mi-technologies/apps-calidad/issues)
- **Email:** dev@mitechnologies.com
- **Slack:** #apps-calidad

### Comandos Útiles

```bash
# Ver estructura del proyecto
tree -I 'node_modules|.git' -L 3

# Buscar en código
grep -r "texto" src/

# Ver commits recientes
git log --oneline -10

# Ver cambios no commiteados
git status

# Ver diferencias
git diff
```

## ✅ Checklist de Inicio

- [ ] Node.js y npm instalados
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Navegadores instalados (`npx playwright install`)
- [ ] Servidor local ejecutándose
- [ ] Login funciona correctamente
- [ ] Tests pasan (`npm test`)
- [ ] Editor configurado con Prettier y EditorConfig

## 🎉 ¡Todo Listo!

Ya estás listo para comenzar a desarrollar. Recuerda:

1. Hacer commits frecuentes y descriptivos
2. Seguir las guías de estilo
3. Agregar tests para nuevo código
4. Actualizar documentación cuando sea necesario

**¡Bienvenido al equipo de desarrollo de MI Technologies!**

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0
