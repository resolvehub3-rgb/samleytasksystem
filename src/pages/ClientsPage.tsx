import React, { useState, useMemo } from 'react';
import {
  Users2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FolderGit2,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { Client, Project, ProjectRevenue } from '../types/database';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface ClientsPageProps {
  clients: Client[];
  projects: Project[];
  revenues: ProjectRevenue[];
  onOpenCreateClient: () => void;
  onDeleteClient: (clientId: string) => Promise<any>;
  onSelectProject: (projectId: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  projects,
  revenues,
  onOpenCreateClient,
  onDeleteClient,
  onSelectProject,
}) => {
  const { activeWorkspace } = useAuth();
  const currency = activeWorkspace?.currency || 'GHS';
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    });
  }, [clients, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#0B5D3B]" />
            <span>Clients ({clients.length})</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your client accounts, active contracts, and billing contact details
          </p>
        </div>

        <button
          onClick={onOpenCreateClient}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by client, company, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Users2}
          title={clients.length === 0 ? 'No clients added yet' : 'No clients found'}
          description={
            clients.length === 0
              ? 'Add your first client to link them to contracts, software deliverables, and incoming payments.'
              : 'Try searching with a different name or email.'
          }
          actionLabel={clients.length === 0 ? 'Add Client' : undefined}
          onAction={clients.length === 0 ? onOpenCreateClient : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const clientProjects = projects.filter((p) => p.client_id === client.id);
            const clientRevenues = revenues.filter((r) =>
              clientProjects.some((p) => p.id === r.project_id)
            );
            const totalInvoiced = clientRevenues.reduce(
              (acc, r) => acc + (Number(r.amount) || 0),
              0
            );

            return (
              <div
                key={client.id}
                className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs flex flex-col justify-between text-xs space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                          {client.company}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete client "${client.name}"?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 mt-3 text-neutral-600 dark:text-neutral-400">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}

                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Stats & Projects */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 font-medium">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#0B5D3B]" />
                      <span>{clientProjects.length} Projects</span>
                    </span>

                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatCurrency(totalInvoiced, currency)} Paid
                    </span>
                  </div>

                  {clientProjects.length > 0 && (
                    <div className="space-y-1">
                      {clientProjects.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectProject(p.id)}
                          className="p-1.5 rounded-md bg-neutral-50 dark:bg-neutral-900/40 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate cursor-pointer hover:text-[#0B5D3B]"
                        >
                          → {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
