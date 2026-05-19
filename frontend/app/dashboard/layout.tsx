'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, Hexagon, Menu, X, FolderKanban, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [activeProjectName, setActiveProjectName] = useState<string | null>(null);
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/login'); } 
    else { setUserName(JSON.parse(userStr).name); setIsAuthorized(true); }
  }, [router]);

  useEffect(() => {
    const fetchContextData = async () => {
      if (pathname && pathname.includes('/dashboard/project/')) {
        const projectId = pathname.split('/').pop();
        if (!projectId) return;
        try {
          const [projects, tasks] = await Promise.all([ apiFetch('/projects'), apiFetch(`/tasks?projectId=${projectId}`) ]);
          const currProject = projects.find((p: any) => p.id === projectId);
          if (currProject) setActiveProjectName(currProject.name);
          
          setTaskStats({
            total: tasks.length,
            done: tasks.filter((t: any) => t.status === 'DONE').length
          });
        } catch (e) { }
      } else {
        setActiveProjectName(null);
      }
    };
    fetchContextData();
  }, [pathname]);

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  if (!isAuthorized) return null;
  const progressPercent = taskStats.total === 0 ? 0 : Math.round((taskStats.done / taskStats.total) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans flex overflow-hidden transition-colors duration-300">
      
      <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="hidden md:flex flex-col w-72 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/50 relative z-20">
        <div className="p-8 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-900/50 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <Hexagon className="w-6 h-6 text-zinc-900 dark:text-zinc-100 fill-zinc-100 dark:fill-zinc-900" />
          <span className="font-medium tracking-wide text-sm uppercase">Kanban Pro</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-6">
          <Button onClick={() => router.push('/dashboard')} variant="ghost" className={`w-full justify-start h-10 ${pathname === '/dashboard' ? 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800/50 shadow-sm border' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'} transition-all`}>
            <FolderKanban className="w-4 h-4 mr-3" /> Projects Hub
          </Button>

          <AnimatePresence>
            {activeProjectName && (
              <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="pt-4 border-t border-zinc-200 dark:border-zinc-900/50 overflow-hidden">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-mono mb-4 block">Current Matrix</span>
                <div className="bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-900"><div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-1000" style={{ width: `${progressPercent}%` }} /></div>
                  <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-2 line-clamp-1">{activeProjectName}</h4>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Tasks</span><span className="text-lg font-light text-zinc-800 dark:text-zinc-100">{taskStats.total}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Progress</span><span className="text-lg font-light text-emerald-600 dark:text-emerald-400">{progressPercent}%</span></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-900/50 space-y-4">
          <div className="flex items-center gap-3 pt-2 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shrink-0">
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">{userName.charAt(0)}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{userName}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Admin Status</span>
            </div>
            <button onClick={toggleTheme} className="ml-auto p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all shrink-0">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-md h-10 text-sm">
            <LogOut className="w-4 h-4 mr-3" /> Terminate Session
          </Button>
        </div>
      </motion.aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2"><Hexagon className="w-5 h-5 text-zinc-900 dark:text-zinc-100 fill-zinc-100 dark:fill-zinc-900" /><span className="font-medium tracking-wide text-xs uppercase">Kanban Pro</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-500 dark:text-zinc-400">{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden fixed inset-0 z-40 bg-zinc-50 dark:bg-zinc-950 pt-24 px-6 pb-8 flex flex-col">
            <Button onClick={() => { router.push('/dashboard'); setIsMobileMenuOpen(false); }} variant="ghost" className="w-full justify-start h-12 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800/50">
              <FolderKanban className="w-4 h-4 mr-3" /> Projects Hub
            </Button>

            {activeProjectName && (
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-900/50">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-mono mb-4 block">Current Matrix</span>
                <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-900"><div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-1000" style={{ width: `${progressPercent}%` }} /></div>
                  <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-2 line-clamp-1">{activeProjectName}</h4>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Tasks</span><span className="text-lg font-light text-zinc-800 dark:text-zinc-100">{taskStats.total}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Progress</span><span className="text-lg font-light text-emerald-600 dark:text-emerald-400">{progressPercent}%</span></div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-900/50 space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shrink-0">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">{userName.charAt(0)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{userName}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Admin Status</span>
                </div>
                {/* Mobile Thematic Toggle */}
                <button onClick={toggleTheme} className="ml-auto p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0">
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-zinc-500 dark:text-zinc-400 hover:text-red-600 h-12 mt-2">
                <LogOut className="w-4 h-4 mr-3" /> Terminate Session
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative flex flex-col h-screen overflow-hidden pt-16 md:pt-0 bg-zinc-50 dark:bg-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 dark:opacity-30 pointer-events-none" />
        <div className="relative z-10 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}