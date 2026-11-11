import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query } from '../db';
import { AuthUser, User } from '../types/models';
import { AppError } from './error.middleware';

interface JwtPayload {
  userId: string;
  email: string;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Acceso no autorizado: Token de sesión requerido', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next(new AppError('Acceso no autorizado: Formato de token inválido', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Buscar el usuario en la base de datos para asegurar que existe y está activo/verificado
    const result = await query<User>(
      'SELECT id, username, email, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    const user = result.rows[0];

    if (!user) {
      next(new AppError('Usuario no encontrado o sesión inválida', 401));
      return;
    }

    if (!user.is_verified) {
      next(new AppError('La cuenta no ha sido verificada aún', 403));
      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_verified: user.is_verified,
    };

    req.user = authUser;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('El token de sesión ha expirado', 401));
      return;
    }
    next(new AppError('Token de autenticación inválido', 401));
  }
}
