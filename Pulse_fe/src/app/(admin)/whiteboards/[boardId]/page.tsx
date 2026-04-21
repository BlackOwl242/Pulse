"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tldraw, useEditor, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import api from "@/services/api";
import { toast } from "sonner";
import { connectWhiteboard, joinWhiteboard, leaveWhiteboard, sendWhiteboardUpdate } from "@/lib/socket";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import throttle from 'lodash/throttle';
import { useTheme } from "@/context/ThemeContext";

function WhiteboardSync({ boardId, currentWorkspaceSlug, onRemoteRename }: { 
  boardId: string, 
  currentWorkspaceSlug: string,
  onRemoteRename?: (newTitle: string) => void
}) {
  const editor = useEditor();
  const isSyncing = useRef(false);
  const pendingChanges = useRef<any[]>([]);
  const flushTimeout = useRef<any>(null);

  // Auto-Save full snapshot to DB every 10 seconds if modified
  const saveSnapshot = useCallback(throttle(async () => {
    try {
      if (editor.store.allRecords().length === 0) return;
      const records = editor.store.allRecords();
      const snapshot = JSON.stringify({ records });
      await api.put(`/workspaces/${currentWorkspaceSlug}/whiteboards/${boardId}`, {
        dataJson: snapshot
      });
    } catch (e) {
      console.warn("Failed to auto-save whiteboard", e);
    }
  }, 10000), [boardId, currentWorkspaceSlug, editor]);

  const flushChanges = useCallback(() => {
    if (pendingChanges.current.length === 0) return;
    
    // Batch all current pending changes into one payload
    // Actually tldraw .listen gives a whole 'changes' object which is already batched for that event.
    // But if we want to batch multiple events into one SignalR message:
    const batched = {
       added: {},
       updated: {},
       removed: {}
    } as any;

    pendingChanges.current.forEach(change => {
       Object.assign(batched.added, change.added);
       Object.assign(batched.updated, change.updated);
       Object.assign(batched.removed, change.removed);
    });

    sendWhiteboardUpdate(boardId, JSON.stringify(batched));
    pendingChanges.current = [];
    flushTimeout.current = null;
  }, [boardId]);

  const scheduleFlush = useCallback((changes: any) => {
    pendingChanges.current.push(changes);
    if (!flushTimeout.current) {
      flushTimeout.current = setTimeout(flushChanges, 30); // Faster batching (30ms)
    }
  }, [flushChanges]);

  useEffect(() => {
    let unsubscribeStore: () => void;

    const setupSync = async () => {
      await connectWhiteboard((data) => {
        try {
          const updates = JSON.parse(data.updatePayload);
          const editingShapeId = editor.getEditingShapeId();

          // Set flag to true to prevent echo
          isSyncing.current = true;
          
          editor.store.mergeRemoteChanges(() => {
            if (updates.added) {
              editor.store.put(Object.values(updates.added) as any[]);
            }
            if (updates.updated) {
               const up = Object.values(updates.updated)
                 .map((u: any) => u[1])
                 .filter((r: any) => r.id !== editingShapeId); // Don't overwrite what we are currently typing
               if (up.length > 0) {
                 editor.store.put(up);
               }
            }
            if (updates.removed) {
              const rm = Object.values(updates.removed)
                .map((u: any) => u.id)
                .filter((id: string) => id !== editingShapeId);
              if (rm.length > 0) {
                editor.store.remove(rm);
              }
            }
          });
          
        } catch (e) {
          console.error("Sync error", e);
        } finally {
          isSyncing.current = false;
        }
      }, (data) => {
        // Handle remote renames
        if (data.boardId === boardId && onRemoteRename) {
           onRemoteRename(data.newTitle);
        }
      });
      
      await joinWhiteboard(boardId);

      // Listen to Tldraw document changes
      unsubscribeStore = editor.store.listen((update: any) => {
        if (isSyncing.current) return;
        if (update.source !== 'user') return;

        scheduleFlush(update.changes);
        saveSnapshot(); // trigger auto-save
      }, { scope: 'document' }); // Only document changes (exclude ephemeral UI changes like selection)
    };

    setupSync();

    return () => {
      if (unsubscribeStore) unsubscribeStore();
      leaveWhiteboard(boardId);
      saveSnapshot.flush();
    };
  }, [boardId, editor, saveSnapshot]);

  // Synchronize theme
  const { theme } = useTheme();
  useEffect(() => {
    editor.user.updateUserPreferences({ colorScheme: theme === 'dark' ? 'dark' : 'light' });
  }, [editor, theme]);

  return null;
}

export default function WhiteboardRoom() {
  const params = useParams();
  const boardId = params.boardId as string;
  const { currentWorkspace } = useWorkspaceStore();
  const { theme } = useTheme();
  const [board, setBoard] = useState<{ id: string, title: string, dataJson: string } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  
  useEffect(() => {
    if (!currentWorkspace?.slug || !boardId) return;

    const fetchBoard = async () => {
      try {
        const res = await api.get(`/workspaces/${currentWorkspace.slug}/whiteboards/${boardId}`);
        setBoard(res.data);
        
        // Load existing data
        if (res.data.dataJson && res.data.dataJson !== "{}") {
          try {
            const parsed = JSON.parse(res.data.dataJson);
            if (parsed.records && Array.isArray(parsed.records)) {
              store.put(parsed.records, 'initialize');
            }
          } catch(e) {
             console.error("Error parsing board data");
          }
        }
      } catch (error) {
        toast.error("Board not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();

    return () => {
      // Cleanup happen via socket.ts disconnect/stop logic in WhiteboardSync cleanup
    };
  }, [currentWorkspace?.slug, boardId, store]);

  const handleRename = async () => {
    if (!currentWorkspace || !board || !newTitle.trim()) {
      setIsRenaming(false);
      return;
    }
    try {
      const updatedTitle = newTitle.trim();
      await api.put(`/workspaces/${currentWorkspace.slug}/whiteboards/${boardId}`, {
        title: updatedTitle
      });
      setBoard({ ...board, title: updatedTitle });
      
      // Update others in real-time
      const { sendWhiteboardRename } = await import("@/lib/socket");
      sendWhiteboardRename(boardId, updatedTitle);

      toast.success("Renamed successfully");
    } catch (e) {
      toast.error("Failed to rename");
    } finally {
      setIsRenaming(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 bg-brand-500 rounded-full"></div> Loading Board...</div></div>;
  }

  if (!board || !currentWorkspace) {
    return <div className="p-8">Board not found</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] xl:h-[calc(100vh-72px)] flex flex-col pt-0 overflow-hidden">
      <div className="flex-none flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <Link href="/whiteboards" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800 dark:hover:text-white transition">
           <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <span className="bg-brand-50 text-brand-600 dark:bg-brand-900/20 px-2 py-1 rounded text-xs font-bold font-mono flex-none">Tldraw</span>
        {isRenaming ? (
          <input
            autoFocus
            type="text"
            className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1 outline-none"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
          />
        ) : (
          <h1 
            className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
            onClick={() => {
              setNewTitle(board.title);
              setIsRenaming(true);
            }}
            title="Click to rename"
          >
            {board.title}
          </h1>
        )}
        <div className="ml-auto">
            <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Multiplayer Active
            </span>
        </div>
      </div>
      
      <div className="relative flex-1 bg-white dark:bg-gray-900" style={{ zIndex: 0 }}>
        <div className="absolute inset-0">
          <Tldraw store={store} inferDarkMode>
            <WhiteboardSync 
              boardId={boardId} 
              currentWorkspaceSlug={currentWorkspace.slug} 
              onRemoteRename={(newTitle) => setBoard(prev => prev ? { ...prev, title: newTitle } : null)}
            />
          </Tldraw>
        </div>
      </div>
    </div>
  );
}
