"use client";

import { useEffect } from 'react';
import { Terminal } from '@/components/Terminal';
import { MatrixBackground } from '@/components/MatrixBackground';
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
      <MatrixBackground />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-5xl px-2 md:px-0">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter glow-text mb-4 text-primary uppercase leading-tight">
            SMK YADIKA SOREANG<br />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground/80">DEVOPS LEARNING CENTER</span>
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-terminal/60 font-mono tracking-widest uppercase">
            Elevate your shell skills. Master the system.
          </p>
        </header>

        <Terminal
          initialLines={[
            'Welcome to SMK Yadika Soreang - DevOps Platform v1.1.0',
            'Connection established via SECURE_SHELL',
            'Type "help" to see available commands.',
            ' '
          ]}
        />

        <footer className="mt-16 text-center text-xs font-mono text-foreground/40 space-y-2 uppercase tracking-widest">
          <p>© 2026 SMK Yadika Soreang - RPL Industry Class</p>
          <p>Powered by NextSkill Indonesia</p>
        </footer>
      </div>
    </main>
  );
}
