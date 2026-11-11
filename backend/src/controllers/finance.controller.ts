import { NextFunction, Request, Response } from 'express';
import { FinanceService } from '../services/finance.service';
import { StatsService } from '../services/stats.service';

export class FinanceController {
  public static async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transaction = await FinanceService.createTransaction(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Transacción registrada con éxito',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await FinanceService.getTransactions(req.user!.id, req.query);
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionId = req.params.id as string;
      await FinanceService.deleteTransaction(req.user!.id, transactionId);
      res.status(200).json({
        success: true,
        message: 'Transacción eliminada con éxito',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const summary = await StatsService.getFinanceSummary(req.user!.id, month, year);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
