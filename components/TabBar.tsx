'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { X, Circle, Plus } from 'lucide-react';

export const TabBar = () => {
    const {
        tabs,
        activeTabId,
        setActiveTab,
        closeTab,
        showContextMenu,
        currentFile,
        createRequest
    } = useWorkspace();

    const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;

    const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, tabId, 'tabs');
    };

    const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
        if (e.button === 1) {
            e.preventDefault();
            closeTab(tabId);
        }
    };

    if (!currentFile) return null;

    return (
        <div className="tab-bar">
            <div className="tabs-container">
                {tabs.map(tab => {
                    const request = currentFile.requests.find(r => r.id === tab.requestId);
                    const method = request?.method || tab.method;

                    return (
                        <div
                            key={tab.id}
                            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            onContextMenu={(e) => handleContextMenu(e, tab.id)}
                            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
                        >
                            <span className={`tab-method ${getMethodClass(method)}`}>
                                {method.substring(0, 3)}
                            </span>
                            <span className="tab-name truncate">
                                {request?.name || tab.name}
                            </span>
                            {tab.isDirty && (
                                <Circle size={6} className="dirty-indicator" fill="currentColor" />
                            )}
                            <button
                                className="tab-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                                title="Close (Ctrl+W)"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    );
                })}

                {/* New tab button */}
                <button
                    className="new-tab-btn"
                    onClick={() => createRequest()}
                    title="New Request (Ctrl+N)"
                >
                    <Plus size={14} />
                </button>
            </div>

            <style jsx>{`
                .tab-bar {
                    display: flex;
                    align-items: center;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                    height: 36px;
                    min-height: 36px;
                    max-height: 36px;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .tabs-container {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    overflow-x: auto;
                    scrollbar-width: none;
                }

                .tabs-container::-webkit-scrollbar {
                    display: none;
                }

                .tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 10px;
                    height: 100%;
                    min-width: 100px;
                    max-width: 160px;
                    border-right: 1px solid var(--border-secondary);
                    cursor: pointer;
                    transition: var(--transition-fast);
                    position: relative;
                    background: var(--bg-secondary);
                }

                .tab:hover {
                    background: var(--bg-tertiary);
                }

                .tab.active {
                    background: var(--bg-primary);
                }

                .tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--primary);
                }

                .tab-method {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    flex-shrink: 0;
                }

                .tab-name {
                    flex: 1;
                    font-size: 12px;
                    color: var(--text-secondary);
                    min-width: 0;
                }

                .tab.active .tab-name {
                    color: var(--text-primary);
                }

                .dirty-indicator {
                    color: var(--warning);
                    flex-shrink: 0;
                }

                .tab-close {
                    opacity: 0;
                    padding: 2px;
                    border-radius: 4px;
                    color: var(--text-muted);
                    transition: var(--transition-fast);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tab:hover .tab-close {
                    opacity: 1;
                }

                .tab-close:hover {
                    background: var(--bg-elevated);
                    color: var(--text-primary);
                }

                .new-tab-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    margin: 0 8px;
                    border-radius: var(--radius-md);
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .new-tab-btn:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                /* Method colors */
                .method-get { color: var(--success); }
                .method-post { color: var(--warning); }
                .method-put { color: var(--info); }
                .method-patch { color: #A855F7; }
                .method-delete { color: var(--error); }
                .method-head, .method-options { color: var(--text-muted); }
            `}</style>
        </div>
    );
};
