import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { TransactionFilterSchema, TransactionSchema } from '../schemas/finance.schema';
import categoryRoutes from './category.routes';

const router = Router();

// Todas las rutas financieras requieren autenticación
router.use(authenticate);

// Sub-rutas de categorías bajo /api/finance/categories
router.use('/categories', categoryRoutes);

// Transacciones
router.get('/transactions', validate(TransactionFilterSchema, 'query'), FinanceController.getTransactions);
router.post('/transactions', validate(TransactionSchema), FinanceController.createTransaction);
router.delete('/transactions/:id', FinanceController.deleteTransaction);

// Resumen y estadísticas financieras (balance, gráficos de torta y barra)
router.get('/summary', FinanceController.getSummary);

export default router;
