import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Inicializa o devuelve la instancia del transporte de Nodemailer.
   * Si las credenciales no están configuradas, devuelve null y se usa modo consola.
   */
  private static getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    // Requiere usuario y contraseña para no intentar conexiones no autenticadas
    if (!env.SMTP_USER || !env.SMTP_PASS || env.SMTP_USER.trim() === '' || env.SMTP_PASS.trim() === '') {
      return null;
    }

    // Caso 1: Servicio directo (p. ej. Gmail, Outlook, Yahoo)
    if (env.SMTP_SERVICE && env.SMTP_SERVICE.trim() !== '') {
      this.transporter = nodemailer.createTransport({
        service: env.SMTP_SERVICE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      return this.transporter;
    }

    // Caso 2: Host y puerto SMTP personalizado
    if (env.SMTP_HOST && env.SMTP_HOST.trim() !== '') {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      return this.transporter;
    }

    return null;
  }

  /**
   * Envía el código OTP de 6 dígitos al correo electrónico provisto usando Nodemailer.
   * Si no hay credenciales SMTP configuradas, emite el código en la consola para desarrollo/testing.
   */
  public static async sendOtpEmail(email: string, otpCode: string): Promise<boolean> {
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL / OTP SERVICE (Nodemailer)] Para: ${email}`);
    console.log(`🔑 CÓDIGO DE VERIFICACIÓN: ${otpCode}`);
    console.log(`⏳ Válido por: 15 minutos`);
    console.log(`==================================================\n`);

    const transporter = this.getTransporter();

    if (!transporter) {
      console.log('ℹ️ [Nodemailer]: Credenciales SMTP no configuradas. Código emitido en consola.');
      return true;
    }

    try {
      const fromAddress = env.EMAIL_FROM || env.SMTP_USER || 'TrackWise <noreply@trackwise.local>';

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #121212; border: 1px solid rgba(218, 214, 207, 0.15); border-radius: 16px; color: #DAD6CF;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #FC2626; letter-spacing: 2px; text-transform: uppercase; background: rgba(252, 38, 38, 0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(252, 38, 38, 0.2);">
              SYS // AUTH_VERIFICATION
            </span>
            <h1 style="color: #F2EFEB; font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
              Verificación de Cuenta
            </h1>
            <p style="color: #9E9789; font-size: 14px; margin: 0; line-height: 1.5;">
              Usa el siguiente código de 6 dígitos para autenticar tu acceso en TrackWise:
            </p>
          </div>

          <div style="background-color: #1A1A1A; border: 1px solid rgba(218, 214, 207, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #10B981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);">
              ${otpCode}
            </div>
          </div>

          <div style="border-top: 1px solid rgba(218, 214, 207, 0.1); padding-top: 20px; text-align: center;">
            <p style="font-family: monospace; font-size: 12px; color: #736D61; margin: 0;">
              ⏳ Este código expirará en 15 minutos.<br/>
              Si no intentaste ingresar a TrackWise, puedes ignorar este mensaje de forma segura.
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `${otpCode} es tu código de verificación - TrackWise`,
        text: `Tu código de verificación de TrackWise es: ${otpCode}\n\nVálido por 15 minutos. Si no lo solicitaste, puedes ignorar este correo.`,
        html: htmlContent,
      });

      console.log(`✅ [Nodemailer] Correo de verificación enviado con éxito a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error al enviar correo con Nodemailer:', error);
      return false;
    }
  }
}
