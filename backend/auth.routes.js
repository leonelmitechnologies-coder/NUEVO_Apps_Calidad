import express from 'express';
import { login, logout, refresh, me } from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Autenticar usuario
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Cerrar sesión (invalidar refresh token)
 */
router.post('/logout', optionalAuth, logout);

/**
 * POST /api/auth/refresh
 * Renovar access token
 */
router.post('/refresh', refresh);

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado
 */
router.get('/me', authenticate, me);

export default router;
