# 🔒 Backup y Migración de Datos - MiSync

**Fecha de Backup:** 2026-06-09
**Propósito:** Migración segura de localStorage a PostgreSQL (Stack MI)

---

## 📋 Estado del Backup

### ✅ Completado
- [x] Rama de backup creada: `backup-localStorage-2026-06-09`
- [x] Rama pusheada a GitHub
- [x] Documentos de análisis guardados

### ⏳ Pendiente
- [ ] Exportar datos localStorage (ver instrucciones abajo)
- [ ] Crear rama de migración
- [ ] Clonar starter template Stack MI
- [ ] Implementar schema PostgreSQL
- [ ] Script de migración de datos

---

## 📤 PASO 1: Exportar Datos localStorage (HAZLO AHORA)

### Opción A: Exportación Manual (Recomendada)

1. **Abre la aplicación MiSync en tu navegador**

2. **Abre DevTools** (F12 o Ctrl+Shift+I)

3. **Ve a la pestaña "Console"**

4. **Copia y pega este script:**

```javascript
// Script de exportación completo de localStorage
(function exportLocalStorage() {
  const backup = {
    exportDate: new Date().toISOString(),
    appVersion: 'MiSync v1.0 (localStorage)',
    browser: navigator.userAgent,
    data: {}
  };

  // Exportar todas las claves de localStorage
  const keys = [
    'appUsers',
    'colaboradores',
    'historialAsistencia',
    'tiemposExtra',
    'securityLog',
    'currentUser',
    'appSettings',
    'departamentos',
    'lastSync'
  ];

  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        backup.data[key] = JSON.parse(value);
      } catch (e) {
        backup.data[key] = value; // Si no es JSON, guardar como string
      }
    }
  });

  // Contar registros
  console.log('📊 Resumen del Backup:');
  console.log('- Usuarios:', backup.data.appUsers?.length || 0);
  console.log('- Colaboradores:', backup.data.colaboradores?.length || 0);
  console.log('- Historial Asistencia:', backup.data.historialAsistencia?.length || 0);
  console.log('- Tiempos Extra:', backup.data.tiemposExtra?.length || 0);
  console.log('- Security Log:', backup.data.securityLog?.length || 0);

  // Crear archivo descargable
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `misync-localStorage-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Backup descargado exitosamente!');
  console.log('📁 Archivo:', a.download);

  return backup;
})();
```

5. **Presiona Enter** - Se descargará automáticamente el archivo JSON

6. **Guarda el archivo en:** `migration/localStorage-backup-YYYY-MM-DD.json`

---

### Opción B: Exportación Alternativa (Si la A falla)

1. Abre DevTools → Pestaña "Application" (o "Almacenamiento")
2. Expande "Local Storage" en el panel izquierdo
3. Click en tu dominio (file:// o localhost)
4. Click derecho en cualquier fila → "Copy all"
5. Pega en un archivo de texto

---

## 🔍 Verificación del Backup

Una vez exportado, verifica que el archivo contiene:

```json
{
  "exportDate": "2026-06-09T...",
  "appVersion": "MiSync v1.0 (localStorage)",
  "data": {
    "appUsers": [...],
    "colaboradores": [...],
    "historialAsistencia": [...]
  }
}
```

**Tamaño esperado del archivo:** ~10-20 MB (dependiendo de tu cantidad de datos)

---

## 🛡️ Puntos de Retorno Seguros

Si algo sale mal durante la migración, puedes volver a cualquiera de estos puntos:

### Punto 1: Rama Master Original
```bash
git checkout master
# Todo como estaba antes de la migración
```

### Punto 2: Rama de Backup
```bash
git checkout backup-localStorage-2026-06-09
# Estado exacto del 2026-06-09
```

### Punto 3: Restaurar localStorage
```javascript
// Desde DevTools Console, si perdiste los datos:
const backup = /* pega aquí el contenido del JSON */;

Object.keys(backup.data).forEach(key => {
  localStorage.setItem(key, JSON.stringify(backup.data[key]));
});

console.log('✅ localStorage restaurado desde backup');
location.reload();
```

---

## 📊 Siguiente Paso: Rama de Migración

Una vez que tengas el backup JSON guardado, se creará la rama:

```bash
git checkout -b feature/migration-stack-mi
```

Ahí se implementará el nuevo stack sin tocar `master`.

---

## ⚠️ IMPORTANTE

- **NO borres la rama `backup-localStorage-2026-06-09`** hasta confirmar que la migración funciona 100%
- **Guarda el archivo JSON en múltiples lugares** (USB, nube, email a ti mismo)
- **NO hagas merge a master** hasta que todo esté probado en `misync-dev.mi2.com.mx`
- **La rama master sigue funcionando** durante toda la migración

---

## 📞 Soporte

Si tienes problemas con la exportación:
- Revisa la consola del navegador en busca de errores
- Verifica que la app esté cargada completamente antes de exportar
- Si falla, usa la Opción B (copia manual)

**Estado actual:** ✅ Backup creado, esperando exportación de datos
