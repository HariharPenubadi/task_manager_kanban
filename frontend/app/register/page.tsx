'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#09090b] text-white font-sans overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:col-span-7 relative items-end p-16 border-r border-zinc-900 bg-zinc-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-70" />
        
        <div className="relative z-10 max-w-xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase">version 1.0</span>
            <h1 className="text-5xl font-light tracking-tight mt-2 leading-[1.1] text-zinc-100">
              The Next Evolution of <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                Operational Workspace.
              </span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-zinc-400 text-sm font-light leading-relaxed max-w-md"
          >
            Lightning-fast task architecture. Zero-friction execution. The enterprise-grade Kanban engine built for fast-moving engineering teams.
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
              Create Account
            </motion.h2>
            <p className="text-zinc-500 text-xs font-light">
              Access the distributed management matrix.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 text-xs font-mono bg-red-950/30 border border-red-900/50 text-red-400 rounded"
                >
                  ERR_SIGNAL: {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-400 text-[10px] uppercase tracking-[0.15em] font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-zinc-900/30 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-all rounded-none"
                placeholder="Harihar"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-400 text-[10px] uppercase tracking-[0.15em] font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-zinc-900/30 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-all rounded-none"
                placeholder="harihar2709@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-400 text-[10px] uppercase tracking-[0.15em] font-medium">Security Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-zinc-900/30 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0 transition-all rounded-none"
                placeholder="••••••••"
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium transition-all rounded-none cursor-pointer"
              >
                {isLoading ? 'Processing...' : 'Initialize Session'}
              </Button>
            </motion.div>
          </form>

          <div className="text-center pt-2">
            <p className="text-zinc-500 text-xs font-light">
              Existing Identity?{' '}
              <Link href="/login" className="text-zinc-300 hover:text-white underline underline-offset-4 font-normal transition-colors">
                Authorize Here
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}