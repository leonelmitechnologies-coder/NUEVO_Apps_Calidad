import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import colaboradoresRoutes from './routes/colaboradores.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';
import tiempoExtraRoutes from './routes/tiempo-extra.routes.js';

// Importar configuración de DB
import { testConnection } from './config/database.js';

// Crear app de Express
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// ============================================
// MIDDLEWARE
// ============================================

// Helmet para seguridad (headers HTTP seguros)
app.use(helmet());

// CORS - permitir requests desde el frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' })); // Para fotos en base64
app.use(express.urlencoded({ extended: true }));

// Logger HTTP (morgan)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_LOGIN_REQUESTS) || 5,
  message: {
    error: 'Demasiados intentos de login',
    message: 'Has excedido el límite de intentos. Intenta en 15 minutos.',
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MiSync API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rutas de autenticación (con rate limiting en login)
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

// Rutas de usuarios (requiere autenticación)
app.use('/api/users', usersRoutes);

// Rutas de colaboradores (requiere autenticación)
app.use('/api/colaboradores', colaboradoresRoutes);

// Rutas de asistencia (requiere autenticación)
app.use('/api/asistencia', asistenciaRoutes);

// Rutas de tiempo extra (requiere autenticación)
app.use('/api/tiempo-extra', tiempoExtraRoutes);

// Ruta 404 - No encontrado
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `No se encontró la ruta: ${req.method} ${req.path}`,
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production'
      ? 'Ocurrió un error al procesar la solicitud'
      : err.stack,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

async function startServer() {
  try {
    // Verificar conexión a base de datos
    console.log('🔌 Conectando a PostgreSQL...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('📝 Verifica la configuración en .env');
      process.exit(1);
    }

    // Iniciar servidor HTTP
    app.listen(PORT, HOST, () => {
      console.log('');
      console.log('✅ Servidor MiSync API iniciado exitosamente');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🌐 URL: http://${HOST}:${PORT}`);
      console.log(`📊 Health Check: http://${HOST}:${PORT}/health`);
      console.log(`🔐 API Base: http://${HOST}:${PORT}/api`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('📡 Endpoints disponibles:');
      console.log('   🔐 Autenticación:');
      console.log('      POST /api/auth/login         - Iniciar sesión');
      console.log('      POST /api/auth/logout        - Cerrar sesión');
      console.log('      POST /api/auth/refresh       - Renovar token');
      console.log('      GET  /api/auth/me            - Obtener usuario actual');
      console.log('');
      console.log('   👥 Usuarios:');
      console.log('      GET    /api/users            - Listar usuarios (admin)');
      console.log('      POST   /api/users            - Crear usuario (admin)');
      console.log('      GET    /api/users/:id        - Obtener usuario');
      console.log('      PUT    /api/users/:id        - Actualizar usuario');
      console.log('      DELETE /api/users/:id        - Eliminar usuario (admin)');
      console.log('      PUT    /api/users/:id/password         - Cambiar contraseña');
      console.log('      PUT    /api/users/:id/security-question - Actualizar pregunta de seguridad');
      console.log('');
      console.log('   👷 Colaboradores:');
      console.log('      GET    /api/colaboradores       - Listar colaboradores');
      console.log('      POST   /api/colaboradores       - Crear colaborador');
      console.log('      GET    /api/colaboradores/:id   - Obtener colaborador');
      console.log('      PUT    /api/colaboradores/:id   - Actualizar colaborador');
      console.log('      DELETE /api/colaboradores/:id   - Eliminar colaborador');
      console.log('      PUT    /api/colaboradores/:id/baja - Dar de baja colaborador');
      console.log('');
      console.log('   📋 Asistencia:');
      console.log('      GET    /api/asistencia          - Listar asistencias');
      console.log('      POST   /api/asistencia          - Registrar asistencia');
      console.log('      GET    /api/asistencia/stats    - Estadísticas de asistencia');
      console.log('      GET    /api/asistencia/:id      - Obtener asistencia');
      console.log('      PUT    /api/asistencia/:id      - Actualizar asistencia');
      console.log('      DELETE /api/asistencia/:id      - Eliminar asistencia');
      console.log('');
      console.log('   ⏰ Tiempo Extra:');
      console.log('      GET    /api/tiempo-extra        - Listar tiempo extra');
      console.log('      POST   /api/tiempo-extra        - Registrar tiempo extra');
      console.log('      GET    /api/tiempo-extra/stats  - Estadísticas de tiempo extra');
      console.log('      GET    /api/tiempo-extra/:id    - Obtener tiempo extra');
      console.log('      PUT    /api/tiempo-extra/:id    - Actualizar tiempo extra');
      console.log('      DELETE /api/tiempo-extra/:id    - Eliminar tiempo extra');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor detenido');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor detenido');
  process.exit(0);
});

export default app;
