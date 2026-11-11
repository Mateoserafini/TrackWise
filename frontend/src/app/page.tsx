'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/overview');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-raisin-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-coral-500 flex items-center justify-center text-white shadow-brutal">
          <Zap className="w-7 h-7 fill-current" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-mono text-sm font-bold tracking-widest text-timberwolf-100 uppercase">
            TRACKWISE // SYSTEM INITIALIZING
          </h1>
          <p className="font-mono text-xs text-timberwolf-500">
            Cargando entorno de usuario...
          </p>
        </div>
      </div>
    </div>
  );
}
