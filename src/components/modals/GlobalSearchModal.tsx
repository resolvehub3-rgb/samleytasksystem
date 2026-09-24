import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Folder, CheckSquare, Users, FileText, ArrowRight } from 'lucide-react';
import { Project, Task, Client, ProjectNote } from '../../types/database';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  notes: ProjectNote[];
  onSelectProject: (projectId: string) => void;
  onSelectTask: (task: Task) => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  tasks,
  clients,
  notes,
  onSelectProject,
  onSelectTask,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { projects: [], tasks: [], clients: [], notes: [] };

    return {
      projects: projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      ),
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      ),
      clients: clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      ),
      notes: notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      ),
    };
  }, [query, projects, tasks, clients, notes]);

  if (!isOpen) return null;

  const totalResults =
    filteredResults.projects.length +
    filteredResults.tasks.length +
    filteredResults.clients.length +
    filteredResults.notes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-[#0B5D3B]" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, clients, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-xs">
          {!query.trim() ? (
            <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
              <p className="font-medium text-xs">Search your real workspace</p>
              <p className="text-[11px] mt-1">
                Type keywords to find projects, tasks, partner notes, or clients
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
              <p className="text-xs">No records matched &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects */}
              {filteredResults.projects.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                    Projects ({filteredResults.projects.length})
                  </span>
                  <div className="space-y-1">
                    {filteredResults.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-[#0B5D3B]" />
                          <div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 ml-2">
                              {p.status}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B5D3B] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {filteredResults.tasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                    Tasks ({filteredResults.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {filteredResults.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectTask(t);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#D9A400]" />
                          <div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                              {t.title}
                            </span>
                            <span className="text-[11px] text-neutral-400 ml-2">
                              {t.status}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D9A400] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {filteredResults.clients.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                    Clients ({filteredResults.clients.length})
                  </span>
                  <div className="space-y-1">
                    {filteredResults.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigateTab('clients');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#0B5D3B]" />
                          <div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                              {c.name}
                            </span>
                            {c.company && (
                              <span className="text-[11px] text-neutral-400 ml-2">
                                ({c.company})
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B5D3B] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {filteredResults.notes.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                    Notes ({filteredResults.notes.length})
                  </span>
                  <div className="space-y-1">
                    {filteredResults.notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onSelectProject(n.project_id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {n.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
