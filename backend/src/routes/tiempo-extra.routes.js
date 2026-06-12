import express from 'express';
import {
  listTiempoExtra,
  createTiempoExtra,
  getTiempoExtra,
  updateTiempoExtra,
  deleteTiempoExtra,
  getTiempoExtraStats,
} from '../controllers/tiempo-extra.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (sin autenticación) - Solo lectura para dashboard RRHH
// Importante: /stats debe estar ANTES de /:id para evitar conflictos
router.get('/stats', getTiempoExtraStats);
router.get('/', listTiempoExtra);
router.get('/:id', getTiempoExtra);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, createTiempoExtra);
router.put('/:id', authenticate, updateTiempoExtra);
router.delete('/:id', authenticate, deleteTiempoExtra);

export default router;
