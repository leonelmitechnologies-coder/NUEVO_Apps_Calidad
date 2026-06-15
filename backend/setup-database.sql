-- ================================================
-- Setup para Base de Datos MiSync en MySQL
-- ================================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS misync
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Verificar que se creó
SHOW DATABASES LIKE 'misync';

-- 3. Seleccionar la base de datos
USE misync;

-- 4. (Opcional) Crear usuario con acceso remoto
-- Reemplazar '192.168.15.30' con la IP de la máquina cliente
-- Reemplazar 'password_seguro' con una contraseña fuerte

-- CREATE USER 'misync_user'@'192.168.15.30' IDENTIFIED BY 'password_seguro';
-- GRANT ALL PRIVILEGES ON misync.* TO 'misync_user'@'192.168.15.30';
-- FLUSH PRIVILEGES;

-- Mostrar usuarios actuales
SELECT User, Host FROM mysql.user WHERE User = 'root' OR User = 'misync_user';
