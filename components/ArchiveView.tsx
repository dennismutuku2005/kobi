'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Archive, RefreshCw, Trash2, ChevronRight, Box } from 'lucide-react';

export const ArchiveView = () => {
  const { workspace, restoreRequest, deleteRequest, setActiveRequestId, setViewMode } = useWorkspace();

  const archivedRequests = workspace.requests.filter(r => r.isArchived);

  const getMethodClass = (method: string) => `method-badge method-badge-${method.toLowerCase()}`;

  if (archivedRequests.length === 0) {
    return (
      <div className="archive-view empty">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Archive size={28} />
          </div>
          <h3>Archive is Empty</h3>
          <p>Archived requests will appear here. Right-click a request to archive it.</p>
        </div>

        <style jsx>{`
                    .archive-view.empty {
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div className="archive-view">
      <div className="archive-header">
        <div className="header-info">
          <h2>Archived Requests</h2>
          <p>{archivedRequests.length} requests</p>
        </div>
      </div>

      <div className="archive-list">
        {archivedRequests.map(req => (
          <div key={req.id} className="archive-item">
            <div className="item-main">
              <span className={getMethodClass(req.method)}>
                {req.method}
              </span>
              <div className="item-info">
                <span className="item-name">{req.name}</span>
                <span className="item-url mono truncate">{req.url || 'No URL'}</span>
              </div>
            </div>

            <div className="item-actions">
              <button
                className="btn btn-ghost"
                title="Restore"
                onClick={() => restoreRequest(req.id)}
              >
                <RefreshCw size={14} />
                Restore
              </button>
              <button
                className="btn-icon danger"
                title="Delete permanently"
                onClick={() => deleteRequest(req.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
                .archive-view {
                    height: 100%;
                    overflow-y: auto;
                    padding: 24px;
                }

                .archive-header {
                    margin-bottom: 24px;
                }

                .header-info h2 {
                    font-size: 20px;
                    margin-bottom: 4px;
                }

                .header-info p {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .archive-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .archive-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    transition: var(--transition-fast);
                }

                .archive-item:hover {
                    border-color: var(--border-focus);
                }

                .item-main {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                    flex: 1;
                }

                .item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .item-name {
                    font-size: 13px;
                    font-weight: 500;
                }

                .item-url {
                    font-size: 11px;
                    color: var(--text-muted);
                    max-width: 400px;
                }

                .item-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-icon.danger {
                    color: var(--text-secondary);
                }

                .btn-icon.danger:hover {
                    color: var(--error);
                    background: rgba(239, 68, 68, 0.1);
                }
            `}</style>
    </div>
  );
};
