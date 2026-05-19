'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, 
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
    return <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[100px]">{children}</div>;
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
      <div className="bg-zinc-950 border border-zinc-700 p-3 relative space-y-3 shadow-lg">
        <Input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-none" />
        <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 bg-zinc-900/50 border-zinc-800 text-xs rounded-none" />
        <div className="flex items-center justify-between mt-2">
          <select value={editPriority} onChange={(e: any) => setEditPriority(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 h-7 px-2 outline-none">
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Med Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
          <div className="flex gap-1.5">
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 w-7 text-zinc-400 hover:text-white rounded-none"><X className="w-3.5 h-3.5" /></Button>
            <Button size="icon" onClick={handleSave} className="h-7 w-7 bg-zinc-100 text-zinc-900 hover:bg-white rounded-none"><Check className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-zinc-950/60 border border-zinc-800/60 p-4 relative group w-full overflow-hidden transition-colors ${isOverlay ? 'scale-105 shadow-2xl border-zinc-700 cursor-grabbing bg-zinc-900/90 z-50' : 'cursor-grab hover:border-zinc-700/80'}`} {...attributes} {...listeners}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityColors[task.priority || 'MEDIUM']}`} />
          <h4 className="text-sm font-medium text-zinc-200 tracking-tight leading-snug break-words">{task.title}</h4>
        </div>
        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 bg-zinc-950/80 p-1 rounded-md" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-zinc-200 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(task.id)} className="text-zinc-500 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
      {task.description && (
        <div className="mt-2">
          <p className={`text-xs text-zinc-500 font-light leading-relaxed break-all sm:break-words whitespace-pre-wrap transition-all duration-300 ${isExpanded && !isOverlay ? '' : 'line-clamp-2'}`}>{task.description}</p>
          {hasLongDescription && !isOverlay && (
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 mt-2 transition-colors uppercase tracking-wider font-mono">
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
  const [activeColumnInput, setActiveColumnInput] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

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

  const handleCreateTask = async (status: string) => {
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const newTask = await apiFetch('/tasks', { method: 'POST', body: JSON.stringify({ projectId, title: taskTitle, description: taskDesc, priority: taskPriority, status }) });
      setTasks(prev => [...prev, newTask]);
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('MEDIUM'); setActiveColumnInput(null);
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
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id; const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const updated = [...tasks];
          updated[activeIndex].status = tasks[overIndex].status;
          return arrayMove(updated, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const updated = [...tasks];
        updated[activeIndex].status = overId as any;
        return arrayMove(updated, activeIndex, activeIndex); 
      });
    }
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const activeTaskFinal = tasks.find(t => t.id === active.id);
    if (activeTaskFinal) {
      try { await apiFetch(`/tasks/${active.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: activeTaskFinal.status }) }); } catch (error) {}
    }
  };

  return (
    <div className="h-full p-4 md:p-8 flex flex-col max-w-7xl mx-auto w-full select-none">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={() => router.push('/dashboard')} variant="ghost" className="rounded-none border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white h-9 px-3"><ArrowLeft className="w-4 h-4 mr-2" /> Hub</Button>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Active Node Matrix</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-100">{projectTitle}</h1>
        </div>
      </div>

      {isLoading ? (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-zinc-700 animate-spin" /></div>) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start overflow-visible pb-10">
            {COLUMNS.map((col) => {
              let columnTasks = tasks.filter((t) => t.status === col.id);
              if (sortModes[col.id]) columnTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);

              return (
                <div key={col.id} className="flex flex-col bg-zinc-900/10 border border-zinc-900 rounded-none w-full backdrop-blur-sm h-fit">
                  <div className="p-4 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-400">{col.title}</span>
                      <div className="text-[10px] font-mono text-zinc-600 px-1.5 py-0.5 bg-zinc-950/50 border border-zinc-900">{columnTasks.length}</div>
                    </div>
                    <button onClick={() => setSortModes(p => ({...p, [col.id]: !p[col.id]}))} className={`p-1.5 rounded-sm border transition-all ${sortModes[col.id] ? 'bg-zinc-800 border-zinc-600 text-zinc-200' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}><ArrowDownUp className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="p-3 space-y-3 flex-1 flex flex-col overflow-x-hidden">
                    <DroppableColumn id={col.id}>
                      <SortableContext id={col.id} items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {columnTasks.map((task) => (
                          <SortableTaskCard key={task.id} task={task} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                        ))}
                      </SortableContext>
                    </DroppableColumn>

                    {activeColumnInput === col.id && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800 p-3 space-y-3">
                        <Input autoFocus placeholder="Task designation..." value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="h-8 bg-zinc-900/30 border-zinc-800 text-xs rounded-none" />
                        <Input placeholder="Details (Optional)..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} className="h-8 bg-zinc-900/30 border-zinc-800 text-xs rounded-none" />
                        <div className="flex items-center justify-between mt-2">
                          <select value={taskPriority} onChange={(e: any) => setTaskPriority(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 h-7 px-2 outline-none">
                            <option value="HIGH">High Priority</option>
                            <option value="MEDIUM">Med Priority</option>
                            <option value="LOW">Low Priority</option>
                          </select>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => setActiveColumnInput(null)} className="h-7 text-[10px] rounded-none px-2.5 text-zinc-400">Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !taskTitle.trim()} onClick={() => handleCreateTask(col.id)} className="h-7 text-[10px] bg-zinc-100 text-zinc-900 hover:bg-white rounded-none px-3 font-medium">Deploy</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                        {activeColumnInput !== col.id && col.id === 'TODO' && (
                            <Button onClick={() => setActiveColumnInput(col.id)} variant="ghost" className="w-full h-9 border border-dashed border-zinc-900 hover:border-zinc-800 text-zinc-500 rounded-none text-xs font-mono justify-center mt-2 transition-colors">
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Append Record
                            </Button>
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
    </div>
  );
}