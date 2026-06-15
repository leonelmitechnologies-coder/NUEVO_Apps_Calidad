import { eq, and, isNull } from 'drizzle-orm';
import db from '../config/database.js';
import { users, refresh_tokens, security_logs } from '../db/schema.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js';

/**
 * POST /api/auth/login
 * Autentica un usuario y devuelve tokens JWT
 */
export async function login(req, res) {
  try {
    const { username, password, rememberMe = false } = req.body;

    // Validar campos
    if (!username || !password) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Usuario y contraseña son requeridos',
      });
    }

    // Buscar usuario por username
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.usuario, username), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      // Log intento fallido
      await logSecurityEvent('login_failed', username, req);

      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos',
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);

      await logSecurityEvent('login_blocked', username, req);

      return res.status(423).json({
        error: 'Cuenta bloqueada',
        message: `Cuenta bloqueada por intentos fallidos. Intenta en ${minutesLeft} minutos`,
      });
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      // Incrementar intentos fallidos
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

      let updateData = {
        failed_login_attempts: failedAttempts,
      };

      // Bloquear cuenta si excede intentos máximos
      if (failedAttempts >= maxAttempts) {
        const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15;
        const lockoutUntil = new Date(Date.now() + lockoutMinutes * 60000);

        updateData.locked_until = lockoutUntil;

        await logSecurityEvent('account_locked', username, req, {
          attempts: failedAttempts,
          lockout_until: lockoutUntil,
        });
      }

      await db.update(users).set(updateData).where(eq(users.id, user.id));

      await logSecurityEvent('login_failed', username, req, {
        attempts: failedAttempts,
      });

      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos',
      });
    }

    // Login exitoso - resetear intentos fallidos
    await db
      .update(users)
      .set({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date(),
      })
      .where(eq(users.id, user.id));

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, rememberMe);

    // Guardar refresh token en DB
    await db.insert(refresh_tokens).values({
      user_id: user.id,
      token: refreshToken,
      expires_at: getRefreshTokenExpiry(rememberMe),
    });

    // Log login exitoso
    await logSecurityEvent('login_success', username, req, {
      remember_me: rememberMe,
    });

    // Responder con tokens y datos del usuario
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        departamento: user.departamento,
        photo: user.photo,
        permisos: user.permisos,
        departamentosPasarAsistencia: user.departamentos_pasar_asistencia,
        departamentosTiempoExtra: user.departamentos_tiempo_extra,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar el login',
    });
  }
}

/**
 * POST /api/auth/logout
 * Invalida el refresh token actual
 */
export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Refresh token es requerido',
      });
    }

    // Marcar refresh token como revocado
    await db
      .update(refresh_tokens)
      .set({
        revoked: true,
        revoked_at: new Date(),
      })
      .where(eq(refresh_tokens.token, refreshToken));

    // Log logout
    if (req.user) {
      await logSecurityEvent('logout', req.user.usuario, req);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al cerrar sesión',
    });
  }
}

/**
 * POST /api/auth/refresh
 * Renueva el access token usando un refresh token válido
 */
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Refresh token es requerido',
      });
    }

    // Verificar refresh token (JWT)
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Refresh token inválido o expirado',
      });
    }

    // Verificar que el refresh token exista en DB y no esté revocado
    const [storedToken] = await db
      .select()
      .from(refresh_tokens)
      .where(
        and(
          eq(refresh_tokens.token, refreshToken),
          eq(refresh_tokens.revoked, false)
        )
      )
      .limit(1);

    if (!storedToken) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Refresh token no encontrado o revocado',
      });
    }

    // Verificar que no haya expirado en DB
    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Refresh token expirado',
      });
    }

    // Obtener usuario actual
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, decoded.id), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe',
      });
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al renovar el token',
    });
  }
}

/**
 * GET /api/auth/me
 * Obtiene los datos del usuario autenticado actual
 */
export async function me(req, res) {
  try {
    // req.user viene del middleware authenticate
    const userId = req.user.id;

    // Obtener usuario de la DB (datos actualizados)
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        puesto: user.puesto,
        departamento: user.departamento,
        photo: user.photo,
        permisos: user.permisos,
        departamentosPasarAsistencia: user.departamentos_pasar_asistencia,
        departamentosTiempoExtra: user.departamentos_tiempo_extra,
        securityQuestion: user.security_question,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener datos del usuario',
    });
  }
}

/**
 * Helper: Log de eventos de seguridad
 */
async function logSecurityEvent(event, username, req, metadata = null) {
  try {
    await db.insert(security_logs).values({
      event,
      username,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'],
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Error al guardar log de seguridad:', error);
  }
}
