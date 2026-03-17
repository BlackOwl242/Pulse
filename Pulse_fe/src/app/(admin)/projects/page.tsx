"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { projectService, Project, CreateProjectRequest } from "@/services/projectService";
import { useSlug } from '@/hooks/useSlug';

const PROJECT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateProjectRequest>({
    name: "", description: "", color: PROJECT_COLORS[0],
  });
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const slug = useSlug();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll(slug);
      setProjects(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await projectService.create(slug, form);
      setShowModal(false);
      setForm({ name: "", description: "", color: PROJECT_COLORS[0] });
      await fetchProjects();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.delete(slug, deleteTarget.id);
      setDeleteTarget(null);
      await fetchProjects();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your projects
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10">
            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">No projects yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Create your first project to start organizing your tasks and collaborate with your team.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const progress = project.taskCount > 0
              ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;
            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                {/* Color band top */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: project.color || "#6366f1" }}
                  >
                    {project.icon || project.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {project.completedTaskCount}/{project.taskCount} tasks
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color || "#6366f1",
                      }}
                    />
                  </div>
                </div>
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    project.status === "Active"
                      ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      : project.status === "Archived"
                      ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      : "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                  }`}>
                    {project.status}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mobile App v2"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief project description..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        form.color === c ? "ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreate} disabled={creating || !form.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">Delete Project</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Are you sure you want to delete <strong className="text-gray-700 dark:text-gray-300">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
