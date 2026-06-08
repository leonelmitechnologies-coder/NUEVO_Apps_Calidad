# 🛠️ Development Tools

Herramientas de desarrollo y utilidades para el proyecto MI Technologies Apps de Calidad.

## 📁 Estructura

```
tools/
├── dev/                    # Herramientas de prueba y desarrollo
│   └── test-photo.html    # Prueba de funcionalidad de fotos de usuario
├── clear-users.html       # Limpieza de datos en localStorage
└── README.md             # Este archivo
```

## 📋 Herramientas Disponibles

### `clear-users.html`

Herramienta visual para limpiar todos los usuarios del localStorage.

**Uso:**
```bash
# Abrir en navegador
http://localhost:8080/tools/clear-users.html
```

**Características:**
- Muestra el número de usuarios registrados
- Permite eliminar todos los usuarios con confirmación
- Interfaz visual intuitiva
- Redirección opcional al módulo de usuarios

**Cuándo usar:**
- Para resetear el sistema durante desarrollo
- Para limpiar datos de prueba
- Para empezar con un estado limpio

### `dev/test-photo.html`

Herramienta de prueba para validar la funcionalidad de captura y visualización de fotos de usuario.

**Uso:**
```bash
# Abrir en navegador
http://localhost:8080/tools/dev/test-photo.html
```

**Características:**
- Prueba de captura de foto desde cámara web
- Visualización de preview de imagen
- Validación de almacenamiento en Base64
- Interfaz de prueba aislada

**Cuándo usar:**
- Para probar funcionalidad de cámara antes de integrar
- Para validar compatibilidad en diferentes navegadores
- Para depurar problemas con capturas de foto

## 🔧 Agregar Nuevas Herramientas

Si necesitas crear una nueva herramienta, sigue esta estructura:

**Para herramientas de producción/utilidades:**
```
tools/[nombre-herramienta].html
```

**Para herramientas de desarrollo/pruebas:**
```
tools/dev/[nombre-prueba].html
```

**Estructura recomendada:**
```
tools/
├── dev/                    # Pruebas y desarrollo temporal
│   └── test-*.html
├── [utilidad].html        # Herramientas permanentes
└── README.md             # Documentación
```

### Ejemplo de estructura:
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <title>Mi Herramienta</title>
</head>
<body>
  <h1>🛠️ Mi Herramienta</h1>
  <!-- Tu código aquí -->
</body>
</html>
```

## 📝 Notas

- Las herramientas en esta carpeta son solo para desarrollo
- No deben incluirse en producción
- Documentar cada herramienta en este README
