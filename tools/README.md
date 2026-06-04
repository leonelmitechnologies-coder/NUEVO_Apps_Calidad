# 🛠️ Development Tools

Herramientas de desarrollo para el proyecto QC Manager.

## 📁 Contenido

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

## 🔧 Agregar Nuevas Herramientas

Si necesitas crear una nueva herramienta de desarrollo, colócala en esta carpeta:

```
tools/
├── clear-users.html
├── [tu-herramienta].html
└── README.md
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
