import express from 'express';
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  updateSecurityQuestion,
} from '../controllers/users.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/users
 * Lista todos los usuarios (requiere permiso 'usuarios')
 */
router.get('/', listUsers);

/**
 * POST /api/users
 * Crea un nuevo usuario (requiere permiso 'usuarios')
 */
router.post('/', createUser);

/**
 * GET /api/users/:id
 * Obtiene un usuario específico
 * Puede ver su propio perfil o cualquiera si tiene permiso 'usuarios'
 */
router.get('/:id', getUser);

/**
 * PUT /api/users/:id
 * Actualiza un usuario
 * Puede actualizar su propio perfil o cualquiera si tiene permiso 'usuarios'
 */
router.put('/:id', updateUser);

/**
 * DELETE /api/users/:id
 * Elimina un usuario (soft delete)
 * Requiere permiso 'usuarios'
 */
router.delete('/:id', deleteUser);

/**
 * PUT /api/users/:id/password
 * Cambia la contraseña de un usuario
 * Puede cambiar su propia contraseña o cualquiera si tiene permiso 'usuarios'
 */
router.put('/:id/password', changePassword);

/**
 * PUT /api/users/:id/security-question
 * Actualiza la pregunta de seguridad
 * Solo puede actualizar su propia pregunta
 */
router.put('/:id/security-question', updateSecurityQuestion);

export default router;
