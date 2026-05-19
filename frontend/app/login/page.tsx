'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid email credentials.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <AnimatePresence mode="popLayout">
        
        {isRegistered && !isSuccess && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 text-[11px] font-mono bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 rounded flex items-center gap-2 uppercase tracking-wide overflow-hidden"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Account Secured. Proceed to Authorization.</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 text-[11px] font-mono bg-red-950/30 border border-red-900/50 text-red-400 rounded flex items-center gap-2 overflow-hidden"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>ERR_AUTH_DENIED: {error}</span>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 text-[11px] font-mono bg-zinc-100 text-zinc-900 rounded flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg overflow-hidden"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Authorizing The Entry...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-zinc-400 text-[10px] uppercase tracking-[0.15em] font-medium">Access Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isSuccess}
          className="h-11 bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-all rounded-none disabled:opacity-50"
          placeholder="harihar2709@gmail.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-zinc-400 text-[10px] uppercase tracking-[0.15em] font-medium">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || isSuccess}
          className="h-11 bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-all rounded-none disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <motion.div
        whileHover={!isLoading && !isSuccess ? { scale: 1.01 } : {}}
        whileTap={!isLoading && !isSuccess ? { scale: 0.99 } : {}}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium transition-all rounded-none cursor-pointer disabled:opacity-90"
        >
          {(isLoading && !isSuccess) ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSuccess ? 'Authorized' : 'Request Access')}
        </Button>
      </motion.div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#09090b] text-white font-sans overflow-hidden">
      
      {/* LEFT PANEL*/}
      <div className="hidden lg:flex lg:col-span-7 relative items-end p-16 border-r border-zinc-900 bg-zinc-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-70" />
        
        <div className="relative z-10 max-w-xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase">VERSION 1.0</span>
            <h1 className="text-5xl font-light tracking-tight mt-2 leading-[1.1] text-zinc-100">
              Welcome to the <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                Kanban Pro.
              </span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-zinc-400 text-sm font-light leading-relaxed max-w-md"
          >
            Secure your workspaces with stateless JWT authentication, unlocking isolated access to your development pipelines, synchronized workloads, and real-time Kanban boards.
          </motion.p>
        </div>
      </div>

      {/* RIGHT PANEL*/}
      <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm space-y-8">
          
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl font-medium tracking-tight text-zinc-100"
            >
              Sign In Identity
            </motion.h2>
            <p className="text-zinc-500 text-xs font-light">
              Provide authorization credentials.
            </p>
          </div>

          <Suspense fallback={<div className="h-40 flex items-center justify-center mt-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div>}>
            <LoginForm />
          </Suspense>

          <div className="text-center pt-2">
            <p className="text-zinc-500 text-xs font-light">
              New Node Connection?{' '}
              <Link href="/register" className="text-zinc-300 hover:text-white underline underline-offset-4 font-normal transition-colors">
                Register Identity
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}