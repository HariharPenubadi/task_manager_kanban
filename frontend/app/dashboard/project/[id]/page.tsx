'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DndContext, DragOverlay, closestCorners, KeyboardSensor, MouseSensor, TouchSensor, 
    useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent, defaultDropAnimationSideEffects, useDroppable
  } from '@dnd-kit/core';
import { 
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, ChevronDown, ChevronUp, ArrowDownUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';

interface Task { id: string; title: string; description: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH'; createdAt: string; }
const COLUMNS = [ { id: 'TODO', title: 'To Do' }, { id: 'IN_PROGRESS', title: 'In Progress' }, { id: 'DONE', title: 'Completed' } ];
const priorityColors = { HIGH: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', MEDIUM: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', LOW: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' };
const priorityValues = { HIGH: 3, MEDIUM: 2, LOW: 1 };

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id, data: { type: 'Column', id } });
  return <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[120px]">{children}</div>;
}

function SortableTaskCard({ task, onDelete, onEdit, isOverlay = false }: { task: Task; onDelete?: any; onEdit?: any; isOverlay?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);

  const hasLongDescription = task.description && task.description.length > 60;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  const handleSave = () => {
    onEdit(task.id, { title: editTitle, description: editDesc, priority: editPriority });
    setIsEditing(false);
  };

  if (isEditing && !isOverlay) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 p-4 relative space-y-3 shadow-lg" onPointerDown={e => e.stopPropagation()}>
        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-xs rounded-none" />
        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full p-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs rounded-none outline-none resize-none text-zinc-900 dark:text-zinc-100" />
        
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-1">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
              <button
                key={p} type="button" onClick={() => setEditPriority(p)}
                className={`flex-1 h-7 text-[9px] font-bold uppercase tracking-wider transition-all border ${editPriority === p ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 justify-end mt-1">
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 w-7 text-zinc-400 hover:text-red-500 rounded-none"><X className="w-4 h-4" /></Button>
            <Button size="icon" onClick={handleSave} className="h-7 w-7 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 rounded-none"><Check className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`touch-none bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 p-4 relative group w-full overflow-hidden transition-colors ${isOverlay ? 'scale-105 shadow-2xl border-zinc-400 dark:border-zinc-700 cursor-grabbing bg-zinc-100 dark:bg-zinc-900/90 z-50' : 'cursor-grab hover:border-zinc-300 dark:hover:border-zinc-700/80'}`} 
      {...attributes} 
      {...listeners}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityColors[task.priority || 'MEDIUM']}`} />
          <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 tracking-tight leading-snug break-words">{task.title}</h4>
        </div>
        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 bg-zinc-100 dark:bg-zinc-950/80 p-1 rounded-md" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(task.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
      {task.description && (
        <div className="mt-2">
          <p className={`text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed break-all sm:break-words whitespace-pre-wrap transition-all duration-300 ${isExpanded && !isOverlay ? '' : 'line-clamp-2'}`}>{task.description}</p>
          {hasLongDescription && !isOverlay && (
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 mt-2 transition-colors uppercase tracking-wider font-mono">
              {isExpanded ? <><ChevronUp className="w-3 h-3"/> Collapse</> : <><ChevronDown className="w-3 h-3"/> Expand</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: projectId } = React.use(params);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectTitle, setProjectTitle] = useState('Loading Workspace...');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sortModes, setSortModes] = useState<Record<string, boolean>>({ TODO: false, IN_PROGRESS: false, DONE: false });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    })
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const projects = await apiFetch('/projects');
        const current = projects.find((p: any) => p.id === projectId);
        if (current) setProjectTitle(current.name);
        const taskData = await apiFetch(`/tasks?projectId=${projectId}`);
        setTasks(taskData);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    loadData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const newTask = await apiFetch('/tasks', { method: 'POST', body: JSON.stringify({ projectId, title: taskTitle, description: taskDesc, priority: taskPriority, status: 'TODO' }) });
      setTasks(prev => [...prev, newTask]);
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('MEDIUM'); setIsModalOpen(false);
    } finally { setIsSubmitting(false); }
  };

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } as Task : t));
      await apiFetch(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    } catch (error) { console.error(error); }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {}
  };

  const onDragStart = (e: DragStartEvent) => e.active.data.current?.type === 'Task' && setActiveTask(e.active.data.current.task);

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e; if (!over) return;
    const activeId = active.id; const overId = over.id; if (activeId === overId) return;
    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const updated = [...tasks]; updated[activeIndex].status = tasks[overIndex].status;
          return arrayMove(updated, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const updated = [...tasks]; updated[activeIndex].status = overId as any;
        return arrayMove(updated, activeIndex, activeIndex); 
      });
    }
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e; if (!over) return;
    const activeTaskFinal = tasks.find(t => t.id === active.id);
    if (activeTaskFinal) {
      try { await apiFetch(`/tasks/${active.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: activeTaskFinal.status }) }); } catch (error) {}
    }
  };

  return (
    <div className="h-full p-4 md:p-8 flex flex-col max-w-7xl mx-auto w-full select-none relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto overflow-hidden">
          <Button onClick={() => router.push('/dashboard')} variant="ghost" className="rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white h-9 px-3 shrink-0"><ArrowLeft className="w-4 h-4 mr-2" /> Hub</Button>
          <div className="min-w-0">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-600 uppercase block">Active Node Matrix</span>
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 truncate w-full pr-4">{projectTitle}</h1>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 rounded-none h-10 px-5 font-medium shadow-md shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Initialize Task
        </Button>
      </div>

      {isLoading ? (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-700 animate-spin" /></div>) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-10">
            {COLUMNS.map((col) => {
              let columnTasks = tasks.filter((t) => t.status === col.id);
              if (sortModes[col.id]) columnTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);

              return (
                <div key={col.id} className="flex flex-col bg-zinc-100/60 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-none w-full backdrop-blur-sm h-fit">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">{col.title}</span>
                      <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 px-1.5 py-0.5 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900">{columnTasks.length}</div>
                    </div>
                    <button onClick={() => setSortModes(p => ({...p, [col.id]: !p[col.id]}))} className={`p-1.5 rounded-sm border transition-all ${sortModes[col.id] ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-200' : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400'}`}><ArrowDownUp className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="p-3 space-y-3 flex flex-col overflow-x-hidden min-h-[120px]">
                    <DroppableColumn id={col.id}>
                      <SortableContext id={col.id} items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {columnTasks.map((task) => (
                          <SortableTaskCard key={task.id} task={task} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                        ))}
                      </SortableContext>
                    </DroppableColumn>
                    {columnTasks.length === 0 && (
                      <div className="h-20 border border-dashed border-zinc-200 dark:border-zinc-900 flex items-center justify-center text-[11px] font-mono text-zinc-400 dark:text-zinc-700 tracking-wide pointer-events-none">Empty Stack</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeTask ? <SortableTaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: 'spring', duration: 0.5 }} className="w-full max-w-md bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl relative z-10 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Deploy Task Node</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-medium text-zinc-400">Designation Title</label>
                  <Input autoFocus required placeholder="e.g. Optimize prompt sequencing" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-none text-sm focus-visible:ring-1 focus-visible:ring-zinc-400 text-zinc-900 dark:text-zinc-100" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-medium text-zinc-400">Operational Breakdown</label>
                  <textarea required placeholder="Describe task metrics..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={4} className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-sm rounded-none outline-none focus:border-zinc-400 transition-colors text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 whitespace-pre-wrap break-words" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-medium text-zinc-400">Priority Weight</label>
                  <div className="flex gap-2 w-full mt-1">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                      <button
                        key={p} type="button" onClick={() => setTaskPriority(p)}
                        className={`flex-1 h-9 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${taskPriority === p ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-none h-10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !taskTitle.trim()} className="rounded-none h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium px-6 hover:opacity-90">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy Node'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}