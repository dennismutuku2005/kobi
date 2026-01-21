'use client';

import React, { useRef } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
    FilePlus, FolderOpen, Clock, Upload, Keyboard,
    Database, Shield, Zap, Github, ExternalLink
} from 'lucide-react';

export const WelcomeView = () => {
    const { createNewFile, openFile, recentFiles, setViewMode, history } = useWorkspace();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="welcome-view">
            <div className="welcome-container">
                {/* Logo and Title */}
                <div className="welcome-header">
                    <div className="logo">
                        <span className="logo-text">K</span>
                    </div>
                    <h1>Kobi</h1>
                    <p className="tagline">The Offline-First API Client</p>
                </div>

                {/* Actions */}
                <div className="welcome-actions">
                    <div className="action-card primary" onClick={handleNewFile}>
                        <FilePlus size={24} />
                        <div className="action-info">
                            <h3>New File</h3>
                            <p>Create a new API collection</p>
                        </div>
                        <span className="shortcut">
                            <span className="kbd">Ctrl</span>
                            <span>+</span>
                            <span className="kbd">N</span>
                        </span>
                    </div>

                    <div className="action-card" onClick={() => fileInputRef.current?.click()}>
                        <FolderOpen size={24} />
                        <div className="action-info">
                            <h3>Open File</h3>
                            <p>Open a .kobi.json collection</p>
                        </div>
                        <span className="shortcut">
                            <span className="kbd">Ctrl</span>
                            <span>+</span>
                            <span className="kbd">O</span>
                        </span>
                    </div>

                    <div className="action-card" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={24} />
                        <div className="action-info">
                            <h3>Import Postman</h3>
                            <p>Import from Postman collection</p>
                        </div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.kobi"
                    onChange={handleOpenFile}
                    style={{ display: 'none' }}
                />

                {/* Recent Files */}
                {recentFiles.length > 0 && (
                    <div className="recent-section">
                        <h4>Recent Files</h4>
                        <div className="recent-list">
                            {recentFiles.slice(0, 5).map((file, idx) => (
                                <button
                                    key={idx}
                                    className="recent-item"
                                    onClick={() => {
                                        // For now, just show open dialog
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <Database size={16} />
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-date">
                                        {new Date(file.lastOpened).toLocaleDateString()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* History shortcut */}
                {history.length > 0 && (
                    <button className="history-link" onClick={() => setViewMode('history')}>
                        <Clock size={16} />
                        <span>View {history.length} requests in history</span>
                    </button>
                )}

                {/* Features */}
                <div className="features-section">
                    <div className="feature">
                        <Shield size={20} />
                        <div>
                            <h5>Privacy First</h5>
                            <p>All data stays on your device</p>
                        </div>
                    </div>
                    <div className="feature">
                        <Zap size={20} />
                        <div>
                            <h5>Fast & Lightweight</h5>
                            <p>No account required</p>
                        </div>
                    </div>
                    <div className="feature">
                        <ExternalLink size={20} />
                        <div>
                            <h5>Postman Compatible</h5>
                            <p>Import & export collections</p>
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="shortcuts-section">
                    <h4>
                        <Keyboard size={16} />
                        Keyboard Shortcuts
                    </h4>
                    <div className="shortcuts-grid">
                        <div className="shortcut-row">
                            <span className="keys">
                                <span className="kbd">Ctrl</span>+<span className="kbd">N</span>
                            </span>
                            <span>New file/request</span>
                        </div>
                        <div className="shortcut-row">
                            <span className="keys">
                                <span className="kbd">Ctrl</span>+<span className="kbd">S</span>
                            </span>
                            <span>Save file</span>
                        </div>
                        <div className="shortcut-row">
                            <span className="keys">
                                <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span>
                            </span>
                            <span>Send request</span>
                        </div>
                        <div className="shortcut-row">
                            <span className="keys">
                                <span className="kbd">Ctrl</span>+<span className="kbd">W</span>
                            </span>
                            <span>Close tab</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="welcome-footer">
                    <p>Version 2.0.0</p>
                </div>
            </div>

            <style jsx>{`
                .welcome-view {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-primary);
                    padding: 40px;
                    overflow: auto;
                }

                .welcome-container {
                    max-width: 600px;
                    width: 100%;
                }

                .welcome-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .logo {
                    width: 80px;
                    height: 80px;
                    background: var(--primary);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }

                .logo-text {
                    font-size: 40px;
                    font-weight: 800;
                    color: white;
                }

                .welcome-header h1 {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .tagline {
                    font-size: 16px;
                    color: var(--primary);
                    font-weight: 500;
                }

                .welcome-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .action-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px 24px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }

                .action-card:hover {
                    border-color: var(--primary);
                    background: var(--bg-tertiary);
                }

                .action-card.primary {
                    border-color: var(--primary);
                    background: var(--primary-muted);
                }

                .action-card.primary:hover {
                    background: rgba(255, 108, 55, 0.2);
                }

                .action-card > svg {
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .action-info {
                    flex: 1;
                }

                .action-info h3 {
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .action-info p {
                    font-size: 13px;
                    color: var(--text-muted);
                }

                .shortcut {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .recent-section {
                    margin-bottom: 32px;
                }

                .recent-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .recent-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .recent-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid transparent;
                    border-radius: var(--radius-md);
                    text-align: left;
                    color: var(--text-secondary);
                }

                .recent-item:hover {
                    background: var(--bg-tertiary);
                    border-color: var(--border-primary);
                    color: var(--text-primary);
                }

                .recent-item svg {
                    color: var(--text-muted);
                }

                .file-name {
                    flex: 1;
                    font-size: 13px;
                }

                .file-date {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .history-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    color: var(--text-secondary);
                    font-size: 13px;
                    margin-bottom: 32px;
                }

                .history-link:hover {
                    color: var(--primary);
                }

                .features-section {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .feature {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 20px 16px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    text-align: center;
                }

                .feature svg {
                    color: var(--primary);
                }

                .feature h5 {
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .feature p {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .shortcuts-section {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    margin-bottom: 32px;
                }

                .shortcuts-section h4 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }

                .shortcuts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .shortcut-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .keys {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .welcome-footer {
                    text-align: center;
                }

                .welcome-footer p {
                    font-size: 12px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};
