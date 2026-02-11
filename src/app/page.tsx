"use client";

import { useEffect } from 'react';
import { Terminal } from '@/components/Terminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] text-foreground overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter glow-text mb-4 text-primary">
            YADIKA CTF
          </h1>
          <p className="text-lg md:text-xl text-terminal/80 font-mono">
            Elevate your shell skills. Master the system.
          </p>
        </header>

        <Terminal
          initialLines={[
            'Welcome to Yadika CTF v1.0.0',
            'Connection established via SECURE_SHELL',
            'Type "help" to see available commands.',
            ' '
          ]}
        />

        <footer className="mt-16 text-center text-xs font-mono text-foreground/40 space-y-2">
          <p>© 2026 SMK Yadika RPL - Class of Industry</p>
          <p>Powered by NextSkill Indonesia</p>
        </footer>
      </div>
    </main>
  );
}
