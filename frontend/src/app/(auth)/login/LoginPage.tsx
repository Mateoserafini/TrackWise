'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email: email.trim().toLowerCase(), password });
      if (res.success && res.token) {
        toastSuccess('Sesión iniciada', `Bienvenido de nuevo, ${res.user.username}`);
        router.push('/overview');
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        // Si la cuenta requiere verificación (403), redirigir a /verify
        if (err.status === 403) {
          toastError('Cuenta no verificada', 'Debes verificar tu código de 6 dígitos.');
          router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
          return;
        }
        setErrorMsg(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      tag="[AUTH // LOGIN_01]"
      title="Iniciar Sesión"
      subtitle="Accede a tu panel unificado de hábitos diarios y finanzas."
      footer={
        <p className="text-xs text-timberwolf-400">
          ¿No tienes una cuenta aún?{' '}
          <Link
            href="/register"
            className="font-mono font-semibold text-coral-400 hover:text-coral-300 underline underline-offset-4 transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-coral-950/40 border border-coral-500/50 text-coral-300 text-xs font-mono">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
          autoFocus
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Acceder al Sistema
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
