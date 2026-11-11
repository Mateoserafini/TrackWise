import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getCategories(req.user!.id);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Categoría creada con éxito',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id as string;
      const category = await CategoryService.updateCategory(req.user!.id, categoryId, req.body);
      res.status(200).json({
        success: true,
        message: 'Categoría actualizada con éxito',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id as string;
      await CategoryService.deleteCategory(req.user!.id, categoryId);
      res.status(200).json({
        success: true,
        message: 'Categoría eliminada con éxito',
      });
    } catch (error) {
      next(error);
    }
  }
}
