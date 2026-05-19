'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, ArrowRight, Loader2, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';

interface Project { id: string; name: string; description: string; createdAt: string; }

export default function ProjectsHub() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try { setProjects(await apiFetch('/projects')); } catch (error) { } finally { setIsLoading(false); }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const newProject = await apiFetch('/projects', { method: 'POST', body: JSON.stringify({ name: newName, description: newDesc }) });
      setProjects([newProject, ...projects]);
      setIsCreating(false); setNewName(''); setNewDesc('');
    } finally { setIsSubmitting(false); }
  };

  const startEdit = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation(); 
    setEditingId(p.id); setEditName(p.name); setEditDesc(p.description || '');
  };

  const handleSaveEdit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ name: editName, description: editDesc }) });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editName, description: editDesc } : p));
      setEditingId(null);
    } catch (error) { console.error('Failed to update project'); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this workspace and all its tasks?')) return;
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error('Failed to delete project'); }
  };

  return (
    <div className="h-full p-6 lg:p-10 flex flex-col max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">Project <span className="font-semibold">Workspaces</span></h1>
          <p className="text-zinc-500 text-sm mt-1">Select a matrix to manage its active pipeline.</p>
        </div>
        
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-white dark:bg-zinc-100 text-zinc-900 border border-zinc-900 dark:border-transparent hover:bg-zinc-100 dark:hover:bg-white rounded-none h-10 px-6 font-medium shadow-sm transition-all">
            <Plus className="w-4 h-4 mr-2" /> Initialize Workspace
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 32 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
            <form onSubmit={handleCreateProject} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end backdrop-blur-sm">
              <div className="flex-1 w-full space-y-1.5"><label className="text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500 dark:text-zinc-400">Workspace Name</label><Input autoFocus required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Next.js Migration" className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-zinc-900 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-400" /></div>
              <div className="flex-1 w-full space-y-1.5"><label className="text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500 dark:text-zinc-400">Description (Optional)</label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="e.g. Phase 1 deliverables" className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-zinc-900 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-400" /></div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="rounded-none h-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-none h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 w-full sm:w-32">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy'}</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600 animate-spin" /></div>) 
      : projects.length === 0 && !isCreating ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950/20 text-center p-10">
          <FolderKanban className="w-12 h-12 text-zinc-400 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">No Workspaces Found</h3>
          <p className="text-zinc-500 text-sm mt-2 max-w-sm">Create your first workspace to begin tracking tasks.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {projects.map((project, index) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={() => editingId !== project.id && router.push(`/dashboard/project/${project.id}`)}
              className={`group bg-zinc-100/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 p-6 transition-all duration-300 relative overflow-hidden ${editingId === project.id ? 'border-zinc-400 dark:border-zinc-700' : 'cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
            >
              {editingId === project.id ? (
                <div className="relative z-10 space-y-3" onClick={e => e.stopPropagation()}>
                   <Input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm rounded-none text-zinc-900 dark:text-zinc-100" />
                   <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs rounded-none text-zinc-900 dark:text-zinc-100" />
                   <div className="flex justify-end gap-2 pt-2">
                     <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-none"><X className="w-3.5 h-3.5" /></Button>
                     <Button size="icon" onClick={(e) => handleSaveEdit(e, project.id)} className="h-7 w-7 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 rounded-none"><Check className="w-3.5 h-3.5" /></Button>
                   </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/0 via-zinc-200/0 to-zinc-200/50 dark:from-zinc-800/0 dark:via-zinc-800/0 dark:to-zinc-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">{project.name}</h3>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => startEdit(e, project)} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => handleDelete(e, project.id)} className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2 min-h-[40px]">{project.description || 'No description provided.'}</p>
                    <div className="mt-6 flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-600">
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}