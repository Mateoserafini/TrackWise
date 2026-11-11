import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query } from '../db';
import { AppError } from '../middlewares/error.middleware';
import { LoginInput, RegisterInput, ResendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';
import { AuthUser, User } from '../types/models';
import { EmailService } from './email.service';

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class AuthService {
  /**
   * Genera un código numérico aleatorio de 6 dígitos.
   */
  private static generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera un token JWT para la sesión del usuario.
   */
  private static generateToken(user: { id: string; email: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Registro de un nuevo usuario con generación y envío de OTP.
   */
  public static async register(input: RegisterInput): Promise<{
    message: string;
    email: string;
    devOtp?: string;
  }> {
    // 1. Verificar si el email ya existe
    const existing = await query<User>('SELECT id FROM users WHERE email = $1', [input.email]);
    if (existing.rows.length > 0) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 400);
    }

    // 2. Hashear la contraseña
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 3. Generar código OTP de 6 dígitos con expiración a 15 minutos
    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 4. Guardar usuario en la base de datos (is_verified = FALSE)
    await query<User>(
      `INSERT INTO users (username, email, password_hash, is_verified, otp_code, otp_expires_at)
       VALUES ($1, $2, $3, FALSE, $4, $5)
       RETURNING id, username, email, is_verified`,
      [input.username, input.email, passwordHash, otpCode, otpExpiresAt]
    );

    // 5. Enviar correo con el código OTP
    await EmailService.sendOtpEmail(input.email, otpCode);

    return {
      message: 'Usuario registrado con éxito. Se ha enviado un código de verificación de 6 dígitos a tu correo.',
      email: input.email,
      ...(env.NODE_ENV !== 'production' ? { devOtp: otpCode } : {}),
    };
  }

  /**
   * Verificación del código OTP y activación de la cuenta.
   */
  public static async verifyOtp(input: VerifyOtpInput): Promise<AuthResponse> {
    const result = await query<User>(
      'SELECT id, username, email, is_verified, otp_code, otp_expires_at FROM users WHERE email = $1',
      [input.email]
    );

    const user = result.rows[0];
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.is_verified) {
      throw new AppError('Esta cuenta ya ha sido verificada anteriormente', 400);
    }

    if (!user.otp_code || user.otp_code !== input.code) {
      throw new AppError('El código de verificación es incorrecto', 400);
    }

    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      throw new AppError('El código de verificación ha expirado. Por favor solicita uno nuevo.', 400);
    }

    // Activar usuario y limpiar código OTP
    const updated = await query<User>(
      `UPDATE users 
       SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, username, email, is_verified`,
      [user.id]
    );

    const activeUser = updated.rows[0]!;
    const token = this.generateToken(activeUser);

    return {
      token,
      user: {
        id: activeUser.id,
        username: activeUser.username,
        email: activeUser.email,
        is_verified: activeUser.is_verified,
      },
    };
  }

  /**
   * Reenvío de un nuevo código OTP.
   */
  public static async resendOtp(input: ResendOtpInput): Promise<{
    message: string;
    devOtp?: string;
  }> {
    const result = await query<User>(
      'SELECT id, is_verified FROM users WHERE email = $1',
      [input.email]
    );

    const user = result.rows[0];
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.is_verified) {
      throw new AppError('La cuenta ya está verificada', 400);
    }

    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `UPDATE users 
       SET otp_code = $1, otp_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [otpCode, otpExpiresAt, user.id]
    );

    await EmailService.sendOtpEmail(input.email, otpCode);

    return {
      message: 'Se ha reenviado un nuevo código de verificación a tu correo.',
      ...(env.NODE_ENV !== 'production' ? { devOtp: otpCode } : {}),
    };
  }

  /**
   * Inicio de sesión de usuario registrado y verificado.
   */
  public static async login(input: LoginInput): Promise<AuthResponse> {
    const result = await query<User>(
      'SELECT id, username, email, password_hash, is_verified FROM users WHERE email = $1',
      [input.email]
    );

    const user = result.rows[0];
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.is_verified) {
      throw new AppError(
        'Tu cuenta aún no ha sido verificada. Ingresa el código OTP enviado a tu correo.',
        403,
        { requiresVerification: true, email: user.email }
      );
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified,
      },
    };
  }

  /**
   * Obtiene la información del usuario autenticado actual.
   */
  public static async getMe(userId: string): Promise<AuthUser> {
    const result = await query<User>(
      'SELECT id, username, email, is_verified FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      is_verified: user.is_verified,
    };
  }
}
