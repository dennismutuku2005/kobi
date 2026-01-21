'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
    Copy, Trash2, Edit2, FileText, FolderInput, Download, Plus, Send,
    Archive, Settings, History, Code, Terminal, Folder, Save, X
} from 'lucide-react';

export const ContextMenu = () => {
    const {
        contextMenu,
        hideContextMenu,
        currentFile,
        activeRequest,
        duplicateRequest,
        deleteRequest,
        archiveRequest,
        createRequest,
        setViewMode,
        saveFile,
        sendRequest,
        exportAsPostman,
        setShowBottomPanel,
        showBottomPanel
    } = useWorkspace();

    if (!contextMenu.visible) return null;

    const handleAction = (action: () => void) => {
        action();
        hideContextMenu();
    };

    const getMenuItems = () => {
        const { panelType, targetId } = contextMenu;

        // Request context menu
        if (panelType === 'request-list' && targetId) {
            return (
                <>
                    <MenuItem
                        icon={<Edit2 size={14} />}
                        label="Rename"
                        shortcut="F2"
                        onClick={() => handleAction(() => {
                            window.dispatchEvent(new CustomEvent('rename-request', { detail: { id: targetId } }));
                        })}
                    />
                    <MenuItem
                        icon={<Copy size={14} />}
                        label="Duplicate"
                        onClick={() => handleAction(() => duplicateRequest(targetId))}
                    />
                    <MenuItem
                        icon={<FolderInput size={14} />}
                        label="Move to Folder..."
                        onClick={() => handleAction(() => {
                            // For now, just alert - could implement folder picker
                            console.log('Move to folder');
                        })}
                    />
                    <Divider />
                    <MenuItem
                        icon={<Archive size={14} />}
                        label="Archive"
                        onClick={() => handleAction(() => archiveRequest(targetId))}
                    />
                    <MenuItem
                        icon={<Trash2 size={14} />}
                        label="Delete"
                        danger
                        onClick={() => handleAction(() => deleteRequest(targetId))}
                    />
                </>
            );
        }

        // Tab context menu
        if (panelType === 'tabs' && targetId) {
            return (
                <>
                    <MenuItem
                        icon={<X size={14} />}
                        label="Close Tab"
                        shortcut="Ctrl+W"
                        onClick={() => handleAction(() => {
                            // Close tab action - need to import closeTab
                        })}
                    />
                    <MenuItem
                        icon={<Copy size={14} />}
                        label="Duplicate Request"
                        onClick={() => handleAction(() => {
                            const tab = document.querySelector(`[data-tab-id="${targetId}"]`);
                            // Get request ID from tab and duplicate
                        })}
                    />
                </>
            );
        }

        // Response viewer menu
        if (panelType === 'response-viewer') {
            return (
                <>
                    <MenuItem
                        icon={<Copy size={14} />}
                        label="Copy Response"
                        onClick={() => handleAction(() => {
                            window.dispatchEvent(new Event('copy-response'));
                        })}
                    />
                    <MenuItem
                        icon={<FileText size={14} />}
                        label="Copy as JSON"
                        onClick={() => handleAction(() => {
                            window.dispatchEvent(new Event('copy-json'));
                        })}
                    />
                    <MenuItem
                        icon={<Download size={14} />}
                        label="Save Response"
                        onClick={() => handleAction(() => {
                            window.dispatchEvent(new Event('save-response'));
                        })}
                    />
                </>
            );
        }

        // Sidebar menu
        if (panelType === 'sidebar') {
            return (
                <>
                    <MenuItem
                        icon={<Plus size={14} />}
                        label="New Request"
                        shortcut="Ctrl+N"
                        onClick={() => handleAction(() => createRequest())}
                    />
                    <MenuItem
                        icon={<Folder size={14} />}
                        label="New Folder"
                        onClick={() => handleAction(() => {
                            // Trigger folder creation
                        })}
                    />
                    <Divider />
                    <MenuItem
                        icon={<Save size={14} />}
                        label="Save File"
                        shortcut="Ctrl+S"
                        onClick={() => handleAction(saveFile)}
                    />
                    <MenuItem
                        icon={<Download size={14} />}
                        label="Export as Postman"
                        onClick={() => handleAction(exportAsPostman)}
                    />
                </>
            );
        }

        // General context menu
        return (
            <>
                {currentFile && (
                    <>
                        <MenuItem
                            icon={<Plus size={14} />}
                            label="New Request"
                            shortcut="Ctrl+N"
                            onClick={() => handleAction(() => createRequest())}
                        />
                        {activeRequest && (
                            <MenuItem
                                icon={<Send size={14} />}
                                label="Send Request"
                                shortcut="Ctrl+Enter"
                                onClick={() => handleAction(sendRequest)}
                            />
                        )}
                        <Divider />
                    </>
                )}
                <MenuItem
                    icon={<History size={14} />}
                    label="History"
                    shortcut="Ctrl+H"
                    onClick={() => handleAction(() => setViewMode('history'))}
                />
                {currentFile && (
                    <MenuItem
                        icon={<Settings size={14} />}
                        label="Environments"
                        shortcut="Ctrl+E"
                        onClick={() => handleAction(() => setViewMode('environments'))}
                    />
                )}
                <MenuItem
                    icon={<Code size={14} />}
                    label="Code Generation"
                    shortcut="Ctrl+G"
                    onClick={() => handleAction(() => setViewMode('codegen'))}
                />
                <MenuItem
                    icon={<Terminal size={14} />}
                    label={showBottomPanel ? 'Hide Console' : 'Show Console'}
                    shortcut="Ctrl+`"
                    onClick={() => handleAction(() => setShowBottomPanel(!showBottomPanel))}
                />
                {currentFile && (
                    <>
                        <Divider />
                        <MenuItem
                            icon={<Save size={14} />}
                            label="Save"
                            shortcut="Ctrl+S"
                            onClick={() => handleAction(saveFile)}
                        />
                    </>
                )}
            </>
        );
    };

    // Position the menu within viewport bounds
    const menuStyle = {
        position: 'fixed' as const,
        left: Math.min(contextMenu.x, window.innerWidth - 220),
        top: Math.min(contextMenu.y, window.innerHeight - 300)
    };

    return (
        <>
            <div className="context-menu" style={menuStyle}>
                {getMenuItems()}
            </div>

            <style jsx>{`
                .context-menu {
                    min-width: 200px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    padding: 4px;
                    z-index: 1000;
                    box-shadow: var(--shadow-lg);
                    animation: fadeIn 0.1s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

const MenuItem = ({
    icon,
    label,
    shortcut,
    danger,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    danger?: boolean;
    onClick: () => void;
}) => (
    <button className={`context-menu-item ${danger ? 'danger' : ''}`} onClick={onClick}>
        {icon}
        <span className="label">{label}</span>
        {shortcut && <span className="context-menu-shortcut">{shortcut}</span>}

        <style jsx>{`
            .context-menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 8px 12px;
                font-size: 13px;
                color: var(--text-secondary);
                border-radius: var(--radius-md);
                text-align: left;
            }

            .context-menu-item:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .context-menu-item.danger {
                color: var(--error);
            }

            .context-menu-item.danger:hover {
                background: var(--error-muted);
            }

            .label {
                flex: 1;
            }

            .context-menu-shortcut {
                font-size: 11px;
                color: var(--text-muted);
                font-family: var(--font-mono);
            }
        `}</style>
    </button>
);

const Divider = () => (
    <div className="context-menu-divider">
        <style jsx>{`
            .context-menu-divider {
                height: 1px;
                background: var(--border-secondary);
                margin: 4px 0;
            }
        `}</style>
    </div>
);
