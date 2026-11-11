import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    const formattedErrors = (err.issues || []).map((e) => ({
      field: e.path.map(String).join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errors: formattedErrors,
    });
    return;
  }

  // Manejo de errores de aplicación controlados
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Errores no controlados (500)
  console.error('💥 Error inesperado:', err);
  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error interno en el servidor',
  });
}
