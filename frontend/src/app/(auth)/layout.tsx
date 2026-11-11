import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-raisin-950 bg-tech-grid flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full relative z-10 flex flex-col items-center">
        {children}
      </div>

      {/* Tech Footer Badge */}
      <div className="mt-8 text-center relative z-10">
        <span className="font-mono text-[10px] text-timberwolf-600 uppercase tracking-widest">
          TRACKWISE CONTROL PLATFORM • ENCRYPTED END-TO-END
        </span>
      </div>
    </div>
  );
}
