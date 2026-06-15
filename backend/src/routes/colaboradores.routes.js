import express from 'express';
import {
  listColaboradores,
  createColaborador,
  getColaborador,
  updateColaborador,
  deleteColaborador,
  darDeBajaColaborador,
} from '../controllers/colaboradores.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (sin autenticación) - Solo lectura para dashboard RRHH
/**
 * GET /api/colaboradores
 * Lista todos los colaboradores activos
 * PÚBLICO - No requiere autenticación
 * Query params opcionales:
 *   - departamento: filtrar por departamento
 *   - estatus: filtrar por estatus (Activo, Baja)
 */
router.get('/', listColaboradores);

/**
 * GET /api/colaboradores/:id
 * Obtiene un colaborador específico
 * PÚBLICO - No requiere autenticación
 */
router.get('/:id', getColaborador);

// Rutas protegidas (requieren autenticación)
/**
 * POST /api/colaboradores
 * Crea un nuevo colaborador
 * Requiere permiso 'agregarColaborador' o 'colaboradores'
 */
router.post('/', authenticate, createColaborador);

/**
 * PUT /api/colaboradores/:id
 * Actualiza un colaborador
 * Requiere permiso 'colaboradores'
 */
router.put('/:id', authenticate, updateColaborador);

/**
 * DELETE /api/colaboradores/:id
 * Elimina un colaborador (soft delete)
 * Requiere permiso 'colaboradores'
 */
router.delete('/:id', authenticate, deleteColaborador);

/**
 * PUT /api/colaboradores/:id/baja
 * Dar de baja a un colaborador (cambiar estatus a "Baja")
 * Requiere permiso 'bajas' o 'colaboradores'
 */
router.put('/:id/baja', authenticate, darDeBajaColaborador);

export default router;
