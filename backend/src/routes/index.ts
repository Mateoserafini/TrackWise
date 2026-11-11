import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import financeRoutes from './finance.routes';
import habitRoutes from './habit.routes';

const router = Router();

// Health check para monitoreo en Render / Ping
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TrackWise API',
  });
});

// Módulos funcionales
router.use('/auth', authRoutes);
router.use('/finance', financeRoutes);
router.use('/habits', habitRoutes);
router.use('/categories', categoryRoutes);

export default router;
