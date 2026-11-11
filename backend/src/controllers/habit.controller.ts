import { NextFunction, Request, Response } from 'express';
import { HabitService } from '../services/habit.service';
import { StatsService } from '../services/stats.service';

export class HabitController {
  public static async getHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientDate = (req.query.date as string) || (req.headers['x-client-date'] as string);
      const habits = await HabitService.getHabits(req.user!.id, clientDate);
      res.status(200).json({
        success: true,
        data: habits,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const habit = await HabitService.createHabit(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Hábito creado con éxito',
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const habitId = req.params.id as string;
      const habit = await HabitService.updateHabit(req.user!.id, habitId, req.body);
      res.status(200).json({
        success: true,
        message: 'Hábito actualizado con éxito',
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const habitId = req.params.id as string;
      await HabitService.deleteHabit(req.user!.id, habitId);
      res.status(200).json({
        success: true,
        message: 'Hábito eliminado o archivado con éxito',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await HabitService.checkIn(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: result.completed ? '¡Hábito marcado como completado!' : 'Hábito desmarcado',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 365;
      const heatmap = await StatsService.getHabitHeatmap(req.user!.id, isNaN(days) ? 365 : days);
      res.status(200).json({
        success: true,
        data: heatmap,
      });
    } catch (error) {
      next(error);
    }
  }
}
