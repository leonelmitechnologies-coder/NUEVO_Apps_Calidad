# Instrucciones para configurar MySQL en el servidor

## Problema Actual
El servidor MySQL (192.168.80.103:3306) no permite conexiones remotas desde esta máquina (192.168.15.30).

## Solución 1: Ejecutar directamente en el servidor

Conectarse al servidor 192.168.80.103 y ejecutar:

```bash
# 1. Conectarse a MySQL como root
mysql -u root -p

# 2. Crear la base de datos
CREATE DATABASE IF NOT EXISTS misync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Verificar que se creó
SHOW DATABASES;

# 4. Usar la base de datos
USE misync;

# 5. Salir
EXIT;
```

## Solución 2: Crear usuario con acceso remoto

Si necesitas acceso remoto desde esta máquina (192.168.15.30), ejecutar en el servidor MySQL:

```sql
-- Crear usuario con acceso remoto
CREATE USER 'misync_user'@'192.168.15.30' IDENTIFIED BY 'password_seguro_aqui';

-- Dar permisos completos sobre la base de datos misync
GRANT ALL PRIVILEGES ON misync.* TO 'misync_user'@'192.168.15.30';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

Luego actualizar el archivo .env:
```
DB_USER=misync_user
DB_PASSWORD=password_seguro_aqui
```

## Solución 3: Permitir acceso root remoto (NO RECOMENDADO)

```sql
-- SOLO para desarrollo/testing
GRANT ALL PRIVILEGES ON *.* TO 'root'@'192.168.15.30' IDENTIFIED BY 'M1T3chn0l0g1eS';
FLUSH PRIVILEGES;
```

## Siguiente Paso

Una vez que la base de datos esté creada, ejecutar las migraciones:

```bash
cd backend
npm run db:migrate
```

Luego ejecutar el seed para cargar datos iniciales:

```bash
npm run seed
```
