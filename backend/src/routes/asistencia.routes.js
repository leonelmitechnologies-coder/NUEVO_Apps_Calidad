import express from 'express';
import {
  listAsistencia,
  createAsistencia,
  getAsistencia,
  updateAsistencia,
  deleteAsistencia,
  getAsistenciaStats,
} from '../controllers/asistencia.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (sin autenticación) - Solo lectura para dashboard RRHH
/**
 * GET /api/asistencia/stats
 * Obtiene estadísticas de asistencia por fecha
 * PÚBLICO - No requiere autenticación
 * Query params opcionales:
 *   - fecha: fecha en formato YYYY-MM-DD (default: hoy)
 */
router.get('/stats', getAsistenciaStats);

/**
 * GET /api/asistencia
 * Lista todos los registros de asistencia activos
 * PÚBLICO - No requiere autenticación
 * Query params opcionales:
 *   - fecha: filtrar por fecha (YYYY-MM-DD)
 *   - departamento: filtrar por departamento
 *   - colaboradorId: filtrar por colaborador
 */
router.get('/', listAsistencia);

/**
 * GET /api/asistencia/:id
 * Obtiene un registro de asistencia específico
 * PÚBLICO - No requiere autenticación
 */
router.get('/:id', getAsistencia);

// Rutas protegidas (requieren autenticación)
/**
 * POST /api/asistencia
 * Crea un nuevo registro de asistencia
 * Requiere permiso 'pasarAsistencia' o 'asistencia'
 */
router.post('/', authenticate, createAsistencia);

/**
 * PUT /api/asistencia/:id
 * Actualiza un registro de asistencia
 * Requiere permiso 'asistencia'
 */
router.put('/:id', authenticate, updateAsistencia);

/**
 * DELETE /api/asistencia/:id
 * Elimina un registro de asistencia (soft delete)
 * Requiere permiso 'asistencia'
 */
router.delete('/:id', authenticate, deleteAsistencia);

export default router;
