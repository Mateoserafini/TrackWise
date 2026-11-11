import { env } from '../config/env';

export class EmailService {
  /**
   * Envía el código OTP de 6 dígitos al correo electrónico provisto.
   * Si RESEND_API_KEY está configurada, utiliza la API de Resend vía fetch nativo.
   * De lo contrario o en desarrollo/testing, registra el código en la consola.
   */
  public static async sendOtpEmail(email: string, otpCode: string): Promise<boolean> {
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL / OTP SERVICE] Para: ${email}`);
    console.log(`🔑 CÓDIGO DE VERIFICACIÓN: ${otpCode}`);
    console.log(`⏳ Válido por: 15 minutos`);
    console.log(`==================================================\n`);

    if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: email,
            subject: 'Tu código de verificación - TrackWise',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; text-align: center;">Bienvenido a TrackWise</h2>
                <p style="color: #475569;">Usa el siguiente código de 6 dígitos para verificar tu cuenta:</p>
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #10b981;">
                  ${otpCode}
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">Este código expirará en 15 minutos. Si no solicitaste este registro, puedes ignorar este mensaje.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Error al enviar email con Resend:', errorData);
          return false;
        }

        return true;
      } catch (error) {
        console.error('❌ Fallo de conexión con servicio de correo:', error);
        return false;
      }
    }

    return true;
  }
}
