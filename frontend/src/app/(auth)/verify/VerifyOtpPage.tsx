'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { OtpInputBox } from '@/components/auth/OtpInputBox';
import { ResendOtpTimer } from '@/components/auth/ResendOtpTimer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/services/api';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const { verifyOtp } = useAuth();
  const { success: toastSuccess } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Auto-submit when 6 digits are typed
  useEffect(() => {
    if (code.length === 6 && email.trim() && !isLoading) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (!email.trim() || code.length !== 6) {
      setErrorMsg('Por favor ingresa el código numérico completo de 6 dígitos.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });

      if (res.success && res.token) {
        toastSuccess('¡Cuenta Verificada!', 'Bienvenido a TrackWise.');
        router.push('/overview');
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Error al verificar el código OTP';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      tag="[AUTH // OTP_VERIFY]"
      title="Verificar Cuenta"
      subtitle={`Ingresa el código numérico de 6 dígitos enviado a ${
        email ? email : 'tu correo electrónico'
      }.`}
      footer={
        <p className="text-xs text-timberwolf-400">
          ¿Deseas usar otro correo?{' '}
          <Link
            href="/login"
            className="font-mono font-semibold text-coral-400 hover:text-coral-300 underline underline-offset-4 transition-colors"
          >
            Volver al inicio
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        {devCode && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span>[DEV // OTP CODE]:</span>
            <span className="font-bold tracking-widest text-emerald-400">{devCode}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-coral-950/40 border border-coral-500/50 text-coral-300 text-xs font-mono">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        {!initialEmail && (
          <div>
            <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider mb-1.5">
              Confirmar Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-raisin-850 border border-raisin-border text-xs rounded-xl px-4 py-2.5 text-timberwolf-100 placeholder:text-timberwolf-600 focus:outline-none focus:border-coral-500"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider text-center">
            Código de Seguridad (6 Dígitos)
          </label>
          <OtpInputBox
            length={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (errorMsg) setErrorMsg(null);
            }}
            disabled={isLoading}
          />
        </div>

        <ResendOtpTimer
          email={email}
          onCodeResent={(c) => {
            if (c) setDevCode(c);
          }}
        />

        <div className="pt-2">
          <Button
            type="button"
            onClick={handleVerify}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={code.length !== 6 || !email.trim()}
            leftIcon={<ShieldCheck className="w-5 h-5" />}
          >
            Activar Cuenta y Entrar
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center font-mono text-xs text-timberwolf-400">
          Cargando verificación...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
