import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CategorySchema, UpdateCategorySchema } from '../schemas/category.schema';

const router = Router();

// Todas las rutas de categorías requieren autenticación
router.use(authenticate);

router.get('/', CategoryController.getCategories);
router.post('/', validate(CategorySchema), CategoryController.createCategory);
router.put('/:id', validate(UpdateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
