# Sistema de Registro de Asistencia - Diseño

**Fecha:** 2026-06-04
**Estado:** Aprobado
**Fase:** Login y Dashboard Placeholder

## 1. Descripción General

Sistema de registro de asistencia para MI Technologies. Esta fase inicial incluye únicamente el login profesional y una página placeholder para desarrollo futuro. El sistema está preparado para conectarse con un backend MySQL pero por ahora solo incluye el frontend.

## 2. Objetivos de esta Fase

- Login profesional y minimalista con colores corporativos MI Technologies
- Validación de formularios robusta
- Diseño responsive y accesible
- Estructura de proyecto profesional y escalable
- Código preparado para backend MySQL (comentarios y estructura)
- Dashboard placeholder para desarrollo futuro

## 3. Arquitectura y Estructura del Proyecto

### 3.1 Estructura de Directorios

```
attendance-system/
│
├── index1000.html          # Página de login (punto de entrada)
├── dashboard.html          # Página placeholder "en desarrollo"
│
├── assets/
│   ├── css/
│   │   ├── main.css       # Estilos globales y variables CSS
│   │   ├── login.css      # Estilos específicos del login
│   │   └── dashboard.css  # Estilos del dashboard
│   │
│   ├── js/
│   │   ├── auth.js        # Lógica de autenticación
│   │   └── utils.js       # Funciones utilitarias
│   │
│   └── img/
│       └── logo.png       # Logo de MI Technologies
│
└── docs/
    └── superpowers/
        └── specs/         # Especificaciones de diseño
```

### 3.2 Decisiones Arquitectónicas

- **Multi-Page Application:** Páginas separadas para mejor mantenibilidad
- **HTML + CSS + JavaScript Vanilla:** Sin dependencias externas
- **Modularidad CSS:** Archivo global + específicos por página
- **Separación de responsabilidades:** JavaScript organizado por funcionalidad
- **Assets centralizados:** Recursos organizados por tipo en `/assets`

## 4. Componentes Principales

### 4.1 Login Page (index1000.html)

#### Diseño Visual

**Layout:**
- Contenedor centrado vertical y horizontalmente
- Card flotante con sombra sutil
- Fondo de página en gris claro (#F5F5F5)

**Paleta de Colores:**
- Azul principal: `#1E7CBA` (botones, enlaces, acentos)
- Azul hover: `#165A8F` (estado hover de botones)
- Blanco: `#FFFFFF` (fondo del card, texto en botones)
- Gris claro: `#F5F5F5` (fondo de página)
- Gris medio: `#E0E0E0` (bordes de inputs)
- Gris oscuro: `#333333` (texto principal)
- Rojo error: `#D32F2F` (mensajes de error, bordes inválidos)

#### Elementos del Formulario

1. **Logo MI Technologies**
   - Posición: parte superior del card
   - Tamaño: 180px de ancho
   - Centrado horizontalmente

2. **Campo "Usuario"**
   - Input type="text"
   - Placeholder: "Ingresa tu usuario"
   - Validación: mínimo 3 caracteres, requerido
   - Ícono de usuario opcional

3. **Campo "Contraseña"**
   - Input type="password" con toggle para mostrar/ocultar
   - Placeholder: "Ingresa tu contraseña"
   - Validación: mínimo 6 caracteres, requerido
   - Ícono de ojo para toggle

4. **Checkbox "Recordar sesión"**
   - Label: "Recordar sesión"
   - Checkbox custom con colores corporativos

5. **Botón "Iniciar Sesión"**
   - Width: 100% del contenedor
   - Background: #1E7CBA
   - Color texto: #FFFFFF
   - Border-radius: 6px
   - Padding: 12px
   - Estados: normal, hover, loading, disabled

6. **Link "¿Olvidaste tu contraseña?"**
   - Color: #1E7CBA
   - Posición: debajo del botón, centrado
   - Hover: underline

#### Responsividad

**Desktop (>768px):**
- Card: 400px de ancho
- Padding interno: 40px

**Tablet (481px - 768px):**
- Card: 90% del ancho
- Padding interno: 30px

**Mobile (≤480px):**
- Card: 95% del ancho
- Padding interno: 24px
- Logo más pequeño: 150px

### 4.2 Dashboard Page (dashboard.html)

#### Estructura

1. **Navbar Superior**
   - Logo MI Technologies (izquierda)
   - Botón "Cerrar Sesión" (derecha)
   - Background: #1E7CBA
   - Color texto: #FFFFFF

2. **Contenido Central**
   - Mensaje: "Sistema en Desarrollo"
   - Submensaje: "Esta sección estará disponible próximamente"
   - Ícono o ilustración placeholder
   - Centrado vertical y horizontalmente

3. **Footer**
   - Copyright: "© 2026 MI Technologies, Inc."
   - Centrado
   - Color texto: #666666

### 4.3 Estilos CSS

#### main.css - Variables y Globales

```css
:root {
  --color-primary: #1E7CBA;
  --color-primary-dark: #165A8F;
  --color-white: #FFFFFF;
  --color-bg: #F5F5F5;
  --color-border: #E0E0E0;
  --color-text: #333333;
  --color-error: #D32F2F;

  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 40px;

  --border-radius: 6px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

- Reset CSS básico
- Fuente: system-ui o sans-serif
- Box-sizing: border-box global
- Estilos de scrollbar personalizados

#### login.css - Específico del Login

- Estilos del card de login
- Formulario y campos
- Botón de login y estados
- Mensajes de error
- Animaciones de entrada

#### dashboard.css - Específico del Dashboard

- Navbar
- Contenedor central
- Footer
- Estado placeholder

### 4.4 Principios de Diseño

- **Espaciado generoso:** Padding y margins consistentes usando variables
- **Transiciones suaves:** 0.3s ease en hover/focus
- **Accesibilidad:**
  - Focus visible con outline personalizado
  - Contraste WCAG AA (mínimo 4.5:1)
  - Atributos ARIA apropiados
  - Labels asociados correctamente
- **Estados visuales claros:** hover, focus, active, disabled, error

## 5. Flujo de Datos y Navegación

### 5.1 Flujo de Login

#### Implementación Actual (Frontend Only)

1. Usuario accede a `index1000.html`
2. Llena campos de usuario y contraseña
3. Opcionalmente marca "Recordar sesión"
4. Click en "Iniciar Sesión"
5. JavaScript captura submit con `preventDefault()`
6. Validación de campos:
   - Usuario: no vacío, mínimo 3 caracteres
   - Contraseña: no vacía, mínimo 6 caracteres
7. Si validación falla: mostrar errores específicos
8. Si validación pasa:
   - Mostrar estado "loading" en botón
   - Simular login exitoso (mock)
   - Guardar datos en localStorage:
     - `isLoggedIn: true`
     - `username: valor_ingresado`
     - `rememberMe: true/false`
   - Redirigir a `dashboard.html`

#### Preparación para Backend MySQL

```javascript
// Estructura preparada en auth.js
async function login(username, password) {
    // TODO: Implementar cuando backend esté listo
    // const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ username, password })
    // });
    //
    // if (!response.ok) {
    //     throw new Error('Credenciales incorrectas');
    // }
    //
    // const data = await response.json();
    // return data; // { success: true, token: '...', user: {...} }

    // Mock actual para desarrollo:
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                token: 'mock-token-12345',
                user: { username, id: 1 }
            });
        }, 500);
    });
}
```

**Estructura de Base de Datos Sugerida (MySQL):**

```sql
-- Tabla users para futuro backend
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Tabla attendance para registros futuros
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5.2 Manejo de Sesión

#### localStorage Keys

```javascript
{
  "isLoggedIn": "true",        // String boolean
  "username": "usuario123",    // String
  "rememberMe": "true",        // String boolean
  "token": "mock-token-12345"  // String (para backend futuro)
}
```

#### Protección de Rutas

**dashboard.html - Verificación al cargar:**

```javascript
// Ejecuta al inicio del script
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index1000.html';
    }
}

// Llamar inmediatamente
checkAuth();
```

**index1000.html - Redirigir si ya está logueado:**

```javascript
function checkAlreadyLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }
}

checkAlreadyLoggedIn();
```

### 5.3 Recuperar Contraseña

#### Implementación Actual

- Link muestra `alert('Funcionalidad en desarrollo. Contacta al administrador.')`

#### Preparación para Futuro

```javascript
// Comentado en el código:
// function forgotPassword() {
//     window.location.href = 'recover-password.html';
// }

// Página recover-password.html a crear después:
// - Campo email
// - Botón "Enviar enlace de recuperación"
// - Endpoint: POST /api/auth/forgot-password
```

### 5.4 Cerrar Sesión

**Flujo:**

1. Usuario click en botón "Cerrar Sesión" en dashboard
2. JavaScript ejecuta `logout()`
3. Limpia localStorage completo: `localStorage.clear()`
4. Redirige a `index1000.html`

```javascript
function logout() {
    localStorage.clear();
    window.location.href = 'index1000.html';
}
```

## 6. Manejo de Errores y Validación

### 6.1 Validación del Formulario de Login

#### Reglas de Validación

**Campo Usuario:**
- Requerido: "El usuario es requerido"
- Longitud mínima: 3 caracteres - "El usuario debe tener al menos 3 caracteres"

**Campo Contraseña:**
- Requerido: "La contraseña es requerida"
- Longitud mínima: 6 caracteres - "La contraseña debe tener al menos 6 caracteres"

#### Validación en Tiempo Real

- **On blur:** Validar campo cuando pierde focus
- **On input:** Limpiar error si el usuario empieza a corregir
- **On submit:** Validar todos los campos antes de procesar

#### Mostrar Errores

```html
<!-- Estructura de campo con error -->
<div class="form-group">
    <label for="username">Usuario</label>
    <input
        type="text"
        id="username"
        class="form-control error"
        aria-invalid="true"
        aria-describedby="username-error"
    >
    <span id="username-error" class="error-message">
        El usuario es requerido
    </span>
</div>
```

**Estilos visuales:**
- Input con borde rojo (#D32F2F)
- Mensaje de error en rojo debajo del campo
- Ícono de error opcional

### 6.2 Estados del Botón de Login

#### Estados Visuales

**1. Normal**
```css
background: #1E7CBA;
color: #FFFFFF;
cursor: pointer;
```

**2. Hover**
```css
background: #165A8F;
```

**3. Loading**
```css
background: #1E7CBA;
opacity: 0.7;
cursor: not-allowed;
pointer-events: none;
```
- Texto: "Iniciando..."
- Spinner animado opcional

**4. Disabled**
```css
background: #CCCCCC;
color: #666666;
cursor: not-allowed;
```

### 6.3 Manejo de Errores de Autenticación

#### Preparado para Backend

```javascript
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validar campos
    if (!validateForm()) return;

    // Mostrar loading
    setButtonLoading(true);

    try {
        const result = await login(username, password);

        if (result.success) {
            // Guardar sesión
            saveSession(result);
            // Redirigir
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        // Mostrar error amigable
        showError('Usuario o contraseña incorrectos');
    } finally {
        setButtonLoading(false);
    }
}
```

#### Tipos de Errores a Manejar (Futuro)

- **401 Unauthorized:** "Usuario o contraseña incorrectos"
- **500 Server Error:** "Error del servidor. Intenta más tarde"
- **Network Error:** "Sin conexión. Verifica tu internet"
- **Timeout:** "La solicitud tardó demasiado. Intenta nuevamente"

### 6.4 Accesibilidad en Errores

**Atributos ARIA:**
```html
<input
    aria-invalid="true"           <!-- Marca campo inválido -->
    aria-describedby="error-id"   <!-- Asocia con mensaje de error -->
>
<span id="error-id" role="alert"> <!-- Anuncia error a lectores -->
    Mensaje de error
</span>
```

**Comportamiento:**
- Focus automático en el primer campo con error
- Colores con contraste WCAG AA
- Mensajes claros y descriptivos

## 7. Testing y Validación

### 7.1 Checklist de Testing Manual

#### Funcionalidad del Login

- [ ] Validación de usuario vacío muestra error
- [ ] Validación de contraseña vacía muestra error
- [ ] Validación de usuario menor a 3 caracteres muestra error
- [ ] Validación de contraseña menor a 6 caracteres muestra error
- [ ] Checkbox "Recordar sesión" guarda preferencia en localStorage
- [ ] Botón de login redirige a dashboard.html correctamente
- [ ] Link "Olvidaste contraseña" muestra alert de desarrollo
- [ ] Toggle de mostrar/ocultar contraseña funciona
- [ ] Errores se limpian cuando el usuario empieza a corregir

#### Navegación y Sesión

- [ ] Login exitoso guarda `isLoggedIn: true` en localStorage
- [ ] Login exitoso guarda username en localStorage
- [ ] Dashboard verifica autenticación al cargar
- [ ] Sin login, dashboard redirige a index1000.html
- [ ] Botón "Cerrar Sesión" limpia localStorage
- [ ] Cerrar sesión redirige a index1000.html
- [ ] Si ya está logueado, index1000 redirige a dashboard

#### Responsividad

**Desktop:**
- [ ] 1920x1080 - Card centrado, 400px de ancho
- [ ] 1366x768 - Card centrado, 400px de ancho
- [ ] 1024x768 - Card centrado, 400px de ancho

**Tablet:**
- [ ] 768x1024 - Card 90% de ancho
- [ ] 481x768 - Card 90% de ancho

**Mobile:**
- [ ] 375x667 (iPhone) - Card 95% de ancho
- [ ] 320x568 - Card 95% de ancho, logo más pequeño

#### Navegadores

- [ ] Google Chrome (última versión)
- [ ] Microsoft Edge (última versión)
- [ ] Mozilla Firefox (última versión)
- [ ] Safari (si disponible)

#### Accesibilidad

- [ ] Navegación con Tab funciona correctamente
- [ ] Focus visible en todos los elementos interactivos
- [ ] Enter en formulario hace submit
- [ ] Mensajes de error son anunciados por lectores de pantalla
- [ ] Contraste de colores cumple WCAG AA

### 7.2 Preparación para Testing Automatizado (Futuro)

**Agregar atributos data-testid:**

```html
<input data-testid="username-input" />
<input data-testid="password-input" />
<button data-testid="login-button">Iniciar Sesión</button>
```

**Comentarios en código:**
```javascript
// TEST: Validar que login exitoso redirige a dashboard
// TEST: Validar que errores se muestran correctamente
```

**Herramientas sugeridas para futuro:**
- Jest para testing unitario de funciones
- Cypress o Playwright para testing E2E

### 7.3 Code Quality Standards

**Estándares de código:**
- Indentación: 2 espacios
- Nombres de variables: camelCase descriptivos
- Nombres de funciones: verbos descriptivos (handleLogin, validateForm)
- Comentarios: solo en lógica compleja o TODOs para backend
- Sin console.log en código final (usar solo para debug temporal)

**Convenciones de nombres:**
- Archivos CSS: kebab-case (login.css, main.css)
- Archivos JS: camelCase (auth.js, utils.js)
- IDs HTML: kebab-case (username-input, login-form)
- Clases CSS: kebab-case (form-group, error-message)

## 8. Roadmap y Próximos Pasos

### 8.1 Esta Fase (Actual)

✅ Estructura profesional de carpetas
✅ Login minimalista con diseño MI Technologies
✅ Validación de formularios
✅ Manejo de sesión con localStorage
✅ Dashboard placeholder
✅ Código preparado para backend MySQL

### 8.2 Fase 2 (Futuro)

**Backend:**
- API REST con Node.js + Express
- Conexión a MySQL
- Endpoints de autenticación
- JWT para tokens
- Bcrypt para hash de contraseñas

**Frontend:**
- Conectar formulario con API real
- Recuperar contraseña funcional
- Registro de nuevos usuarios (opcional)

### 8.3 Fase 3 (Futuro)

**Funcionalidades del Sistema:**
- Registro de entrada/salida
- Historial personal de asistencia
- Reportes administrativos
- Dashboard con estadísticas
- Exportar reportes a PDF/Excel

## 9. Anexos

### 9.1 Colores Exactos MI Technologies

Extraídos del logo:
- **Azul principal:** #1E7CBA
- **Azul oscuro (hover):** #165A8F
- **Blanco:** #FFFFFF

### 9.2 Recursos Necesarios

- Logo: `C:\Users\User\OneDrive\Documentos\Manuales de Usuario\logo.png`
- Copiar a: `assets/img/logo.png`

### 9.3 Decisiones de Diseño

**¿Por qué Multi-Page en lugar de SPA?**
- Más simple para desarrollo incremental
- Fácil agregar nuevas páginas independientes
- No requiere manejo de estado complejo
- Mejor para ir construyendo por fases

**¿Por qué Vanilla JS en lugar de Framework?**
- Sin curva de aprendizaje
- Sin dependencias externas
- Más rápido para un proyecto pequeño
- Control total del código

**¿Por qué localStorage en lugar de sessionStorage?**
- Permite "recordar sesión"
- Persiste entre cierres del navegador
- Se limpia manualmente con logout
- Adecuado para desarrollo (no producción sin backend)

---

**Fin del Documento de Diseño**

Este diseño ha sido aprobado y está listo para implementación.