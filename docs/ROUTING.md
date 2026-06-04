# Sistema de Routing - QC Manager

## Descripción

El sistema ahora usa **History API** para navegación con URLs dinámicas. Cada vista del SPA tiene su propia URL, lo que permite:

- 🔗 **Compartir enlaces** a vistas específicas
- 📌 **Bookmarks** de secciones del sistema
- ⬅️ **Navegación del navegador** (botones back/forward funcionan)
- 🔄 **Mantener estado** al recargar la página
- 📍 **Contexto claro** de ubicación actual

## URLs Disponibles

### Vistas Principales (Fase 1)

| Vista | URL | Requiere Login |
|-------|-----|----------------|
| Login | `http://localhost:8080/src/pages/login` | No |
| Dashboard | `http://localhost:8080/src/pages/dashboard` | Sí |
| Usuarios | `http://localhost:8080/src/pages/usuarios` | Sí |
| Asistencia | `http://localhost:8080/src/pages/asistencia` | Sí |

### Rutas Anidadas (Fase 2 - Futuro)

Cuando se implementen los submódulos de Asistencia, estarán disponibles:

- `/src/pages/asistencia/pasar` - Pasar Asistencia
- `/src/pages/asistencia/colaborador` - Agregar Colaborador
- `/src/pages/asistencia/historial` - Historial de Asistencia
- `/src/pages/asistencia/inasistencia` - Inasistencia
- `/src/pages/asistencia/colaboradores` - Lista de Colaboradores
- `/src/pages/asistencia/bajas` - Bajas
- `/src/pages/asistencia/tiempo-extra` - Tiempo Extra

## Cómo Funciona

### 1. Navegación Interna

Cuando haces clic en un módulo del dashboard (Usuarios, Asistencia):
```javascript
navigateTo('usuarios'); // Cambia la URL a /src/pages/usuarios
```

### 2. URL Directa

Puedes abrir una vista específica escribiendo la URL directamente:
```
http://localhost:8080/src/pages/usuarios
```

El sistema:
1. Lee la URL actual
2. Valida si requiere autenticación
3. Si no está logueado, redirige a `/login`
4. Si está logueado, muestra la vista correspondiente

### 3. Navegación del Navegador

- **Botón Back (←)**: Vuelve a la vista anterior
- **Botón Forward (→)**: Avanza a la siguiente vista
- **URL en barra**: Siempre refleja la vista actual

### 4. Recarga de Página (F5)

Al recargar la página:
- Login → Te mantiene en login
- Dashboard → Te mantiene en dashboard (si estás logueado)
- Usuarios → Te mantiene en usuarios (si estás logueado)
- Cualquier vista protegida sin login → Te redirige a login

## Arquitectura Técnica

### Mapa de Rutas

```javascript
const ROUTES = {
  '/src/pages/': 'login',
  '/src/pages/login': 'login',
  '/src/pages/dashboard': 'dashboard',
  '/src/pages/usuarios': 'usuarios',
  '/src/pages/asistencia': 'asistencia',
};
```

### Funciones Principales

**`navigateTo(viewName, skipHistory)`**
- Cambia la vista actual
- Actualiza la URL con `history.pushState()`
- Valida autenticación
- `skipHistory = true` para evitar crear entrada en historial (usado por popstate)

**`initRouter()`**
- Se ejecuta al cargar la página
- Lee la URL actual
- Determina qué vista mostrar
- Valida autenticación

**`popstate` listener**
- Escucha eventos de navegación back/forward
- Navega a la vista correspondiente sin recargar página

### Conversión Path ↔ View

**`viewToPath(viewName)`**
- Convierte: `'usuarios'` → `'/src/pages/usuarios'`

**`pathToView(path)`**
- Convierte: `'/src/pages/usuarios'` → `'usuarios'`

## Testing

### 1. Navegación Básica
1. Abre `http://localhost:8080/src/pages/index1000.html`
2. Haz login (usuario: `admin`, contraseña: `admin123`)
3. URL cambia a: `http://localhost:8080/src/pages/dashboard`
4. Clic en módulo Usuarios
5. URL cambia a: `http://localhost:8080/src/pages/usuarios`

### 2. URL Directa
1. Abre nueva pestaña
2. Escribe: `http://localhost:8080/src/pages/usuarios`
3. Si no estás logueado → te redirige a `/login`
4. Si estás logueado → muestra Usuarios directamente

### 3. Botón Back
1. Navega: Login → Dashboard → Usuarios
2. Presiona botón Back del navegador (o Alt+←)
3. URL vuelve a `/dashboard`
4. Presiona Back nuevamente
5. URL vuelve a `/login`

### 4. Recarga de Página
1. Navega a Usuarios (`/src/pages/usuarios`)
2. Presiona F5
3. La página recarga pero permaneces en Usuarios
4. URL no cambia

### 5. Logout
1. Estando en cualquier vista autenticada
2. Clic en "Cerrar Sesión"
3. Confirmar modal
4. URL cambia a `/login`
5. Presionar Back no te lleva a vistas autenticadas

## Seguridad

### Validación de Autenticación

Todas las rutas protegidas validan autenticación:

```javascript
// En navigateTo()
if (viewName !== 'login' && !isAuthenticated()) {
  navigateTo('login');
  return;
}
```

### Protección de Estado

El listener `popstate` también valida:

```javascript
window.addEventListener('popstate', (e) => {
  const view = e.state?.view || pathToView(window.location.pathname);

  if (view !== 'login' && !isAuthenticated()) {
    navigateTo('login', true);
    return;
  }

  navigateTo(view, true);
});
```

## Beneficios

✅ **UX Mejorada**: Usuario sabe dónde está mirando la URL
✅ **Compartir Enlaces**: Enviar URL de sección específica a otro usuario
✅ **Bookmarks**: Guardar accesos directos a vistas frecuentes
✅ **Navegación Estándar**: Back/Forward del navegador funcionan
✅ **Persistencia**: Recarga mantiene la vista actual
✅ **Profesionalismo**: Comportamiento de aplicación web moderna
✅ **Debugging**: Más fácil reportar bugs con URL específica

## Limitaciones Actuales

⚠️ **Rutas Relativas**: Las rutas incluyen `/src/pages/` porque el archivo HTML está en esa carpeta

⚠️ **Sin Configuración de Servidor**: Actualmente no hay configuración especial del servidor. Para producción, se recomienda:
- Configurar proxy o rewrite rules
- Servir `index1000.html` para todas las rutas
- Ejemplo con http-server: `npx http-server -p 8080 --proxy http://localhost:8080?`

⚠️ **Rutas Anidadas**: Preparadas pero no funcionales hasta que se implementen los submódulos

## Próximos Pasos

1. **Fase 2**: Implementar submódulos de Asistencia con rutas anidadas
2. **Producción**: Configurar servidor con rewrite rules
3. **Optimización**: Mover HTML a raíz para URLs más limpias (`/dashboard` vs `/src/pages/dashboard`)
4. **Breadcrumbs**: Agregar navegación de migas de pan usando el sistema de rutas

## Soporte

Para reportar problemas con el routing:
- Especifica la URL exacta donde ocurrió el error
- Describe los pasos para reproducir
- Incluye si estabas logueado o no
