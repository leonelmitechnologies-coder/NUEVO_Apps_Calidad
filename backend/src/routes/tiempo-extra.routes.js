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

// Todas las rutas requieren autenticación
router.use(authenticate);

// Importante: /stats debe estar ANTES de /:id para evitar conflictos
router.get('/stats', getTiempoExtraStats);

// CRUD de tiempo extra
router.get('/', listTiempoExtra);
router.post('/', createTiempoExtra);
router.get('/:id', getTiempoExtra);
router.put('/:id', updateTiempoExtra);
router.delete('/:id', deleteTiempoExtra);

export default router;
