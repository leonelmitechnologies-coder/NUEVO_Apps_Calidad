# 🚀 Plan de Migración MiSync → Stack MI

**Fecha de inicio:** 2026-06-09
**Rama de backup:** `backup-localStorage-2026-06-09`
**Rama de trabajo:** `feature/migration-stack-mi`
**Objetivo:** Migrar de localStorage a PostgreSQL siguiendo el Stack MI oficial

---

## 📊 Estado Actual

### ✅ Fase 0: Preparación y Backup (COMPLETADO)
- [x] Análisis completo de base de datos actual
- [x] Documentación de problemas identificados
- [x] Rama de backup creada y pusheada a GitHub
- [x] Directorio `migration/` creado
- [x] Instrucciones de exportación de datos
- [x] .gitignore actualizado para proteger datos sensibles

### ⏳ Fase 1: Exportación de Datos (PENDIENTE - ACCIÓN REQUERIDA)
- [ ] **USUARIO DEBE:** Ejecutar script de exportación en navegador
- [ ] **USUARIO DEBE:** Guardar archivo JSON en `migration/`
- [ ] Verificar integridad del backup JSON
- [ ] Confirmar cantidad de registros exportados

---

## 🗺️ Roadmap de Migración (8-11 semanas)

### Fase 2: Setup del Stack MI (Semana 1-2)
- [ ] Crear rama `feature/migration-stack-mi`
- [ ] Clonar starter template oficial: `github.com/mi2-apps/stack-template`
- [ ] Instalar dependencias (`npm install`)
- [ ] Verificar que pasa 9/9 checks de conformidad
- [ ] Setup local de desarrollo

### Fase 3: Provisión de Infraestructura (Semana 2)
- [ ] Solicitar provisión SSO: `provision-app-sso misync`
- [ ] Solicitar PostgreSQL en Coolify (automático)
- [ ] Solicitar storage S3: `provision-app-storage misync`
- [ ] Solicitar SES email: `provision-app-ses misync`
- [ ] Solicitar Sentry: `provision-app-sentry misync`
- [ ] Verificar env vars inyectadas en Coolify

### Fase 4: Schema PostgreSQL (Semana 3)
- [ ] Diseñar schema Drizzle en `shared/schema.ts`
  - [ ] Tabla `users` (con `oidc_sub` para SSO)
  - [ ] Tabla `colaboradores` (con FK constraints)
  - [ ] Tabla `historial_asistencia` (con índices)
  - [ ] Tabla `tiempos_extra`
  - [ ] Tabla `security_log`
  - [ ] Tablas adicionales (departamentos, etc.)
- [ ] Generar migraciones: `npm run db:generate`
- [ ] Aplicar migraciones en dev: `npm run db:migrate`
- [ ] Verificar schema en PostgreSQL

### Fase 5: Backend API (Semana 4-5)
- [ ] Configurar Passport.js con estrategia OIDC
- [ ] Implementar rutas de autenticación (`/auth/login`, `/auth/callback`)
- [ ] Crear endpoints API REST:
  - [ ] `/api/v1/users` (CRUD)
  - [ ] `/api/v1/colaboradores` (CRUD)
  - [ ] `/api/v1/asistencia` (CRUD + filtros)
  - [ ] `/api/v1/tiempos-extra` (CRUD)
  - [ ] `/api/v1/reportes` (queries complejas)
- [ ] Middleware de validación (Zod schemas)
- [ ] Middleware de autenticación (`requireUser`)
- [ ] Documentación API con Scalar (`/api/docs`)

### Fase 6: Migración de Datos (Semana 5)
- [ ] Crear script `server/migrate-data.ts`
- [ ] Leer archivo JSON de backup
- [ ] Transformar datos localStorage → PostgreSQL:
  - [ ] Migrar usuarios (hash contraseñas con bcrypt)
  - [ ] Migrar colaboradores
  - [ ] Migrar historial asistencia (batch inserts)
  - [ ] Migrar tiempos extra
  - [ ] Migrar logs de seguridad
- [ ] Validar integridad post-migración
- [ ] Verificar conteos de registros

### Fase 7: Frontend React (Semana 6-7)
- [ ] Adaptar UI actual a componentes shadcn/ui:
  - [ ] Login con SSO (botón "Iniciar sesión con Nextcloud")
  - [ ] Dashboard principal
  - [ ] Módulo de Colaboradores
  - [ ] Módulo de Asistencia
  - [ ] Módulo de Tiempos Extra
  - [ ] Módulo de Reportes
- [ ] Reemplazar localStorage por API calls (React Query)
- [ ] Implementar estado global (Zustand si es necesario)
- [ ] Formularios con React Hook Form + Zod
- [ ] Responsive design mobile-first (Tailwind)

### Fase 8: Internacionalización (Semana 7)
- [ ] Crear archivos de traducción:
  - [ ] `client/public/locales/en/common.json`
  - [ ] `client/public/locales/es-MX/common.json`
  - [ ] `client/public/locales/zh-CN/common.json`
- [ ] Traducir todos los strings de UI
- [ ] Implementar selector de idioma
- [ ] Persistir preferencia en localStorage

### Fase 9: Sistemas Obligatorios (Semana 8)
- [ ] Sistema de Documentación (`/manual`):
  - [ ] Migración SQL (7 tablas)
  - [ ] Admin UI con TipTap
  - [ ] Páginas de ayuda en EN + ES
- [ ] Sistema de Changelog (`/changelog`):
  - [ ] Migración SQL (3 tablas)
  - [ ] Modal "Novedades" post-login
  - [ ] Entrada para v2.0.0 (migración Stack MI)

### Fase 10: Testing (Semana 9)
- [ ] Tests unitarios (Vitest):
  - [ ] Validaciones Zod
  - [ ] Helpers y utilidades
  - [ ] Lógica de negocio
- [ ] Tests E2E (Playwright):
  - [ ] Flujo de login SSO
  - [ ] CRUD colaboradores
  - [ ] Registro de asistencia
  - [ ] Generación de reportes
- [ ] Verificar >80% coverage en paths críticos

### Fase 11: Deploy a Dev (Semana 10)
- [ ] Push rama a GitHub
- [ ] Coolify detecta webhook
- [ ] Build en COOLIFY-BUILD-01
- [ ] Deploy a `misync-dev.mi2.com.mx`
- [ ] E2E automático (`deploy_watcher`)
- [ ] QA manual en dev

### Fase 12: Deploy a Producción (Semana 11)
- [ ] Merge `feature/migration-stack-mi` → `master`
- [ ] Coolify rebuilds producción
- [ ] Deploy a `misync.mi2.com.mx`
- [ ] E2E contra producción
- [ ] Anuncio a usuarios
- [ ] Monitoreo post-deploy (Sentry)

---

## 🛡️ Estrategia de Rollback

Si algo falla en cualquier fase:

### Rollback Nivel 1: Rama de Trabajo
```bash
# Descartar cambios locales
git checkout feature/migration-stack-mi
git reset --hard origin/feature/migration-stack-mi
```

### Rollback Nivel 2: Master Intacto
```bash
# Volver a master (sistema actual)
git checkout master
# Todo funciona como antes
```

### Rollback Nivel 3: Backup del 2026-06-09
```bash
# Volver al punto exacto del backup
git checkout backup-localStorage-2026-06-09
```

### Rollback Nivel 4: Restaurar Datos localStorage
```javascript
// En DevTools Console del navegador
fetch('/migration/localStorage-backup-2026-06-09.json')
  .then(r => r.json())
  .then(backup => {
    Object.keys(backup.data).forEach(key => {
      localStorage.setItem(key, JSON.stringify(backup.data[key]));
    });
    console.log('✅ Datos restaurados');
    location.reload();
  });
```

---

## 📊 Métricas de Éxito

### Funcionales
- ✅ Todos los módulos actuales funcionan igual o mejor
- ✅ Usuarios pueden iniciar sesión con SSO
- ✅ Todos los datos migrados correctamente
- ✅ Reportes generan mismos resultados
- ✅ Performance ≥ 10x mejor que localStorage

### Técnicas
- ✅ Pasa 9/9 checks de conformidad
- ✅ Trilingüe (EN, ES-MX, ZH-CN)
- ✅ Mobile-ready (viewport + responsive)
- ✅ Sistemas `/manual` y `/changelog` funcionando
- ✅ Tests E2E pasando en dev y prod
- ✅ Cero errores en Sentry post-deploy

### De Negocio
- ✅ Cero pérdida de datos
- ✅ Cero downtime (deploy paralelo)
- ✅ Usuarios pueden volver al sistema anterior si necesario
- ✅ Documentación completa para nuevos desarrolladores

---

## 📞 Contactos de Soporte

- **Infraestructura Coolify:** coolify01@mi2.com.mx
- **SSO Nextcloud:** itgroup@mitechnologiesinc.com
- **Stack MI general:** Referencia en https://apps.mi2.com.mx/stack

---

## 📅 Timeline Estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 0. Preparación | 1 día | 1 día |
| 1. Exportación datos | 1 día | 2 días |
| 2. Setup Stack MI | 1-2 semanas | 2-3 semanas |
| 3. Infraestructura | 3 días | 3 semanas |
| 4. Schema PostgreSQL | 1 semana | 4 semanas |
| 5. Backend API | 2 semanas | 6 semanas |
| 6. Migración datos | 1 semana | 7 semanas |
| 7. Frontend React | 2 semanas | 9 semanas |
| 8. i18n | 1 semana | 10 semanas |
| 9. Docs/Changelog | 1 semana | 11 semanas |
| 10. Testing | 1 semana | 12 semanas |
| 11-12. Deploy | 1 semana | **13 semanas** |

**Total:** ~3 meses con 1-2 desarrolladores full-time

---

## ⚠️ Decisiones Pendientes

- [ ] ¿Quién será el desarrollador principal?
- [ ] ¿Habrá QA dedicado o lo hace el mismo dev?
- [ ] ¿Deploy a producción será en horario laboral o fuera de horas?
- [ ] ¿Cuándo es la fecha límite deseada de lanzamiento?
- [ ] ¿Hay presupuesto para contratar ayuda externa si es necesario?

---

**Última actualización:** 2026-06-09
**Próximo paso:** Usuario debe exportar datos localStorage (ver `migration/README.md`)
