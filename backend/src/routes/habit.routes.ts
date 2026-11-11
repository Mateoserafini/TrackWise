import { Router } from 'express';
import { HabitController } from '../controllers/habit.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { HabitCheckInSchema, HabitSchema, UpdateHabitSchema } from '../schemas/habit.schema';

const router = Router();

// Todas las rutas de hábitos requieren autenticación
router.use(authenticate);

router.get('/', HabitController.getHabits);
router.post('/', validate(HabitSchema), HabitController.createHabit);
router.put('/:id', validate(UpdateHabitSchema), HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);

// Registro diario de cumplimiento (check-in)
router.post('/check', validate(HabitCheckInSchema), HabitController.checkIn);

// Matriz de actividad para el mapa de calor (heatmap)
router.get('/heatmap', HabitController.getHeatmap);

export default router;
