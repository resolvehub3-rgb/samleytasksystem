import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Search,
  Trash2,
  Download,
  FileText,
  Image,
  Folder,
} from 'lucide-react';
import { ProjectFile, Project } from '../types/database';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, formatBytes } from '../utils/formatters';
import { supabase } from '../lib/supabase';

interface FilesPageProps {
  files: ProjectFile[];
  projects: Project[];
  onUploadFile: (file: File, projectId?: string) => Promise<any>;
  onDeleteFile: (fileId: string) => Promise<any>;
}

export const FilesPage: React.FC<FilesPageProps> = ({
  files,
  projects,
  onUploadFile,
  onDeleteFile,
}) => {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    try {
      setUploading(true);
      await onUploadFile(
        list[0],
        selectedProject !== 'all' ? selectedProject : undefined
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (file: ProjectFile) => {
    try {
      const { data } = await supabase.storage
        .from(file.storage_bucket || 'workspace-files')
        .createSignedUrl(file.file_path, 60);

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL', err);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchSearch = f.file_name.toLowerCase().includes(search.toLowerCase());
    const matchProject = selectedProject === 'all' || f.project_id === selectedProject;
    return matchSearch && matchProject;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-[#0B5D3B]" />
            <span>Files &amp; Attachments ({files.length})</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cloud documents, design assets, and client specs stored in Supabase Storage
          </p>
        </div>

        <label className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input
            type="file"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
          />
        </div>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={FolderArchive}
          title={files.length === 0 ? 'No files uploaded yet' : 'No matching files'}
          description={
            files.length === 0
              ? 'Upload your contracts, wireframes, design mockups, and client requirements.'
              : 'Try clearing your search filters to find what you are looking for.'
          }
        />
      ) : (
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredFiles.map((file) => {
                  const isImage = file.file_type?.startsWith('image/');
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                        {isImage ? (
                          <Image className="w-4 h-4 text-[#0B5D3B]" />
                        ) : (
                          <FileText className="w-4 h-4 text-neutral-500" />
                        )}
                        <span className="truncate max-w-xs">{file.file_name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-300">
                        {file.project_id
                          ? projects.find((p) => p.id === file.project_id)?.name || 'Project'
                          : 'General Workspace'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-500 tabular-nums">
                        {formatBytes(file.file_size)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-300">
                        {file.uploader?.full_name || 'Partner'}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 tabular-nums">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1.5 text-neutral-400 hover:text-[#0B5D3B] transition-colors cursor-pointer"
                            title="Download / View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${file.file_name}?`)) {
                                onDeleteFile(file.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
