# Sistema de Diseño - MI Technologies

## 🎨 Visión General

Sistema de diseño profesional basado en las mejores prácticas de **UI/UX Pro Max**, cumpliendo con estándares de accesibilidad **WCAG 2.1 AA** y optimizado para dispositivos móviles.

## 🎯 Principios de Diseño

1. **Accesibilidad Primero:** Todo diseño debe ser accesible
2. **Mobile-First:** Diseñar para móvil, expandir a desktop
3. **Consistencia:** Usar componentes y patrones reutilizables
4. **Performance:** Animaciones suaves, carga rápida
5. **Claridad:** Jerarquía visual clara, sin ambigüedades

## 🎨 Paleta de Colores

### Colores Primarios (MI Technologies Branding)

```css
:root {
  /* Primary - Azul corporativo */
  --color-primary: #1E7CBA;
  --color-primary-dark: #165A8C;
  --color-primary-light: #4A9DD4;

  /* Secondary - Grises */
  --color-secondary: #6C757D;
  --color-secondary-dark: #495057;
  --color-secondary-light: #ADB5BD;

  /* Neutros */
  --color-white: #FFFFFF;
  --color-black: #000000;
  --color-bg: #F5F7FA;
  --color-bg-dark: #E9ECEF;
}
```

### Colores Semánticos

```css
:root {
  /* Estados */
  --color-success: #28A745;    /* Verde */
  --color-warning: #FFC107;    /* Amarillo */
  --color-error: #DC3545;      /* Rojo */
  --color-info: #17A2B8;       /* Cyan */

  /* Texto */
  --color-text: #212529;           /* Contraste 14.5:1 */
  --color-text-muted: #6C757D;     /* Contraste 4.5:1 */
  --color-text-light: #ADB5BD;     /* Solo para UI no crítica */
}
```

### Contraste de Colores (WCAG AA)

| Combinación | Contraste | Uso |
|-------------|-----------|-----|
| `#212529` sobre `#FFFFFF` | 14.5:1 ✅ | Texto principal |
| `#6C757D` sobre `#FFFFFF` | 4.5:1 ✅ | Texto secundario |
| `#1E7CBA` sobre `#FFFFFF` | 4.5:1 ✅ | Links y botones |
| `#ADB5BD` sobre `#FFFFFF` | 2.8:1 ❌ | Solo decorativo |

### Glassmorphism

```css
:root {
  /* Glass effect */
  --glass-bg: rgba(255, 255, 255, 0.95);
  --glass-border: rgba(255, 255, 255, 0.3);

  /* Dark mode glass (futuro) */
  --glass-bg-dark: rgba(0, 0, 0, 0.4);
  --glass-border-dark: rgba(255, 255, 255, 0.1);
}

/* Uso */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
```

## 📏 Espaciado

### Sistema de Espaciado (8px Grid)

```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
}
```

### Uso del Espaciado

```css
/* ✅ Bueno: Usar variables */
.card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}

/* ❌ Malo: Valores hardcoded */
.card {
  padding: 24px;
  margin-bottom: 16px;
  gap: 8px;
}
```

## 🔤 Tipografía

### Familias de Fuentes

```css
:root {
  --font-sans: 'Segoe UI', -apple-system, BlinkMacSystemFont,
               'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

### Escala Tipográfica

```css
:root {
  /* Mobile base: 16px */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px - Mínimo para móvil */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
}
```

### Line Height

```css
:root {
  --leading-tight: 1.25;      /* Títulos */
  --leading-normal: 1.5;      /* Texto corto */
  --leading-relaxed: 1.625;   /* Párrafos largos */
  --leading-loose: 2;         /* Espaciado extra */
}
```

### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Estilos de Texto

```css
/* Headings */
h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); }
h2 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
h3 { font-size: var(--text-xl); font-weight: var(--font-semibold); }

/* Body */
p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  max-width: 65ch; /* Legibilidad */
}

/* Small text */
small { font-size: var(--text-sm); color: var(--color-text-muted); }
```

## 🔲 Bordes y Sombras

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* Círculo */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
}

/* Shadow con color de marca */
--shadow-primary: 0 4px 16px rgba(30, 124, 186, 0.25);
```

## 🎭 Z-Index Scale

```css
:root {
  --z-base: 1;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
}
```

**Regla:** Nunca usar valores arbitrarios como `z-index: 9999`.

## ⚡ Transiciones y Animaciones

### Duraciones

```css
:root {
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;
}
```

### Easing Functions

```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animaciones Built-in

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🔘 Componentes

### Buttons

```css
/* Base button */
.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px; /* Touch target */
}

/* Primary button */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:focus {
  outline: 2px solid transparent;
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(30, 124, 186, 0.3);
}

/* Loading state */
.btn.loading {
  position: relative;
  color: transparent;
}

.btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

### Inputs

```css
.form-control {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 16px; /* Previene zoom en iOS */
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.85);
  transition: border-color var(--transition-base),
              box-shadow var(--transition-base);
}

.form-control:focus {
  border-color: var(--color-primary);
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(30, 124, 186, 0.25);
}

.form-control.error {
  border-color: var(--color-error);
  background: rgba(220, 53, 69, 0.05);
}

.form-control.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}
```

### Cards

```css
.card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
```

## ♿ Accesibilidad

### Focus States (CRÍTICO)

```css
/* ✅ Siempre visible */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ✅ Sin outline solo si hay alternativa */
.btn:focus {
  outline: 2px solid transparent;
  box-shadow: 0 0 0 3px rgba(30, 124, 186, 0.3);
}

/* ❌ NUNCA hacer esto solo */
*:focus {
  outline: none;
}
```

### Touch Targets

```css
/* Mínimo 44x44px */
.btn, .input, .checkbox, .toggle {
  min-height: 44px;
  min-width: 44px;
}

/* En desktop puede ser menor */
@media (min-width: 1024px) {
  .btn {
    min-height: 40px;
  }
}
```

### ARIA Labels

```html
<!-- ✅ Botones con iconos -->
<button aria-label="Cerrar modal">
  <svg aria-hidden="true">...</svg>
</button>

<!-- ✅ Inputs con labels -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email">

<!-- ✅ Estados dinámicos -->
<button aria-busy="true" class="loading">
  Cargando...
</button>
```

## 📱 Responsive Breakpoints

```css
/* Mobile: 320px - 767px (base) */

/* Tablet: 768px+ */
@media (min-width: 768px) {
  :root {
    --text-base: 1rem;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  :root {
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
  }
}

/* Large: 1440px+ */
@media (min-width: 1440px) {
  :root {
    --text-xl: 1.5rem;
  }
}
```

## ✅ Checklist de Diseño

Antes de aprobar cualquier diseño, verificar:

### Accesibilidad
- [ ] Contraste 4.5:1 mínimo en texto
- [ ] Focus states visibles
- [ ] Touch targets 44px+
- [ ] Keyboard navigation funciona
- [ ] ARIA labels correctos
- [ ] Semántica HTML correcta

### Mobile
- [ ] Funciona en 320px (iPhone SE)
- [ ] Font-size 16px en inputs (no zoom iOS)
- [ ] Autocomplete en formularios
- [ ] Inputmode correcto
- [ ] Touch-friendly (no hover crítico)

### Performance
- [ ] Transiciones específicas (no transition-all)
- [ ] Animaciones con prefers-reduced-motion
- [ ] Transform/opacity (no width/height)
- [ ] Imágenes optimizadas

### Consistencia
- [ ] Usa variables CSS
- [ ] Sigue sistema de espaciado
- [ ] Colores de paleta oficial
- [ ] Tipografía consistente
- [ ] Z-index de escala definida

---

**Última actualización:** Junio 2026
**Basado en:** UI/UX Pro Max Guidelines
