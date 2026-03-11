"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { projectService, Project } from "@/services/projectService";
import { Task, BoardColumn } from "@/types/task";

// Backend sends status as integers (no JsonStringEnumConverter)
// col.name is the string representation from status.ToString()
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; statusInt: number }> = {
  Todo:       { label: "To Do",       color: "text-gray-600 dark:text-gray-400",   bg: "bg-gray-50 dark:bg-gray-800/50",   dot: "bg-gray-400", statusInt: 0 },
  InProgress: { label: "In Progress", color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50/50 dark:bg-blue-900/10",  dot: "bg-blue-500", statusInt: 1 },
  InReview:   { label: "In Review",   color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-900/10", dot: "bg-amber-500", statusInt: 2 },
  Done:       { label: "Done",        color: "text-green-600 dark:text-green-400", bg: "bg-green-50/50 dark:bg-green-900/10", dot: "bg-green-500", statusInt: 3 },
  Cancelled:  { label: "Cancelled",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50/50 dark:bg-red-900/10",    dot: "bg-red-400",  statusInt: 4 },
};

const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: "",       color: "" },
  1: { label: "Low",    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  2: { label: "Medium", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  3: { label: "High",   color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
  4: { label: "Urgent", color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
};

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const slug = "pulse-demo";

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  // Inline create
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Drag state
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColName: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const [proj, board] = await Promise.all([
        projectService.getById(slug, projectId),
        taskService.getBoardView(slug, projectId),
      ]);
      setProject(proj);
      setColumns(board);
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

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) { setAddingInColumn(null); return; }
    try {
      await taskService.create(slug, projectId, {
        projectId,
        title: newTaskTitle,
      });
      setNewTaskTitle("");
      setAddingInColumn(null);
      await fetchBoard();
    } catch { /* ignore */ }
  };

  // --- Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, task: Task, sourceColName: string) => {
    setDraggedTask({ task, sourceColName });
    e.dataTransfer.effectAllowed = "move";
    // Set a minimal drag image
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colName) setDragOverColumn(colName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if truly leaving the column (not entering a child)
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

    // Optimistic update: move task between columns
    setColumns(prev => prev.map(col => {
      if (col.name === sourceColName) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
      }
      if (col.name === targetColName) {
        return { ...col, tasks: [...col.tasks, { ...task, status: targetConfig.statusInt as unknown as Task["status"] }] };
      }
      return col;
    }));

    try {
      // Backend expects integer status values
      await taskService.move(slug, task.id, {
        status: targetConfig.statusInt as unknown as Task["status"],
        position: 0,
      });
    } catch {
      await fetchBoard(); // revert on failure
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

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
        <button
          onClick={() => router.push("/projects")}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {project && (
          <>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              {project.icon || project.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{project.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
            </div>
          </>
        )}
      </div>

      {/* Board — responsive grid, no horizontal scroll */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start">
        {columns.map((col) => {
          const config = STATUS_CONFIG[col.name] || STATUS_CONFIG.Todo;
          const isOver = dragOverColumn === col.name;
          const isDragging = !!draggedTask;

          return (
            <div
              key={col.name}
              className={`flex flex-col rounded-xl min-h-[120px] transition-all duration-150 ${config.bg} ${
                isOver
                  ? "ring-2 ring-brand-500 shadow-lg scale-[1.01]"
                  : isDragging
                  ? "ring-1 ring-gray-200 dark:ring-gray-700"
                  : ""
              }`}
              onDragOver={(e) => handleDragOver(e, col.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.name)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${config.color}`}>{config.label}</span>
                  <span className="text-[10px] text-gray-400 bg-white/70 dark:bg-gray-900/50 px-1.5 py-0.5 rounded-full font-medium">
                    {col.tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setAddingInColumn(col.name); setNewTaskTitle(""); }}
                  className="p-1 text-gray-400 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-2 px-2 pb-2">
                {col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggedTask?.task.id === task.id}
                    onDragStart={(e) => handleDragStart(e, task, col.name)}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {/* Inline create */}
                {addingInColumn === col.name && (
                  <div className="rounded-lg border border-brand-300 dark:border-brand-700 bg-white dark:bg-gray-900 p-2.5 shadow-sm">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateTask();
                        if (e.key === "Escape") setAddingInColumn(null);
                      }}
                      onBlur={() => {
                        if (newTaskTitle.trim()) handleCreateTask();
                        else setAddingInColumn(null);
                      }}
                      placeholder="Task title..."
                      className="w-full text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>
                )}

                {/* Drop target hint when column is empty */}
                {col.tasks.length === 0 && !addingInColumn && (
                  <div className={`flex items-center justify-center h-16 rounded-lg border border-dashed transition-colors ${
                    isOver
                      ? "border-brand-400 bg-brand-50/50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <span className="text-xs text-gray-400">
                      {isOver ? "Drop here" : "No tasks"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const priorityKey = Number(task.priority);
  const pConfig = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG[0];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-lg border bg-white dark:bg-gray-900 p-3 cursor-grab active:cursor-grabbing transition-all group ${
        isDragging
          ? "opacity-40 scale-95 border-brand-300 dark:border-brand-700"
          : "border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 break-words">
        {task.title}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {pConfig.label && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pConfig.color}`}>
              {pConfig.label}
            </span>
          )}
          {task.subtaskCount > 0 && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              ☑ {task.completedSubtaskCount}/{task.subtaskCount}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              💬 {task.commentCount}
            </span>
          )}
        </div>
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0"
            title={`${task.assignee.firstName} ${task.assignee.lastName}`}
          >
            {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
          </div>
        )}
      </div>

      {/* Deadline */}
      {task.deadline && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
          📅 {new Date(task.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
