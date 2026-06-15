import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación
 * Verifica que el request tenga un token JWT válido
 */
export function authenticate(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = verifyAccessToken(token);

    // Agregar datos del usuario al request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'No autorizado',
      message: error.message || 'Token inválido o expirado',
    });
  }
}

/**
 * Middleware de autorización por permisos
 * Verifica que el usuario tenga un permiso específico
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Autenticación requerida',
      });
    }

    const hasPermission = req.user.permisos && req.user.permisos[permission];

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Prohibido',
        message: `No tienes permiso para: ${permission}`,
      });
    }

    next();
  };
}

/**
 * Middleware opcional de autenticación
 * Intenta autenticar pero no falla si no hay token
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continuar sin autenticación
    next();
  }
}
