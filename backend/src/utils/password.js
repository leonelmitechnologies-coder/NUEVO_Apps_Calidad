import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Valida requisitos de contraseña
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    };
  }

  return { valid: true };
}
