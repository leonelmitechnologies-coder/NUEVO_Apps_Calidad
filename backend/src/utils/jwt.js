import jwt from 'jsonwebtoken';

/**
 * Genera un access token JWT
 */
export function generateAccessToken(user) {
  const payload = {
    id: user.id,
    usuario: user.usuario,
    nombre: user.nombre,
    apellido: user.apellido,
    permisos: user.permisos,
    departamento: user.departamento,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    issuer: process.env.JWT_ISSUER || 'misync-api',
    audience: process.env.JWT_AUDIENCE || 'misync-client',
  });
}

/**
 * Genera un refresh token JWT
 */
export function generateRefreshToken(user, rememberMe = false) {
  const payload = {
    id: user.id,
    usuario: user.usuario,
  };

  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRY_REMEMBER || '30d'
    : process.env.JWT_REFRESH_EXPIRY || '7d';

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
    issuer: process.env.JWT_ISSUER || 'misync-api',
    audience: process.env.JWT_AUDIENCE || 'misync-client',
  });
}

/**
 * Verifica un access token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: process.env.JWT_ISSUER || 'misync-api',
      audience: process.env.JWT_AUDIENCE || 'misync-client',
    });
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Verifica un refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: process.env.JWT_ISSUER || 'misync-api',
      audience: process.env.JWT_AUDIENCE || 'misync-client',
    });
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
}

/**
 * Calcula fecha de expiración de un refresh token
 */
export function getRefreshTokenExpiry(rememberMe = false) {
  const expiryString = rememberMe
    ? process.env.JWT_REFRESH_EXPIRY_REMEMBER || '30d'
    : process.env.JWT_REFRESH_EXPIRY || '7d';

  const value = parseInt(expiryString);
  const unit = expiryString.slice(-1);

  const now = new Date();

  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    default:
      now.setDate(now.getDate() + 7); // Default 7 días
  }

  return now;
}
