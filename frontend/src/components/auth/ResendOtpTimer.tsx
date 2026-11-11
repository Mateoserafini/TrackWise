'use client';

import React, { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';

export interface ResendOtpTimerProps {
  email: string;
  initialSeconds?: number;
  onCodeResent?: (devOtp?: string) => void;
}

export function ResendOtpTimer({
  email,
  initialSeconds = 60,
  onCodeResent,
}: ResendOtpTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isSending, setIsSending] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const handleResend = async () => {
    if (seconds > 0 || isSending || !email) return;

    setIsSending(true);
    try {
      const res = await authService.resendOtp(email);
      if (res.success) {
        success('Código reenviado', res.message || 'Se ha enviado un nuevo código a tu correo');
        setSeconds(60);
        if (onCodeResent) {
          onCodeResent(res.devOtp);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reenviar el código OTP';
      error('Fallo al reenviar', msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-xs pt-2">
      <span className="text-timberwolf-500 font-mono">
        {seconds > 0 ? (
          <>
            Reenviar en <span className="text-coral-400 font-bold">{seconds}s</span>
          </>
        ) : (
          '¿No recibiste el código?'
        )}
      </span>

      <button
        type="button"
        onClick={handleResend}
        disabled={seconds > 0 || isSending}
        className="font-mono font-semibold uppercase text-coral-400 hover:text-coral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
      >
        <RotateCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
        Reenviar código
      </button>
    </div>
  );
}
