"use client";
import { useState } from "react";
import { useInvitationDialog } from "@/stores/useInvitationDialog";
import { workspaceService } from "@/services/workspaceService";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export default function InvitationDialog() {
  const { isOpen, invitationId, title, content, close } = useInvitationDialog();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen || !invitationId) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await workspaceService.acceptInvitation(invitationId);
      setResult({ type: "success", text: `Joined "${res.workspaceName}" successfully!` });
      useWorkspaceStore.getState().fetchWorkspaces();
    } catch (err: any) {
      setResult({ type: "error", text: err?.response?.data?.message || "Failed to accept" });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await workspaceService.declineInvitation(invitationId);
      setResult({ type: "success", text: "Invitation declined" });
    } catch (err: any) {
      setResult({ type: "error", text: err?.response?.data?.message || "Failed to decline" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) handleClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Workspace Invitation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;ve been invited to join a workspace</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
            {content && <p className="text-sm text-gray-500 dark:text-gray-400">{content}</p>}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mx-6 mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            result.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}>
            {result.text}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          {!result ? (
            <>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                Accept
              </button>
              <button
                onClick={handleDecline}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
