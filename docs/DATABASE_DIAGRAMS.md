# Diagramas de Arquitectura de Base de Datos - MiSync

## Tabla de Contenidos
1. [Arquitectura Actual (localStorage)](#arquitectura-actual-localstorage)
2. [Arquitectura Propuesta (PostgreSQL)](#arquitectura-propuesta-postgresql)
3. [Diagrama de Migración](#diagrama-de-migración)
4. [Flujo de Datos](#flujo-de-datos)

---

## Arquitectura Actual (localStorage)

### Diagrama Entidad-Relación (Conceptual)

```mermaid
erDiagram
    appUsers ||--o{ "sin relación" : ""
    colaboradores ||--o{ historialAsistencia : "tiene"
    colaboradores ||--o{ tiemposExtra : "registra"

    appUsers {
        number id PK
        string usuario UK
        string password "⚠️ texto plano"
        string nombre
        string apellido
        string puesto
        string departamento
        array departamentosPasarAsistencia
        array departamentosTiempoExtra
        string securityQuestion
        string securityAnswer "⚠️ texto plano"
        object permisos
        string photo
    }

    colaboradores {
        number id PK
        string numeroEmpleado "⚠️ no unique"
        string nombres
        string apellidos
        string departamento
        string puesto
        string turno
        string fecha
        string estatus
        boolean baja
        string foto
    }

    historialAsistencia {
        number id PK
        number colaboradorId FK
        string colaboradorNombre "⚠️ desnormalizado"
        string departamento "⚠️ desnormalizado"
        string fecha
        string hora
        string estado
        string tipoInasistencia
        string comentario
    }

    tiemposExtra {
        number id PK
        number colaboradorId FK
        string colaboradorNombre "⚠️ desnormalizado"
        string departamento "⚠️ desnormalizado"
        string puesto "⚠️ desnormalizado"
        string fecha
        number horasExtra
        string motivo
        boolean aprobado
    }

    securityLog {
        string event
        string username
        string timestamp
        string userAgent
    }
```

### Diagrama de Almacenamiento

```mermaid
graph TB
    subgraph Browser["🌐 Navegador (localStorage)"]
        LS[(localStorage<br/>5-10 MB límite)]

        subgraph Keys["Colecciones"]
            K1[appUsers<br/>~50 KB]
            K2[colaboradores<br/>~500 KB]
            K3[historialAsistencia<br/>~15 MB ⚠️]
            K4[tiemposExtra<br/>~2 MB]
            K5[securityLog<br/>~10 KB]
            K6[darkMode<br/>~1 byte]
        end

        LS --> K1
        LS --> K2
        LS --> K3
        LS --> K4
        LS --> K5
        LS --> K6
    end

    subgraph Problemas["⚠️ Problemas"]
        P1[❌ Sin backups]
        P2[❌ Sin replicación]
        P3[❌ Sin concurrencia]
        P4[❌ Sin transacciones]
        P5[❌ Límite 10 MB]
        P6[⚠️ Datos no encriptados]
    end

    LS -.-> Problemas

    style LS fill:#ff9999
    style K3 fill:#ffcccc
    style Problemas fill:#fff3cd
```

### Flujo de Acceso a Datos (Actual)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vista HTML
    participant S as AsistenciaService
    participant LS as localStorage

    U->>V: Abrir Dashboard RRHH
    V->>S: getVistaSemanal(semana, año)
    S->>LS: getItem('colaboradores')
    LS-->>S: [500 colaboradores] (500 KB)
    S->>LS: getItem('historialAsistencia')
    LS-->>S: [50,000 registros] (15 MB) ⚠️
    Note over S: Filtrar en JavaScript<br/>(lento)
    S->>S: Filter + Map + Reduce
    Note over S: ~300ms para procesar
    S-->>V: Datos procesados
    V->>V: Renderizar tabla
    V-->>U: Mostrar resultados
    Note over U,V: Total: ~800ms (UX lenta)
```

---

## Arquitectura Propuesta (PostgreSQL)

### Diagrama Entidad-Relación (Normalizado)

```mermaid
erDiagram
    usuarios ||--o| usuario_seguridad : "tiene"
    usuarios ||--o{ permisos : "tiene"
    usuarios ||--o{ permisos_departamento : "puede acceder"
    usuarios ||--o{ asistencia : "registra"
    usuarios ||--o{ tiempos_extra : "registra"
    usuarios ||--o{ auditoria : "genera"

    departamentos ||--o{ colaboradores : "contiene"
    departamentos ||--o{ puestos : "tiene"
    departamentos ||--o{ permisos_departamento : "controla"

    puestos ||--o{ colaboradores : "asigna"
    turnos ||--o{ colaboradores : "asigna"

    colaboradores ||--o{ asistencia : "registra"
    colaboradores ||--o{ tiempos_extra : "trabaja"

    tipos_inasistencia ||--o{ asistencia : "clasifica"

    usuarios {
        serial id PK
        varchar username UK "✓ único"
        varchar password_hash "✓ bcrypt"
        varchar nombre
        varchar apellido
        varchar puesto
        varchar email UK
        varchar foto_url
        boolean activo
        timestamptz created_at
        timestamptz updated_at
        integer created_by FK
        integer updated_by FK
    }

    usuario_seguridad {
        integer usuario_id PK_FK
        varchar pregunta_seguridad
        varchar respuesta_hash "✓ bcrypt"
        integer intentos_fallidos
        timestamptz bloqueado_hasta
        timestamptz updated_at
    }

    departamentos {
        serial id PK
        varchar nombre UK
        varchar codigo UK
        boolean activo
        timestamptz created_at
    }

    puestos {
        serial id PK
        varchar nombre UK
        varchar codigo
        integer departamento_id FK
        boolean activo
        timestamptz created_at
    }

    turnos {
        serial id PK
        varchar nombre UK
        time hora_entrada
        time hora_salida
        boolean activo
    }

    permisos {
        integer usuario_id PK_FK
        varchar modulo PK
        boolean puede_ver
        boolean puede_crear
        boolean puede_editar
        boolean puede_eliminar
    }

    permisos_departamento {
        integer usuario_id PK_FK
        integer departamento_id PK_FK
        varchar modulo PK
    }

    colaboradores {
        serial id PK
        varchar numero_empleado UK "✓ único"
        varchar nombres
        varchar apellidos
        integer departamento_id FK
        integer puesto_id FK
        integer turno_id FK
        varchar foto_url
        date fecha_alta
        date fecha_baja
        varchar estatus
        text motivo_baja
        timestamptz created_at
        timestamptz updated_at
        integer created_by FK
        integer updated_by FK
    }

    tipos_inasistencia {
        varchar codigo PK
        varchar descripcion
        boolean justificado
        varchar color
        boolean activo
        integer orden_visualizacion
        timestamptz created_at
    }

    asistencia {
        serial id PK
        integer colaborador_id FK "✓ con índice"
        date fecha "✓ con índice"
        time hora
        varchar estado
        varchar tipo_inasistencia FK
        text comentario
        integer registrado_por FK
        timestamptz created_at
        timestamptz updated_at
    }

    tiempos_extra {
        serial id PK
        integer colaborador_id FK
        date fecha
        decimal horas_extra
        text motivo
        boolean aprobado
        integer aprobado_por FK
        timestamptz fecha_aprobacion
        integer registrado_por FK
        timestamptz created_at
        timestamptz updated_at
    }

    auditoria {
        serial id PK
        varchar tabla
        varchar operacion
        integer registro_id
        integer usuario_id FK
        jsonb datos_anteriores
        jsonb datos_nuevos
        inet ip_address
        text user_agent
        timestamptz created_at
    }

    log_seguridad {
        serial id PK
        varchar evento
        varchar username
        integer usuario_id FK
        boolean exitoso
        inet ip_address
        text user_agent
        jsonb detalles
        timestamptz created_at
    }
```

### Diagrama de Infraestructura Propuesta

```mermaid
graph TB
    subgraph Client["🖥️ Cliente"]
        Browser[Navegador Web]
        JS[JavaScript<br/>AsistenciaService]
    end

    subgraph Backend["⚙️ Backend (Node.js + Express)"]
        API[API REST<br/>Express Server]
        Auth[Auth Middleware<br/>JWT Verification]
        Service[Business Logic<br/>Services Layer]
        Valid[Validation<br/>Middleware]
    end

    subgraph Database["💾 Base de Datos"]
        PG[(PostgreSQL<br/>Producción)]
        PG_Read[(PostgreSQL<br/>Read Replica)]
        Redis[(Redis<br/>Cache)]
    end

    subgraph Infrastructure["☁️ Infraestructura"]
        LB[Load Balancer]
        Monitor[Monitoring<br/>Prometheus/Grafana]
        Backup[Backups<br/>Automáticos]
    end

    Browser --> JS
    JS -->|HTTPS/JWT| API
    API --> Auth
    Auth --> Valid
    Valid --> Service
    Service --> Redis
    Redis -->|Cache Miss| PG
    Service --> PG
    Service -.->|Read Only| PG_Read
    PG --> Backup
    API --> Monitor
    LB --> API

    style PG fill:#4CAF50
    style Redis fill:#FF6B6B
    style API fill:#2196F3
    style Auth fill:#FFC107
```

### Flujo de Acceso a Datos (Propuesto)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vista HTML
    participant S as AsistenciaService
    participant API as API REST
    participant Cache as Redis
    participant DB as PostgreSQL

    U->>V: Abrir Dashboard RRHH
    V->>S: getVistaSemanal(semana, año)
    S->>API: GET /api/asistencia/vista-semanal?semana=23&año=2026
    API->>Cache: Check cache
    alt Cache Hit
        Cache-->>API: Datos en caché
        Note over API,Cache: ~5ms
    else Cache Miss
        API->>DB: Query con índices
        Note over DB: SELECT ... JOIN ...<br/>WHERE fecha BETWEEN ...<br/>Índice usado
        DB-->>API: Resultado (solo lo necesario)
        Note over API,DB: ~20ms
        API->>Cache: Guardar resultado (TTL 5min)
    end
    API-->>S: JSON response
    S-->>V: Datos procesados
    V->>V: Renderizar tabla
    V-->>U: Mostrar resultados
    Note over U,V: Total: ~60ms (13x más rápido ✓)
```

---

## Diagrama de Migración

### Proceso de Migración de Datos

```mermaid
graph LR
    subgraph Origen["📦 Origen (localStorage)"]
        LS1[appUsers]
        LS2[colaboradores]
        LS3[historialAsistencia]
        LS4[tiemposExtra]
    end

    subgraph Script["🔄 Script de Migración"]
        Extract[1. Extraer<br/>JSON]
        Transform[2. Transformar<br/>- Hash passwords<br/>- Normalizar<br/>- Validar]
        Validate[3. Validar<br/>- Integridad<br/>- Constraints]
    end

    subgraph Destino["🎯 Destino (PostgreSQL)"]
        PG1[(usuarios)]
        PG2[(departamentos)]
        PG3[(colaboradores)]
        PG4[(asistencia)]
        PG5[(tiempos_extra)]
    end

    LS1 --> Extract
    LS2 --> Extract
    LS3 --> Extract
    LS4 --> Extract

    Extract --> Transform
    Transform --> Validate

    Validate -->|INSERT| PG1
    Validate -->|INSERT| PG2
    Validate -->|INSERT| PG3
    Validate -->|INSERT| PG4
    Validate -->|INSERT| PG5

    style Extract fill:#E3F2FD
    style Transform fill:#FFF9C4
    style Validate fill:#C8E6C9
```

### Estrategia de Migración por Fases

```mermaid
gantt
    title Plan de Migración a PostgreSQL
    dateFormat  YYYY-MM-DD
    section Fase 1: Diseño
    Diseño del esquema           :done, des1, 2026-06-10, 7d
    Revisión y aprobación        :done, des2, after des1, 7d
    section Fase 2: Backend
    Setup PostgreSQL             :active, be1, 2026-06-24, 7d
    Implementar API endpoints    :be2, after be1, 14d
    Testing de endpoints         :be3, after be2, 7d
    section Fase 3: Migración
    Script de migración          :m1, after be3, 7d
    Testing en ambiente dev      :m2, after m1, 7d
    section Fase 4: Frontend
    Actualizar AsistenciaService :fe1, after m2, 7d
    Testing integración          :fe2, after fe1, 7d
    section Fase 5: Producción
    Despliegue staging           :prod1, after fe2, 3d
    Testing QA completo          :prod2, after prod1, 7d
    Despliegue producción        :crit, prod3, after prod2, 1d
    Monitoreo post-despliegue    :prod4, after prod3, 7d
```

---

## Flujo de Datos

### Flujo de Autenticación (Actual vs Propuesto)

#### Actual (localStorage)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Login Form
    participant A as auth.js
    participant LS as localStorage

    U->>F: Ingresar credenciales
    F->>A: login(username, password)
    A->>LS: getItem('appUsers')
    LS-->>A: [usuarios] ⚠️ con passwords en texto plano
    A->>A: find(u => u.password === password)
    Note over A: ⚠️ Comparación directa<br/>SIN HASH
    alt Credenciales correctas
        A->>LS: setItem('isLoggedIn', 'true')
        A->>LS: setItem('username', username)
        A-->>F: { success: true }
        F->>U: Redirigir a dashboard
    else Credenciales incorrectas
        A-->>F: { error: 'Usuario/password incorrectos' }
        F->>U: Mostrar error
    end
```

#### Propuesto (PostgreSQL + JWT)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Login Form
    participant API as API REST
    participant DB as PostgreSQL

    U->>F: Ingresar credenciales
    F->>API: POST /api/auth/login<br/>{username, password}
    API->>DB: SELECT password_hash<br/>FROM usuarios<br/>WHERE username = $1
    DB-->>API: {id, password_hash, ...}
    API->>API: bcrypt.compare(password, hash)
    Note over API: ✓ Verificación segura
    alt Hash válido
        API->>API: jwt.sign({id, username, permisos})
        Note over API: Token expira en 8h
        API-->>F: {success: true, token: 'eyJ...'}
        F->>F: localStorage.setItem('token', token)
        F->>U: Redirigir a dashboard
    else Hash inválido
        API->>DB: INSERT INTO log_seguridad<br/>(evento, username, exitoso)
        API-->>F: {error: 'Credenciales incorrectas'}
        F->>U: Mostrar error
    end
```

### Flujo de Registro de Asistencia (Comparación)

#### Actual

```mermaid
flowchart TD
    Start([Usuario marca asistencia])
    GetData[Cargar colaboradores<br/>desde localStorage]
    Validate{¿Colaborador<br/>existe?}
    CheckDup{¿Ya registrado<br/>hoy?}
    Create[Crear registro JSON]
    GetHist[Leer historialAsistencia]
    Push[Agregar al array]
    Save[Guardar en localStorage]
    Success([Mostrar toast success])
    Error([Mostrar error])

    Start --> GetData
    GetData --> Validate
    Validate -->|No| Error
    Validate -->|Sí| CheckDup
    CheckDup -->|Sí| Error
    CheckDup -->|No| Create
    Create --> GetHist
    GetHist --> Push
    Push --> Save
    Save --> Success

    style Validate fill:#FFF9C4
    style CheckDup fill:#FFF9C4
    style Error fill:#FFCDD2
    style Success fill:#C8E6C9
```

#### Propuesto

```mermaid
flowchart TD
    Start([Usuario marca asistencia])
    API[POST /api/asistencia]
    BeginTx[BEGIN TRANSACTION]
    ValidColab{Validar<br/>colaborador<br/>FK}
    ValidDup{Validar<br/>duplicado<br/>UNIQUE}
    ValidEstado{Validar<br/>estado<br/>CHECK}
    Insert[INSERT INTO asistencia]
    Audit[INSERT INTO auditoria]
    Commit[COMMIT]
    Rollback[ROLLBACK]
    Success([200 OK])
    Error([400/500 Error])

    Start --> API
    API --> BeginTx
    BeginTx --> ValidColab
    ValidColab -->|FK error| Rollback
    ValidColab -->|OK| ValidDup
    ValidDup -->|Duplicado| Rollback
    ValidDup -->|OK| ValidEstado
    ValidEstado -->|Invalid| Rollback
    ValidEstado -->|OK| Insert
    Insert --> Audit
    Audit --> Commit
    Commit --> Success
    Rollback --> Error

    style ValidColab fill:#E1F5FE
    style ValidDup fill:#E1F5FE
    style ValidEstado fill:#E1F5FE
    style Commit fill:#C8E6C9
    style Rollback fill:#FFCDD2
```

---

## Diagrama de Índices y Performance

### Estrategia de Indexación

```mermaid
graph TB
    subgraph Queries["🔍 Queries Frecuentes"]
        Q1[Vista Semanal<br/>GROUP BY colaborador, fecha]
        Q2[Búsqueda por<br/>número empleado]
        Q3[Filtro por<br/>departamento + fecha]
        Q4[Dashboard<br/>métricas agregadas]
    end

    subgraph Indices["📊 Índices Optimizados"]
        I1[idx_asistencia_colab_fecha<br/>colaborador_id, fecha DESC]
        I2[idx_colaboradores_numero_emp<br/>numero_empleado UNIQUE]
        I3[idx_asistencia_fecha_rango<br/>fecha<br/>WHERE recent]
        I4[idx_colaboradores_depto<br/>departamento_id<br/>INCLUDE turno_id]
    end

    Q1 --> I1
    Q2 --> I2
    Q3 --> I3
    Q4 --> I4

    I1 -.->|Scan| Rows1[1000 rows<br/>~20ms]
    I2 -.->|Seek| Rows2[1 row<br/>~1ms]
    I3 -.->|Scan| Rows3[5000 rows<br/>~30ms]
    I4 -.->|Scan| Rows4[500 rows<br/>~10ms]

    style I1 fill:#4CAF50
    style I2 fill:#4CAF50
    style I3 fill:#4CAF50
    style I4 fill:#4CAF50
```

### Comparación de Performance

```mermaid
graph LR
    subgraph LS["localStorage"]
        LS1[Cargar TODO<br/>50,000 registros]
        LS2[Filtrar en JS<br/>Array.filter]
        LS3[Ordenar en JS<br/>Array.sort]
        LS1 --> LS2
        LS2 --> LS3
        LS3 --> LSResult[Resultado<br/>~800ms ⚠️]
    end

    subgraph PG["PostgreSQL"]
        PG1[Query con WHERE]
        PG2[Índice scan]
        PG3[Sort en DB]
        PG1 --> PG2
        PG2 --> PG3
        PG3 --> PGResult[Resultado<br/>~60ms ✓]
    end

    style LSResult fill:#FFCDD2
    style PGResult fill:#C8E6C9
```

---

## Diagrama de Seguridad

### Comparación de Seguridad: Antes vs Después

```mermaid
flowchart TB
    subgraph Antes["⚠️ ANTES (Inseguro)"]
        A1[Contraseña ingresada]
        A2[Guardar en localStorage]
        A3[password: 'admin123']
        A4[Cualquiera con DevTools<br/>puede ver TODO]

        A1 --> A2
        A2 --> A3
        A3 -.->|F12 Console| A4

        style A3 fill:#FFCDD2
        style A4 fill:#FFCDD2
    end

    subgraph Despues["✓ DESPUÉS (Seguro)"]
        D1[Contraseña ingresada]
        D2[bcrypt.hash password, 10]
        D3[password_hash:<br/>'$2a$10$N9qo...']
        D4[Guardar en PostgreSQL]
        D5[JWT Token en localStorage]
        D6[Imposible revertir hash]

        D1 --> D2
        D2 --> D3
        D3 --> D4
        D1 -.->|Solo para auth| D5
        D3 -.->|One-way hash| D6

        style D3 fill:#C8E6C9
        style D6 fill:#C8E6C9
    end
```

### Flujo de Recuperación de Contraseña Seguro

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Forgot Password Modal
    participant API as API REST
    participant DB as PostgreSQL

    U->>F: Ingresar username
    F->>API: POST /api/auth/verify-user
    API->>DB: SELECT id, pregunta_seguridad<br/>FROM usuario_seguridad<br/>WHERE usuario_id = ...
    DB-->>API: {pregunta}
    API-->>F: {pregunta: '¿Tu ciudad natal?'}

    F->>U: Mostrar pregunta
    U->>F: Ingresar respuesta
    F->>API: POST /api/auth/verify-answer<br/>{username, answer}
    API->>DB: SELECT respuesta_hash, intentos_fallidos
    DB-->>API: {hash, intentos: 2}

    API->>API: bcrypt.compare(answer, hash)

    alt Respuesta correcta
        API->>DB: UPDATE intentos_fallidos = 0
        API->>DB: INSERT INTO log_seguridad
        API-->>F: {success: true, password_hash}
        Note over API,F: ⚠️ Mejor opción: enviar reset link
        F->>U: Mostrar contraseña temporal
    else Respuesta incorrecta
        API->>DB: UPDATE intentos_fallidos = intentos + 1
        alt Máximo intentos alcanzado
            API->>DB: UPDATE bloqueado_hasta =<br/>NOW() + INTERVAL '15 minutes'
            API-->>F: {error: 'Bloqueado por 15 min'}
        else Intentos restantes
            API-->>F: {error: 'Incorrecta', intentos: 1}
        end
    end
```

---

## Diagrama de Backup y Recuperación

### Estrategia de Backup Propuesta

```mermaid
graph TB
    subgraph Produccion["🔴 Producción"]
        PG_Prod[(PostgreSQL<br/>Producción)]
    end

    subgraph Backups["💾 Backups Automáticos"]
        PG_Backup1[(Backup Diario<br/>Completo)]
        PG_Backup2[(Backup Incremental<br/>Cada 6 horas)]
        PG_WAL[(WAL Archives<br/>Point-in-time recovery)]
    end

    subgraph Storage["☁️ Almacenamiento"]
        S3[AWS S3<br/>Retención: 30 días]
        Glacier[AWS Glacier<br/>Retención: 1 año]
    end

    subgraph Disaster["🔥 Disaster Recovery"]
        PG_Standby[(Standby Server<br/>Streaming Replication)]
    end

    PG_Prod -->|Diariamente 2 AM| PG_Backup1
    PG_Prod -->|Cada 6h| PG_Backup2
    PG_Prod -->|Continuo| PG_WAL
    PG_Prod -.->|Sync| PG_Standby

    PG_Backup1 --> S3
    PG_Backup2 --> S3
    PG_WAL --> S3
    S3 -->|Después 30 días| Glacier

    style PG_Prod fill:#4CAF50
    style PG_Standby fill:#FFC107
    style S3 fill:#2196F3
```

---

**Documento generado:** 2026-06-09
**Herramientas:** Mermaid.js diagrams
**Formato:** Markdown compatible con GitHub/GitLab
