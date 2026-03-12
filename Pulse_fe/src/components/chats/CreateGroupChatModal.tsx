"use client";
import React, { useState, useRef, useEffect } from "react";
import { WorkspaceMember } from "@/types/roles";
import { chatService } from "@/services/chatService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  onCreated: (channelId: string) => void;
  user: any;
  slug: string;
}

export default function CreateGroupChatModal({ isOpen, onClose, members, onCreated, user, slug }: Props) {
  const [name, setName] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const participantInputRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Only show other members to select from
  const selectableMembers = members.filter(m => m.userId !== user?.id);

  const toggleParticipant = (id: string) => {
    setParticipantIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) return setError("Group name is required");
    if (participantIds.length === 0) return setError("Select at least one member");
    
    setCreating(true);
    try {
      const newChannel = await chatService.createChannel(slug, {
        name,
        type: 1, // 1 is Group
        memberIds: participantIds
      });
      onCreated(newChannel.id);
      onClose();
      // Reset
      setName("");
      setParticipantIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to create group chat");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) { 
        setName(""); 
        setParticipantIds([]); 
        setError(""); 
        setShowParticipantPicker(false);
        setParticipantSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[90vh] overflow-visible flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Group Chat</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Product Team" 
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
            />
        </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Members *</label>
            <div 
              onClick={() => {
                setShowParticipantPicker(!showParticipantPicker);
                if (!showParticipantPicker) setTimeout(() => participantInputRef.current?.focus(), 100);
              }}
              className="w-full min-h-[40px] px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer hover:border-brand-500 transition-colors flex flex-wrap gap-2 items-center"
            >
              {participantIds.length > 0 ? (
                participantIds.map((id) => {
                  const m = selectableMembers.find(x => x.userId === id);
                  if (!m) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md mb-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          `${m.firstName?.charAt(0)}${m.lastName?.charAt(0)}`
                        )}
                      </div>
                      <span className="text-xs font-medium">{m.firstName} {m.lastName}</span>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toggleParticipant(id); 
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )
                })
              ) : (
                <span className="text-gray-400 flex-1">Select members</span>
              )}
              <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showParticipantPicker ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {showParticipantPicker && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={participantInputRef}
                      type="text"
                      placeholder="Search members..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-transparent rounded-md focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {selectableMembers.filter(m => 
                    `${m.firstName} ${m.lastName}`.toLowerCase().includes(participantSearch.toLowerCase()) || 
                    m.email.toLowerCase().includes(participantSearch.toLowerCase())
                  ).map((m) => {
                    const isSelected = participantIds.includes(m.userId);
                    return (
                      <button
                        key={m.userId}
                        onClick={() => { toggleParticipant(m.userId); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${isSelected ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-white"}`}>
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                  {selectableMembers.filter(m => 
                    `${m.firstName} ${m.lastName}`.toLowerCase().includes(participantSearch.toLowerCase()) || 
                    m.email.toLowerCase().includes(participantSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">No members found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
          <button onClick={handleCreate} disabled={creating || !name.trim() || participantIds.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
            {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
