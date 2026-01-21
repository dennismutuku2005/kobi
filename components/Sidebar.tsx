'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Folder, ChevronRight, ChevronDown, Plus, Search, History, Settings,
  Archive, Download, Upload, FolderPlus, Box, Code, Variable,
  PanelLeftClose, PanelLeft, Terminal, FilePlus, FolderOpen, Save,
  X, MoreHorizontal
} from 'lucide-react';

export const Sidebar = () => {
  const {
    currentFile,
    hasUnsavedChanges,
    activeRequestId,
    setActiveRequestId,
    createRequest,
    viewMode,
    setViewMode,
    saveFile,
    closeFile,
    showContextMenu,
    updateRequest,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleFolderCollapse,
    createFolder,
    moveRequestToFolder,
    setShowBottomPanel,
    importPostmanCollection,
    createNewFile,
    openFile
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postmanInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // Listen for rename events
  useEffect(() => {
    const handleRename = (e: CustomEvent<{ id: string }>) => {
      if (!currentFile) return;
      const request = currentFile.requests.find(r => r.id === e.detail.id);
      if (request) {
        setRenamingId(e.detail.id);
        setRenameValue(request.name);
      }
    };

    window.addEventListener('rename-request', handleRename as EventListener);
    return () => window.removeEventListener('rename-request', handleRename as EventListener);
  }, [currentFile]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    if (showNewFolderInput && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [showNewFolderInput]);

  const handleNewFile = () => {
    const name = prompt('Enter file name:', 'My API Collection');
    if (name?.trim()) {
      createNewFile(name.trim());
    }
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      openFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleImportPostman = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      importPostmanCollection(e.target.files[0]);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, requestId: string) => {
    e.dataTransfer.setData('requestId', requestId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData('requestId');
    if (requestId) {
      moveRequestToFolder(requestId, folderId);
    }
    setDragOverFolderId(null);
  };

  if (!currentFile) {
    // Minimal sidebar when no file is open
    return (
      <aside className="sidebar no-file">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">K</div>
            <span className="logo-name">Kobi</span>
          </div>
        </div>

        <div className="no-file-actions">
          <button className="action-btn" onClick={handleNewFile}>
            <FilePlus size={18} />
            <span>New File</span>
          </button>
          <button className="action-btn" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen size={18} />
            <span>Open File</span>
          </button>
          <button className="action-btn" onClick={() => setViewMode('history')}>
            <History size={18} />
            <span>History</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.kobi"
          onChange={handleOpenFile}
          style={{ display: 'none' }}
        />

        <style jsx>{`
                    .sidebar.no-file {
                        width: var(--sidebar-width);
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        background: var(--bg-secondary);
                        border-right: 1px solid var(--border-primary);
                    }

                    .sidebar-header {
                        padding: 16px;
                        border-bottom: 1px solid var(--border-secondary);
                    }

                    .logo {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .logo-icon {
                        width: 28px;
                        height: 28px;
                        background: var(--primary);
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 14px;
                        color: white;
                    }

                    .logo-name {
                        font-weight: 600;
                        font-size: 16px;
                    }

                    .no-file-actions {
                        padding: 16px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .action-btn {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: var(--bg-tertiary);
                        border: 1px solid var(--border-primary);
                        border-radius: var(--radius-md);
                        font-size: 13px;
                        color: var(--text-secondary);
                        text-align: left;
                    }

                    .action-btn:hover {
                        background: var(--primary-muted);
                        border-color: var(--primary);
                        color: var(--text-primary);
                    }
                `}</style>
      </aside>
    );
  }

  const visibleRequests = currentFile.requests.filter(r => !r.isArchived);
  const filteredRequests = searchQuery
    ? visibleRequests.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase()))
    : visibleRequests;

  const folders = currentFile.folders;
  const rootRequests = filteredRequests.filter(r => !r.folderId);
  const getRequestsByFolder = (folderId: string) => filteredRequests.filter(r => r.folderId === folderId);

  const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;

  const handleContextMenu = (e: React.MouseEvent, requestId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, requestId || null, requestId ? 'request-list' : 'sidebar');
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      updateRequest(id, { name: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const handleNewFolderSubmit = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
    }
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  // Collapsed sidebar
  if (sidebarCollapsed) {
    return (
      <aside className="sidebar collapsed">
        <button className="expand-btn" onClick={() => setSidebarCollapsed(false)} title="Expand">
          <PanelLeft size={18} />
        </button>
        <div className="collapsed-nav">
          <button
            className={`nav-icon ${viewMode === 'collections' ? 'active' : ''}`}
            onClick={() => setViewMode('collections')}
            title="Collections"
          >
            <Folder size={18} />
          </button>
          <button
            className={`nav-icon ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
            title="History"
          >
            <History size={18} />
          </button>
          <button
            className={`nav-icon ${viewMode === 'environments' ? 'active' : ''}`}
            onClick={() => setViewMode('environments')}
            title="Environments"
          >
            <Variable size={18} />
          </button>
          <button
            className={`nav-icon ${viewMode === 'codegen' ? 'active' : ''}`}
            onClick={() => setViewMode('codegen')}
            title="Code"
          >
            <Code size={18} />
          </button>
        </div>
        <div className="collapsed-footer">
          <button
            className="nav-icon"
            onClick={saveFile}
            title={hasUnsavedChanges ? 'Save (unsaved changes)' : 'Save'}
          >
            <Save size={18} />
            {hasUnsavedChanges && <span className="unsaved-dot" />}
          </button>
          <button
            className={`nav-icon ${viewMode === 'settings' ? 'active' : ''}`}
            onClick={() => setViewMode('settings')}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <style jsx>{`
                    .sidebar.collapsed {
                        width: 52px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 8px 0;
                        background: var(--bg-secondary);
                        border-right: 1px solid var(--border-primary);
                    }

                    .expand-btn {
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: var(--radius-md);
                        color: var(--text-secondary);
                        margin-bottom: 8px;
                    }

                    .expand-btn:hover {
                        background: var(--bg-tertiary);
                        color: var(--text-primary);
                    }

                    .collapsed-nav {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding: 8px 0;
                        border-top: 1px solid var(--border-secondary);
                    }

                    .collapsed-footer {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding-top: 8px;
                        border-top: 1px solid var(--border-secondary);
                    }

                    .nav-icon {
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: var(--radius-md);
                        color: var(--text-secondary);
                        position: relative;
                    }

                    .nav-icon:hover {
                        background: var(--bg-tertiary);
                        color: var(--text-primary);
                    }

                    .nav-icon.active {
                        background: var(--primary-muted);
                        color: var(--primary);
                    }

                    .unsaved-dot {
                        position: absolute;
                        top: 6px;
                        right: 6px;
                        width: 6px;
                        height: 6px;
                        background: var(--warning);
                        border-radius: 50%;
                    }
                `}</style>
      </aside>
    );
  }

  return (
    <aside className="sidebar" onContextMenu={(e) => handleContextMenu(e)}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="file-info">
          <span className="file-name truncate">{currentFile.name}</span>
          {hasUnsavedChanges && <span className="unsaved-indicator">●</span>}
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={saveFile} title="Save (Ctrl+S)">
            <Save size={14} />
          </button>
          <button className="btn-icon" onClick={closeFile} title="Close file">
            <X size={14} />
          </button>
          <button className="btn-icon" onClick={() => setSidebarCollapsed(true)} title="Collapse">
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`nav-btn ${viewMode === 'collections' ? 'active' : ''}`}
          onClick={() => setViewMode('collections')}
        >
          <Folder size={16} />
          <span>Collections</span>
          <span className="count">{visibleRequests.length}</span>
        </button>
        <button
          className={`nav-btn ${viewMode === 'history' ? 'active' : ''}`}
          onClick={() => setViewMode('history')}
        >
          <History size={16} />
          <span>History</span>
        </button>
        <button
          className={`nav-btn ${viewMode === 'environments' ? 'active' : ''}`}
          onClick={() => setViewMode('environments')}
        >
          <Variable size={16} />
          <span>Envs</span>
        </button>
        <button
          className={`nav-btn ${viewMode === 'codegen' ? 'active' : ''}`}
          onClick={() => setViewMode('codegen')}
        >
          <Code size={16} />
          <span>Code</span>
        </button>
      </nav>

      {/* Search */}
      {viewMode === 'collections' && (
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className="sidebar-content"
        onDragOver={(e) => handleDragOver(e, null)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
      >
        {viewMode === 'collections' && (
          <>
            {/* New Folder Input */}
            {showNewFolderInput && (
              <div className="new-folder-input">
                <FolderPlus size={14} />
                <input
                  ref={newFolderInputRef}
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={handleNewFolderSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNewFolderSubmit();
                    if (e.key === 'Escape') {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }
                  }}
                />
              </div>
            )}

            {/* Folders */}
            {folders.map(folder => {
              const folderRequests = getRequestsByFolder(folder.id);
              const isCollapsed = folder.collapsed;
              const isDragOver = dragOverFolderId === folder.id;

              return (
                <div key={folder.id} className="folder-group">
                  <div
                    className={`tree-item folder-item ${isDragOver ? 'drag-over' : ''}`}
                    onClick={() => toggleFolderCollapse(folder.id)}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    {isCollapsed ? (
                      <ChevronRight size={14} className="chevron" />
                    ) : (
                      <ChevronDown size={14} className="chevron" />
                    )}
                    <Folder size={14} />
                    <span className="folder-name truncate">{folder.name}</span>
                    <span className="count">{folderRequests.length}</span>
                  </div>
                  {!isCollapsed && (
                    <div className="folder-children">
                      {folderRequests.map(req => (
                        <div
                          key={req.id}
                          className={`tree-item request-item ${activeRequestId === req.id ? 'active' : ''}`}
                          onClick={() => setActiveRequestId(req.id)}
                          onContextMenu={(e) => handleContextMenu(e, req.id)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, req.id)}
                        >
                          <span className={`method-tag ${getMethodClass(req.method)}`}>
                            {req.method.substring(0, 3)}
                          </span>
                          {renamingId === req.id ? (
                            <input
                              ref={renameInputRef}
                              className="rename-input"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleRenameSubmit(req.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(req.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="request-name truncate">{req.name}</span>
                          )}
                        </div>
                      ))}
                      {folderRequests.length === 0 && (
                        <div className="folder-empty">
                          Drop requests here
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Requests */}
            {rootRequests.map(req => (
              <div
                key={req.id}
                className={`tree-item request-item ${activeRequestId === req.id ? 'active' : ''}`}
                onClick={() => setActiveRequestId(req.id)}
                onContextMenu={(e) => handleContextMenu(e, req.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, req.id)}
              >
                <span className={`method-tag ${getMethodClass(req.method)}`}>
                  {req.method.substring(0, 3)}
                </span>
                {renamingId === req.id ? (
                  <input
                    ref={renameInputRef}
                    className="rename-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(req.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(req.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="request-name truncate">{req.name}</span>
                )}
              </div>
            ))}

            {/* Empty State */}
            {filteredRequests.length === 0 && folders.length === 0 && (
              <div className="empty-state-small">
                <Box size={24} />
                <p>{searchQuery ? 'No matching requests' : 'No requests yet'}</p>
                <button className="btn btn-ghost" onClick={() => createRequest()}>
                  <Plus size={14} />
                  Create Request
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {viewMode === 'collections' && (
        <div className="sidebar-footer">
          <div className="footer-row">
            <button className="btn btn-primary" onClick={() => createRequest()}>
              <Plus size={16} />
              <span>New Request</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNewFolderInput(true)} title="New Folder">
              <FolderPlus size={16} />
            </button>
          </div>
          <div className="footer-row">
            <button className="btn btn-secondary" onClick={saveFile} title="Save">
              <Download size={14} />
              <span>Save</span>
            </button>
            <button className="btn btn-secondary" onClick={() => postmanInputRef.current?.click()} title="Import">
              <Upload size={14} />
              <span>Import</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".json,.kobi"
            onChange={handleOpenFile}
          />
          <input
            ref={postmanInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleImportPostman}
          />
        </div>
      )}

      <style jsx>{`
                .sidebar {
                    width: var(--sidebar-width);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border-primary);
                    user-select: none;
                }

                .sidebar-header {
                    padding: 12px 12px 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--border-secondary);
                    min-height: 48px;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                    flex: 1;
                }

                .file-name {
                    font-weight: 600;
                    font-size: 13px;
                }

                .unsaved-indicator {
                    color: var(--warning);
                    font-size: 16px;
                }

                .header-actions {
                    display: flex;
                    gap: 4px;
                }

                .sidebar-nav {
                    display: flex;
                    padding: 8px;
                    gap: 4px;
                    border-bottom: 1px solid var(--border-secondary);
                }

                .nav-btn {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 4px;
                    border-radius: var(--radius-md);
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    position: relative;
                }

                .nav-btn:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .nav-btn.active {
                    background: var(--primary-muted);
                    color: var(--primary);
                }

                .nav-btn .count {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    font-size: 9px;
                    background: var(--bg-tertiary);
                    padding: 0 4px;
                    border-radius: 8px;
                    color: var(--text-muted);
                }

                .sidebar-search {
                    position: relative;
                    padding: 8px 12px;
                }

                .sidebar-search .search-icon {
                    position: absolute;
                    left: 22px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .sidebar-search input {
                    width: 100%;
                    padding: 6px 28px 6px 32px;
                    background: var(--bg-tertiary);
                    border: 1px solid transparent;
                    font-size: 12px;
                    height: 32px;
                }

                .sidebar-search input:focus {
                    border-color: var(--border-primary);
                }

                .search-clear {
                    position: absolute;
                    right: 22px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    font-size: 16px;
                    line-height: 1;
                }

                .search-clear:hover {
                    color: var(--text-primary);
                }

                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .new-folder-input {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    margin-bottom: 8px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }

                .new-folder-input input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 0;
                    font-size: 13px;
                }

                .folder-group {
                    margin-bottom: 2px;
                }

                .tree-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 13px;
                    color: var(--text-secondary);
                    transition: var(--transition-fast);
                }

                .tree-item:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .tree-item.active {
                    background: var(--primary-muted);
                    color: var(--primary);
                }

                .tree-item.drag-over {
                    background: var(--primary-muted);
                    border: 1px dashed var(--primary);
                }

                .folder-item {
                    font-weight: 500;
                }

                .folder-name {
                    flex: 1;
                    min-width: 0;
                }

                .folder-item .count {
                    font-size: 10px;
                    color: var(--text-muted);
                    background: var(--bg-tertiary);
                    padding: 1px 6px;
                    border-radius: 8px;
                }

                .folder-children {
                    margin-left: 16px;
                    padding-left: 8px;
                    border-left: 1px solid var(--border-secondary);
                }

                .folder-empty {
                    padding: 8px;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-style: italic;
                }

                .method-tag {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    font-weight: 600;
                    min-width: 26px;
                    text-align: center;
                }

                .method-get { color: var(--success); }
                .method-post { color: var(--warning); }
                .method-put { color: var(--info); }
                .method-patch { color: #A855F7; }
                .method-delete { color: var(--error); }
                .method-head, .method-options { color: var(--text-muted); }

                .request-name {
                    flex: 1;
                    min-width: 0;
                }

                .rename-input {
                    flex: 1;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--primary);
                    padding: 2px 6px;
                    font-size: 13px;
                    border-radius: var(--radius-sm);
                }

                .empty-state-small {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 32px 16px;
                    color: var(--text-muted);
                    text-align: center;
                }

                .empty-state-small p {
                    font-size: 12px;
                }

                .sidebar-footer {
                    padding: 12px;
                    border-top: 1px solid var(--border-secondary);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .footer-row {
                    display: flex;
                    gap: 8px;
                }

                .footer-row .btn-primary {
                    flex: 1;
                }

                .footer-row .btn-secondary {
                    flex: 1;
                }

                .chevron {
                    color: var(--text-muted);
                    flex-shrink: 0;
                }
            `}</style>
    </aside>
  );
};
