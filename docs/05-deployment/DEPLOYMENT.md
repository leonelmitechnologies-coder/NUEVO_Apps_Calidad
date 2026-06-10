# Guía de Despliegue

Guía completa para desplegar el Sistema de Registro de Asistencia en entornos de desarrollo, staging y producción.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Entorno de Desarrollo](#entorno-de-desarrollo)
- [Entorno de Staging](#entorno-de-staging)
- [Entorno de Producción](#entorno-de-producción)
- [Configuración de CI/CD](#configuración-de-cicd)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Software Necesario

- **Node.js:** >= 16.0.0
- **npm:** >= 8.0.0
- **Git:** >= 2.30.0

### Servicios (Producción)

- Servidor web (Apache, Nginx, o CDN)
- SSL/TLS Certificate
- Dominio configurado
- (Futuro) Backend API
- (Futuro) Base de datos PostgreSQL/MySQL

## 💻 Entorno de Desarrollo

### Configuración Local

```bash
# 1. Clonar repositorio
git clone https://github.com/mi-technologies/apps-calidad.git
cd apps-calidad

# 2. Instalar dependencias
npm install

# 3. Instalar navegadores de Playwright
npx playwright install

# 4. Iniciar servidor de desarrollo
# Opción 1: VS Code Live Server
# Clic derecho en src/pages/index1000.html > "Open with Live Server"

# Opción 2: Python SimpleHTTPServer
python -m http.server 8000
# Abrir: http://localhost:8000/src/pages/index1000.html

# Opción 3: Node.js http-server
npx http-server -p 8000
# Abrir: http://localhost:8000/src/pages/index1000.html
```

### Verificar Instalación

```bash
# Ejecutar tests
npm test

# Verificar formateo
npx prettier --check .

# Ver estructura de archivos
tree -I 'node_modules|.git'
```

## 🧪 Entorno de Staging

### Configuración

Staging replica el entorno de producción para pruebas finales.

```bash
# 1. Crear rama de staging
git checkout -b staging
git push origin staging

# 2. Configurar servidor staging
# Subir archivos a servidor via FTP/SFTP o Git
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@staging.mitechnologies.com:/var/www/apps-calidad/

# 3. Configurar permisos
ssh user@staging.mitechnologies.com
cd /var/www/apps-calidad
chmod -R 755 src/
```

### Configuración de Nginx (Staging)

```nginx
server {
    listen 80;
    server_name staging-apps.mitechnologies.com;

    root /var/www/apps-calidad;
    index src/pages/index1000.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 🚀 Entorno de Producción

### Pre-Despliegue Checklist

- [ ] Tests pasando (`npm test`)
- [ ] Código formateado (`npx prettier --check .`)
- [ ] Sin console.log en producción
- [ ] Variables de entorno configuradas
- [ ] SSL/TLS certificado instalado
- [ ] Backup de base de datos (cuando aplique)
- [ ] Plan de rollback preparado

### Despliegue Manual

```bash
# 1. Preparar código para producción
git checkout main
git pull origin main

# 2. Versionar
npm version patch  # o minor/major
git push --tags

# 3. Comprimir archivos
tar -czf app-v1.0.0.tar.gz \
  src/ \
  tests/ \
  docs/ \
  package.json \
  playwright.config.js \
  .editorconfig \
  .prettierrc \
  README.md

# 4. Subir a servidor
scp app-v1.0.0.tar.gz user@prod.mitechnologies.com:/var/www/

# 5. Desplegar en servidor
ssh user@prod.mitechnologies.com
cd /var/www/
tar -xzf app-v1.0.0.tar.gz
mv apps-calidad apps-calidad.backup  # Backup
mv app-v1.0.0 apps-calidad
sudo systemctl restart nginx
```

### Configuración de Nginx (Producción)

```nginx
server {
    listen 443 ssl http2;
    server_name apps.mitechnologies.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/mitechnologies.crt;
    ssl_certificate_key /etc/ssl/private/mitechnologies.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/apps-calidad;
    index src/pages/index1000.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache estático (1 año)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML sin cache
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/apps-calidad-access.log;
    error_log /var/log/nginx/apps-calidad-error.log;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name apps.mitechnologies.com;
    return 301 https://$server_name$request_uri;
}
```

### Configuración de Apache (.htaccess)

```apache
# Rewrite rules
RewriteEngine On
RewriteBase /

# HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On

    # HTML sin cache
    ExpiresByType text/html "access plus 0 seconds"

    # Archivos estáticos
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

## ☁️ Despliegue a CDN (Netlify/Vercel)

### Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/src/pages/index1000.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Vercel

**vercel.json:**
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/pages/index1000.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

```bash
# Deploy
vercel --prod
```

## 🔄 Configuración de CI/CD

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Check formatting
        run: npx prettier --check .

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        uses: burnett01/rsync-deployments@5.2
        with:
          switches: -avzr --delete --exclude='.git' --exclude='node_modules'
          path: ./
          remote_path: /var/www/apps-calidad/
          remote_host: ${{ secrets.DEPLOY_HOST }}
          remote_user: ${{ secrets.DEPLOY_USER }}
          remote_key: ${{ secrets.DEPLOY_KEY }}
```

## 📊 Monitoreo

### Health Check Endpoint (Futuro)

```javascript
// healthcheck.html
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
</head>
<body>
    <script>
        document.write(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }));
    </script>
</body>
</html>
```

### Logging (Futuro con Backend)

- **Application Logs:** Winston/Bunyan
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics, Mixpanel
- **Performance:** New Relic, Datadog

## 🔧 Troubleshooting

### Problemas Comunes

#### "Cannot GET /src/pages/index1000.html"

```bash
# Verificar permisos
ls -la /var/www/apps-calidad/src/pages/

# Ajustar si es necesario
chmod 755 /var/www/apps-calidad/src/pages/
chmod 644 /var/www/apps-calidad/src/pages/*.html
```

#### CSS/JS no se cargan

```nginx
# Verificar Content-Type en Nginx
location ~* \.(js)$ {
    add_header Content-Type application/javascript;
}

location ~* \.(css)$ {
    add_header Content-Type text/css;
}
```

#### CORS errors (cuando se agregue backend)

```javascript
// Backend: express.js
const cors = require('cors');
app.use(cors({
  origin: 'https://apps.mitechnologies.com'
}));
```

### Rollback

```bash
# Restaurar backup
ssh user@prod.mitechnologies.com
cd /var/www/
rm -rf apps-calidad
mv apps-calidad.backup apps-calidad
sudo systemctl restart nginx
```

## 📝 Changelog de Despliegues

Mantener registro de despliegues en CHANGELOG.md con:
- Fecha y hora
- Versión desplegada
- Cambios incluidos
- Persona que desplegó
- Resultado (exitoso/rollback)

---

**Última actualización:** Junio 2026
**Versión del documento:** 1.0.0
