'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Terminal, Trash2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const ConsolePanel = () => {
    const { consoleLogs, clearConsoleLogs, setShowBottomPanel } = useWorkspace();

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={14} />;
            case 'error': return <AlertCircle size={14} />;
            case 'warn': return <AlertTriangle size={14} />;
            default: return <Info size={14} />;
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="console-panel">
            {/* Header */}
            <div className="console-header">
                <div className="header-left">
                    <Terminal size={14} />
                    <span>Console</span>
                    <span className="log-count">{consoleLogs.length}</span>
                </div>
                <div className="header-actions">
                    <button
                        className="action-btn"
                        onClick={clearConsoleLogs}
                        disabled={consoleLogs.length === 0}
                        title="Clear console"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => setShowBottomPanel(false)}
                        title="Close console"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div className="console-logs">
                {consoleLogs.length === 0 ? (
                    <div className="empty-console">
                        <Terminal size={24} />
                        <p>Console output will appear here</p>
                    </div>
                ) : (
                    consoleLogs.map(log => (
                        <div key={log.id} className={`log-entry log-${log.type}`}>
                            <span className="log-icon">{getLogIcon(log.type)}</span>
                            <span className="log-time">{formatTime(log.timestamp)}</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .console-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-secondary);
                }

                .console-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--bg-tertiary);
                    border-bottom: 1px solid var(--border-secondary);
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .log-count {
                    background: var(--bg-secondary);
                    padding: 1px 6px;
                    border-radius: 8px;
                    font-size: 10px;
                    color: var(--text-muted);
                }

                .header-actions {
                    display: flex;
                    gap: 4px;
                }

                .action-btn {
                    padding: 4px;
                    border-radius: var(--radius-sm);
                    color: var(--text-muted);
                }

                .action-btn:hover:not(:disabled) {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .action-btn:disabled {
                    opacity: 0.5;
                }

                .console-logs {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .empty-console {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--text-muted);
                }

                .empty-console p {
                    font-size: 12px;
                }

                .log-entry {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 4px 12px;
                    font-size: 12px;
                    font-family: var(--font-mono);
                    border-bottom: 1px solid var(--border-secondary);
                }

                .log-entry:hover {
                    background: var(--bg-tertiary);
                }

                .log-icon {
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                .log-info .log-icon { color: var(--info); }
                .log-success .log-icon { color: var(--success); }
                .log-warn .log-icon { color: var(--warning); }
                .log-error .log-icon { color: var(--error); }

                .log-time {
                    color: var(--text-muted);
                    font-size: 10px;
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                .log-message {
                    color: var(--text-secondary);
                    word-break: break-word;
                }

                .log-success .log-message { color: var(--success); }
                .log-error .log-message { color: var(--error); }
                .log-warn .log-message { color: var(--warning); }
            `}</style>
        </div>
    );
};
