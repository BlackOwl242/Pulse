"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import api from "@/services/api";
import { PlusIcon } from "@/icons";

type Whiteboard = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function WhiteboardsDashboard() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();
  const [boards, setBoards] = useState<Whiteboard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace.slug}/whiteboards`);
      setBoards(res.data);
    } catch (error) {
      toast.error("Failed to load whiteboards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [currentWorkspace]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentWorkspace || !confirm("Are you sure you want to delete this whiteboard?")) return;
    
    try {
      await api.delete(`/workspaces/${currentWorkspace.slug}/whiteboards/${id}`);
      toast.success("Whiteboard deleted");
      setBoards(boards.filter(b => b.id !== id));
    } catch (error) {
      toast.error("Failed to delete whiteboard.");
    }
  };

  const handleCreateNew = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await api.post(`/workspaces/${currentWorkspace.slug}/whiteboards`, {
        title: "Untitled Whiteboard"
      });
      toast.success("Whiteboard created");
      router.push(`/whiteboards/${res.data.id}`);
    } catch (error) {
      toast.error("Failed to create whiteboard.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)] xl:min-h-[calc(100vh-72px)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Whiteboards</h1>
          <p className="text-sm text-gray-500 mt-1">Collaborate and draw diagrams in real-time with your team.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition shadow-sm font-medium"
        >
          <svg className="w-5 h-5 mb-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Whiteboard
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 aspect-video animate-pulse" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-gray-800/10">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 text-brand-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No whiteboards yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">Create your first whiteboard to start collaborating, sketching workflows, and brain storming ideas with your team.</p>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium"
          >
            Create your first whiteboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
             <Link href={`/whiteboards/${board.id}`} key={board.id}>
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-brand-500 transition-all duration-300">
                <div className="aspect-video bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-700 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                  <div className="z-10 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    </svg>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">{board.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Edited {new Date(board.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, board.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-none"
                    title="Delete whiteboard"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
