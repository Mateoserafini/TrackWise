'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success: toastSuccess } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (username.trim().length < 2) {
      setErrorMsg('El nombre de usuario debe tener al menos 2 caracteres.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await register({
        username: username.trim(),
        email: cleanEmail,
        password,
      });

      if (res.success) {
        toastSuccess('Cuenta creada', 'Se ha enviado un código de verificación de 6 dígitos.');
        router.push(`/verify?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Error inesperado al crear la cuenta';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      tag="[AUTH // REGISTER_02]"
      title="Crear Nueva Cuenta"
      subtitle="Comienza a registrar hábitos y finanzas con control de nivel flagship."
      footer={
        <p className="text-xs text-timberwolf-400">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link
            href="/login"
            className="font-mono font-semibold text-coral-400 hover:text-coral-300 underline underline-offset-4 transition-colors"
          >
            Inicia sesión aquí
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
          label="Nombre de Usuario *"
          type="text"
          placeholder="ej. Mateo, Alex99"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="username"
          required
          autoFocus
        />

        <Input
          label="Correo Electrónico *"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <Input
          label="Contraseña (mínimo 6 caracteres) *"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
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
            Crear Cuenta y Continuar
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
