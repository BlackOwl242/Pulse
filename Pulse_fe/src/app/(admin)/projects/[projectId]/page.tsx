"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { projectService, Project } from "@/services/projectService";
import { roleService } from "@/services/roleService";
import { commentService, Comment } from "@/services/commentService";
import { labelService, TaskLabel } from "@/services/labelService";
import { checklistService, Checklist } from "@/services/checklistService";
import { Task, BoardColumn } from "@/types/task";
import { WorkspaceMember } from "@/types/roles";

// Backend sends status as integers (no JsonStringEnumConverter)
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; statusInt: number }> = {
  Todo:       { label: "To Do",       color: "text-gray-600 dark:text-gray-400",   bg: "bg-gray-50 dark:bg-gray-800/50",   dot: "bg-gray-400", statusInt: 0 },
  InProgress: { label: "In Progress", color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50/50 dark:bg-blue-900/10",  dot: "bg-blue-500", statusInt: 1 },
  InReview:   { label: "In Review",   color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-900/10", dot: "bg-amber-500", statusInt: 2 },
  Done:       { label: "Done",        color: "text-green-600 dark:text-green-400", bg: "bg-green-50/50 dark:bg-green-900/10", dot: "bg-green-500", statusInt: 3 },
  Cancelled:  { label: "Cancelled",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50/50 dark:bg-red-900/10",    dot: "bg-red-400",  statusInt: 4 },
};

const PRIORITY_OPTIONS = [
  { value: 0, label: "None",   color: "" },
  { value: 1, label: "Low",    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  { value: 2, label: "Medium", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  { value: 3, label: "High",   color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
  { value: 4, label: "Urgent", color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
];

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const slug = "pulse-demo";

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  // Inline create
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Drag state
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColName: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  // Task detail panel
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  // Labels
  const [projectLabels, setProjectLabels] = useState<TaskLabel[]>([]);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6366f1");
  // Checklists
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState<Record<string, string>>({});

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const [proj, board, mems] = await Promise.all([
        projectService.getById(slug, projectId),
        taskService.getBoardView(slug, projectId),
        roleService.getMembers(slug),
      ]);
      setProject(proj);
      setColumns(board);
      setMembers(mems);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug, projectId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  useEffect(() => {
    if (addingInColumn && inputRef.current) inputRef.current.focus();
  }, [addingInColumn]);

  // --- Open task detail ---
  const openTaskDetail = (task: Task) => {
    setSelectedTask({ ...task });
    setPanelOpen(true);
    setConfirmDelete(false);
    setComments([]);
    setShowLabelPicker(false);
    fetchComments(task.id);
    fetchLabels();
    fetchChecklists(task.id);
  };

  const fetchChecklists = async (taskId: string) => {
    try { setChecklists(await checklistService.getAll(slug, taskId)); } catch {}
  };

  const addChecklist = async () => {
    if (!selectedTask) return;
    try {
      const cl = await checklistService.createChecklist(slug, selectedTask.id);
      setChecklists([...checklists, cl]);
    } catch {}
  };

  const addChecklistItem = async (checklistId: string) => {
    const text = newChecklistItemText[checklistId]?.trim();
    if (!text) return;
    try {
      const item = await checklistService.addItem(slug, checklistId, text);
      setChecklists(checklists.map(c => c.id === checklistId ? { ...c, items: [...c.items, item] } : c));
      setNewChecklistItemText({ ...newChecklistItemText, [checklistId]: "" });
    } catch {}
  };

  const toggleChecklistItem = async (checklistId: string, itemId: string, isCompleted: boolean) => {
    try {
      await checklistService.updateItem(slug, itemId, { isCompleted: !isCompleted });
      setChecklists(checklists.map(c => c.id === checklistId
        ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, isCompleted: !isCompleted } : i) }
        : c
      ));
    } catch {}
  };

  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      await checklistService.deleteItem(slug, itemId);
      setChecklists(checklists.map(c => c.id === checklistId
        ? { ...c, items: c.items.filter(i => i.id !== itemId) }
        : c
      ));
    } catch {}
  };

  const fetchLabels = async () => {
    try { setProjectLabels(await labelService.getAll(slug, projectId)); } catch {}
  };

  const toggleLabel = async (labelId: string) => {
    if (!selectedTask) return;
    const has = selectedTask.labels?.some((l) => l.id === labelId);
    try {
      if (has) {
        await labelService.removeFromTask(slug, selectedTask.id, labelId);
        setSelectedTask({ ...selectedTask, labels: selectedTask.labels.filter((l) => l.id !== labelId) });
      } else {
        await labelService.assignToTask(slug, selectedTask.id, labelId);
        const label = projectLabels.find((l) => l.id === labelId);
        if (label) setSelectedTask({ ...selectedTask, labels: [...(selectedTask.labels || []), label] });
      }
    } catch {}
  };

  const createLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const label = await labelService.create(slug, projectId, { name: newLabelName, color: newLabelColor });
      setProjectLabels([...projectLabels, label]);
      setNewLabelName("");
    } catch {}
  };

  const fetchComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const data = await commentService.getAll(slug, taskId);
      setComments(data);
    } catch { /* ignore */ }
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    setPostingComment(true);
    try {
      await commentService.create(slug, selectedTask.id, { content: newComment });
      setNewComment("");
      await fetchComments(selectedTask.id);
    } catch { /* ignore */ }
    setPostingComment(false);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => { setSelectedTask(null); setConfirmDelete(false); }, 200);
  };

  // --- Save task changes ---
  const handleSaveTask = async (field: string, value: unknown) => {
    if (!selectedTask) return;
    setSaving(true);
    try {
      await taskService.update(slug, selectedTask.id, { [field]: value });
      await fetchBoard();
      // Update the selected task in panel
      setSelectedTask(prev => prev ? { ...prev, [field]: value } : null);
    } catch { /* ignore */ }
    setSaving(false);
  };

  // --- Delete task ---
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setDeleting(true);
    try {
      await taskService.delete(slug, selectedTask.id);
      closePanel();
      await fetchBoard();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  // --- Inline create ---
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) { setAddingInColumn(null); return; }
    try {
      await taskService.create(slug, projectId, { projectId, title: newTaskTitle });
      setNewTaskTitle("");
      setAddingInColumn(null);
      await fetchBoard();
    } catch { /* ignore */ }
  };

  // --- Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, task: Task, sourceColName: string) => {
    setDraggedTask({ task, sourceColName });
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colName) setDragOverColumn(colName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColName: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTask) return;
    const { task, sourceColName } = draggedTask;
    if (sourceColName === targetColName) { setDraggedTask(null); return; }
    const targetConfig = STATUS_CONFIG[targetColName];
    if (!targetConfig) { setDraggedTask(null); return; }

    setColumns(prev => prev.map(col => {
      if (col.name === sourceColName) return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
      if (col.name === targetColName) return { ...col, tasks: [...col.tasks, { ...task, status: targetConfig.statusInt as unknown as Task["status"] }] };
      return col;
    }));

    try {
      await taskService.move(slug, task.id, {
        status: targetConfig.statusInt as unknown as Task["status"],
        position: 0,
      });
    } catch { await fetchBoard(); }
    setDraggedTask(null);
  };

  const handleDragEnd = () => { setDraggedTask(null); setDragOverColumn(null); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <button onClick={() => router.push("/projects")} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {project && (
          <>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: project.color || "#6366f1" }}>
              {project.icon || project.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{project.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg">Board</span>
          <button onClick={() => router.push(`/projects/${projectId}/tasks`)}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg">List</button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start">
        {columns.map((col) => {
          const config = STATUS_CONFIG[col.name] || STATUS_CONFIG.Todo;
          const isOver = dragOverColumn === col.name;
          const isDragging = !!draggedTask;
          return (
            <div key={col.name}
              className={`flex flex-col rounded-xl min-h-[120px] transition-all duration-150 ${config.bg} ${
                isOver ? "ring-2 ring-brand-500 shadow-lg scale-[1.01]" : isDragging ? "ring-1 ring-gray-200 dark:ring-gray-700" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, col.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.name)}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${config.color}`}>{config.label}</span>
                  <span className="text-[10px] text-gray-400 bg-white/70 dark:bg-gray-900/50 px-1.5 py-0.5 rounded-full font-medium">{col.tasks.length}</span>
                </div>
                <button onClick={() => { setAddingInColumn(col.name); setNewTaskTitle(""); }} className="p-1 text-gray-400 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              <div className="flex-1 space-y-2 px-2 pb-2">
                {col.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} isDragging={draggedTask?.task.id === task.id}
                    onDragStart={(e) => handleDragStart(e, task, col.name)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openTaskDetail(task)}
                  />
                ))}
                {addingInColumn === col.name && (
                  <div className="rounded-lg border border-brand-300 dark:border-brand-700 bg-white dark:bg-gray-900 p-2.5 shadow-sm">
                    <input ref={inputRef} type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateTask(); if (e.key === "Escape") setAddingInColumn(null); }}
                      onBlur={() => { if (newTaskTitle.trim()) handleCreateTask(); else setAddingInColumn(null); }}
                      placeholder="Task title..." className="w-full text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400" />
                  </div>
                )}
                {col.tasks.length === 0 && !addingInColumn && (
                  <div className={`flex items-center justify-center h-16 rounded-lg border border-dashed transition-colors ${isOver ? "border-brand-400 bg-brand-50/50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                    <span className="text-xs text-gray-400">{isOver ? "Drop here" : "No tasks"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Slide-over Panel */}
      {selectedTask && (
        <>
          <div className={`fixed inset-0 top-16 xl:top-[72px] bg-black/30 z-40 transition-opacity duration-200 ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={closePanel} />
          <div className={`fixed top-16 xl:top-[72px] right-0 h-[calc(100vh-64px)] xl:h-[calc(100vh-72px)] w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-40 transition-transform duration-200 ease-out ${panelOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Task Detail</h2>
              <div className="flex items-center gap-1">
                {saving && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
                <button onClick={closePanel} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Title — click to edit */}
              <EditableText value={selectedTask.title} onSave={(v) => handleSaveTask("title", v)} className="text-xl font-bold text-gray-900 dark:text-white" placeholder="Task title..." />

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
                <EditableText value={selectedTask.description || ""} onSave={(v) => handleSaveTask("description", v)} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" placeholder="Add a description..." multiline />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                  <select
                    value={Number(selectedTask.status)}
                    onChange={(e) => handleSaveTask("status", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={cfg.statusInt}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Priority</label>
                  <select
                    value={Number(selectedTask.priority)}
                    onChange={(e) => handleSaveTask("priority", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Assignee</label>
                <select
                  value={selectedTask.assignee?.id || ""}
                  onChange={(e) => handleSaveTask("assigneeId", e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Start Date</label>
                  <input
                    type="date"
                    value={selectedTask.startDate?.split("T")[0] || ""}
                    onChange={(e) => handleSaveTask("startDate", e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Deadline</label>
                  <input
                    type="date"
                    value={selectedTask.deadline?.split("T")[0] || ""}
                    onChange={(e) => handleSaveTask("deadline", e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Labels</label>
                  <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    {showLabelPicker ? "Done" : "Edit"}
                  </button>
                </div>
                {/* Assigned labels */}
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {selectedTask.labels?.length > 0 ? selectedTask.labels.map((label) => (
                    <span key={label.id} className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: label.color }}>
                      {label.name}
                    </span>
                  )) : <span className="text-xs text-gray-400">No labels</span>}
                </div>
                {/* Label picker */}
                {showLabelPicker && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 space-y-1.5">
                    {projectLabels.map((label) => {
                      const assigned = selectedTask.labels?.some((l) => l.id === label.id);
                      return (
                        <button key={label.id} onClick={() => toggleLabel(label.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${assigned ? "bg-gray-50 dark:bg-gray-800" : ""}`}>
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: label.color }} />
                          <span className="flex-1 text-left text-gray-700 dark:text-gray-300">{label.name}</span>
                          {assigned && <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                      );
                    })}
                    {/* Create new label */}
                    <div className="flex gap-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                      <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      <input type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="New label..." onKeyDown={(e) => { if (e.key === "Enter") createLabel(); }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" />
                      <button onClick={createLabel} disabled={!newLabelName.trim()} className="px-2 py-1 text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50">Add</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklists */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Checklists</label>
                  <button onClick={addChecklist} className="text-xs text-brand-500 hover:text-brand-600 font-medium">+ Add</button>
                </div>
                {checklists.length === 0 ? (
                  <p className="text-xs text-gray-400">No checklists</p>
                ) : (
                  <div className="space-y-3">
                    {checklists.map((cl) => {
                      const done = cl.items.filter(i => i.isCompleted).length;
                      const total = cl.items.length;
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <div key={cl.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">{cl.title}</span>
                            {total > 0 && <span className="text-[10px] text-gray-400">{done}/{total}</span>}
                          </div>
                          {total > 0 && (
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          )}
                          <div className="space-y-1">
                            {cl.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 group">
                                <button onClick={() => toggleChecklistItem(cl.id, item.id, item.isCompleted)}
                                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                    item.isCompleted ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-gray-600 hover:border-brand-500"
                                  }`}>
                                  {item.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <span className={`text-xs flex-1 ${item.isCompleted ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>{item.content}</span>
                                <button onClick={() => deleteChecklistItem(cl.id, item.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          {/* Add item input */}
                          <div className="flex gap-1.5 mt-2">
                            <input type="text" value={newChecklistItemText[cl.id] || ""}
                              onChange={(e) => setNewChecklistItemText({ ...newChecklistItemText, [cl.id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") addChecklistItem(cl.id); }}
                              placeholder="Add item..."
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" />
                            <button onClick={() => addChecklistItem(cl.id)} disabled={!newChecklistItemText[cl.id]?.trim()}
                              className="px-2 py-1 text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50">Add</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Created</span>
                  <span>{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedTask.completedAt && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Completed</span>
                    <span>{new Date(selectedTask.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTask.subtaskCount > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Subtasks</span>
                    <span>{selectedTask.completedSubtaskCount}/{selectedTask.subtaskCount}</span>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </label>

                {/* Add comment */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text" value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none"
                  />
                  <button onClick={handleAddComment} disabled={postingComment || !newComment.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 shrink-0">
                    {postingComment ? "..." : "Send"}
                  </button>
                </div>

                {/* Comment list */}
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0 mt-0.5">
                          {comment.author.firstName?.charAt(0)}{comment.author.lastName?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{comment.author.firstName} {comment.author.lastName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer — Delete */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-500 flex-1">Delete this task?</span>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                  <button onClick={handleDeleteTask} disabled={deleting} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
                    {deleting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Confirm
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete task
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Editable Text Component ---
function EditableText({ value, onSave, className, placeholder, multiline }: {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setText(value); }, [value]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const save = () => {
    setEditing(false);
    if (text.trim() !== value) onSave(text.trim());
  };

  if (editing) {
    const sharedProps = {
      ref: ref as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
      value: text,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(e.target.value),
      onBlur: save,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) save();
        if (e.key === "Escape") { setText(value); setEditing(false); }
      },
      className: `w-full px-2 py-1 -mx-2 -my-1 border border-brand-300 dark:border-brand-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className}`,
      placeholder,
    };

    return multiline ? (
      <textarea {...sharedProps} rows={3} />
    ) : (
      <input type="text" {...sharedProps} />
    );
  }

  return (
    <div onClick={() => setEditing(true)} className={`cursor-pointer rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className} ${!value ? "text-gray-400 italic" : ""}`}>
      {value || placeholder || "Click to edit"}
    </div>
  );
}

// --- Task Card ---
function TaskCard({ task, isDragging, onDragStart, onDragEnd, onClick }: {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const priorityKey = Number(task.priority);
  const pConfig = PRIORITY_OPTIONS[priorityKey] || PRIORITY_OPTIONS[0];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`rounded-lg border bg-white dark:bg-gray-900 p-3 cursor-grab active:cursor-grabbing transition-all group ${
        isDragging
          ? "opacity-40 scale-95 border-brand-300 dark:border-brand-700"
          : "border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      {task.labels?.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {task.labels.map((label) => (
            <span key={label.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 break-words">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {pConfig.label && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pConfig.color}`}>{pConfig.label}</span>}
          {task.subtaskCount > 0 && <span className="text-[10px] text-gray-400">☑ {task.completedSubtaskCount}/{task.subtaskCount}</span>}
          {task.commentCount > 0 && <span className="text-[10px] text-gray-400">💬 {task.commentCount}</span>}
        </div>
        {task.assignee && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0" title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
            {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
          </div>
        )}
      </div>
      {task.deadline && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">📅 {new Date(task.deadline).toLocaleDateString()}</div>
      )}
    </div>
  );
}
