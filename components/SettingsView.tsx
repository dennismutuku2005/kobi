'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Settings, Globe, Shield, Clock, Trash2, Download, Upload, Database,
  Info, Plus, X, Variable, Keyboard, Heart, ExternalLink, CheckCircle
} from 'lucide-react';

export const SettingsView = () => {
  const { currentFile, viewMode, saveFile, clearHistory, history } = useWorkspace();
  const [activeSection, setActiveSection] = useState('general');

  // Determine which section to show based on viewMode
  const effectiveSection = viewMode === 'environments' ? 'environments' : activeSection;

  const sections = [
    { id: 'general', label: 'General', icon: <Settings size={16} /> },
    { id: 'environments', label: 'Environments', icon: <Variable size={16} /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={16} /> },
    { id: 'data', label: 'Data', icon: <Database size={16} /> },
    { id: 'about', label: 'About Kobi', icon: <Info size={16} /> }
  ];

  return (
    <div className="settings-view">
      {/* Sidebar */}
      <div className="settings-sidebar">
        <h3>Settings</h3>
        <nav className="settings-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${effectiveSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="settings-content">
        {effectiveSection === 'general' && <GeneralSection />}
        {effectiveSection === 'environments' && <EnvironmentsSection />}
        {effectiveSection === 'shortcuts' && <ShortcutsSection />}
        {effectiveSection === 'data' && <DataSection />}
        {effectiveSection === 'about' && <AboutSection />}
      </div>

      <style jsx>{`
                .settings-view {
                    display: flex;
                    height: 100%;
                    background: var(--bg-primary);
                }

                .settings-sidebar {
                    width: 220px;
                    padding: 24px 16px;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border-primary);
                    flex-shrink: 0;
                }

                .settings-sidebar h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    padding-left: 12px;
                    color: var(--text-primary);
                }

                .settings-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: var(--radius-md);
                    font-size: 13px;
                    color: var(--text-secondary);
                    text-align: left;
                }

                .nav-item:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .nav-item.active {
                    background: var(--primary-muted);
                    color: var(--primary);
                }

                .settings-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 32px;
                }
            `}</style>
    </div>
  );
};

// General Section
const GeneralSection = () => {
  const { currentFile } = useWorkspace();

  if (!currentFile) {
    return (
      <div className="section">
        <div className="empty-message">
          <Info size={24} />
          <p>Open a file to configure settings</p>
        </div>
        <style jsx>{`
                    .section { max-width: 600px; }
                    .empty-message {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 12px;
                        padding: 48px;
                        color: var(--text-muted);
                        text-align: center;
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>General Settings</h2>

      <div className="setting-group">
        <h4>File Information</h4>
        <div className="info-row">
          <span className="label">File Name</span>
          <span className="value">{currentFile.name}</span>
        </div>
        <div className="info-row">
          <span className="label">Version</span>
          <span className="value">{currentFile.version}</span>
        </div>
        <div className="info-row">
          <span className="label">Requests</span>
          <span className="value">{currentFile.requests.length}</span>
        </div>
        <div className="info-row">
          <span className="label">Folders</span>
          <span className="value">{currentFile.folders.length}</span>
        </div>
        <div className="info-row">
          <span className="label">Environments</span>
          <span className="value">{currentFile.environments.length}</span>
        </div>
      </div>

      <div className="setting-group">
        <h4>Request Settings</h4>
        <div className="info-row">
          <span className="label">Timeout</span>
          <span className="value">{currentFile.settings.timeout}ms</span>
        </div>
        <div className="info-row">
          <span className="label">Follow Redirects</span>
          <span className="value">{currentFile.settings.followRedirects ? 'Yes' : 'No'}</span>
        </div>
        <div className="info-row">
          <span className="label">Validate SSL</span>
          <span className="value">{currentFile.settings.validateSSL ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <style jsx>{`
                .section { max-width: 600px; }
                .section h2 {
                    font-size: 20px;
                    margin-bottom: 24px;
                }
                .setting-group {
                    margin-bottom: 32px;
                }
                .setting-group h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--border-secondary);
                    font-size: 13px;
                }
                .label { color: var(--text-secondary); }
                .value { font-weight: 500; }
            `}</style>
    </div>
  );
};

// Shortcuts Section
const ShortcutsSection = () => {
  const shortcutGroups = [
    {
      title: 'File',
      shortcuts: [
        { keys: ['Ctrl', 'N'], action: 'New Request' },
        { keys: ['Ctrl', 'S'], action: 'Save File' },
      ]
    },
    {
      title: 'Request',
      shortcuts: [
        { keys: ['Ctrl', 'Enter'], action: 'Send Request' },
        { keys: ['F2'], action: 'Rename Request' }
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'E'], action: 'Environments' },
        { keys: ['Ctrl', 'H'], action: 'History' },
        { keys: ['Ctrl', '`'], action: 'Toggle Console' }
      ]
    },
    {
      title: 'Tabs',
      shortcuts: [
        { keys: ['Ctrl', 'W'], action: 'Close Tab' },
        { keys: ['Ctrl', 'Tab'], action: 'Next Tab' },
        { keys: ['Ctrl', 'Shift', 'Tab'], action: 'Previous Tab' }
      ]
    }
  ];

  return (
    <div className="section">
      <h2>Keyboard Shortcuts</h2>
      <p className="section-desc">Master these shortcuts to boost your productivity</p>

      {shortcutGroups.map(group => (
        <div key={group.title} className="shortcut-group">
          <h4>{group.title}</h4>
          <div className="shortcuts-list">
            {group.shortcuts.map((shortcut, idx) => (
              <div key={idx} className="shortcut-row">
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, keyIdx) => (
                    <React.Fragment key={keyIdx}>
                      {keyIdx > 0 && <span className="sep">+</span>}
                      <span className="kbd">{key}</span>
                    </React.Fragment>
                  ))}
                </div>
                <span className="shortcut-action">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
                .section { max-width: 600px; }
                .section h2 { font-size: 20px; margin-bottom: 8px; }
                .section-desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 32px; }
                .shortcut-group { margin-bottom: 24px; }
                .shortcut-group h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }
                .shortcuts-list {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }
                .shortcut-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-secondary);
                }
                .shortcut-row:last-child { border-bottom: none; }
                .shortcut-keys { display: flex; align-items: center; gap: 4px; }
                .sep { color: var(--text-muted); font-size: 12px; }
                .shortcut-action { font-size: 13px; color: var(--text-secondary); }
            `}</style>
    </div>
  );
};

// Environments Section
const EnvironmentsSection = () => {
  const { currentFile, createEnvironment, updateEnvironment, deleteEnvironment, setActiveEnvironment, duplicateEnvironment } = useWorkspace();
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(
    currentFile?.environments[0]?.id || null
  );
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  if (!currentFile) {
    return (
      <div className="section">
        <div className="empty-message">
          <Variable size={24} />
          <p>Open a file to manage environments</p>
        </div>
        <style jsx>{`
                    .section { max-width: 800px; }
                    .empty-message {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 12px;
                        padding: 48px;
                        color: var(--text-muted);
                    }
                `}</style>
      </div>
    );
  }

  const selectedEnv = currentFile.environments.find(e => e.id === selectedEnvId);

  const addVariable = () => {
    if (!selectedEnv || !newVarKey.trim()) return;
    updateEnvironment(selectedEnvId!, {
      variables: [...selectedEnv.variables, { key: newVarKey, value: newVarValue, enabled: true }]
    });
    setNewVarKey('');
    setNewVarValue('');
  };

  const updateVariable = (index: number, updates: Partial<{ key: string; value: string; enabled: boolean }>) => {
    if (!selectedEnv) return;
    const newVars = [...selectedEnv.variables];
    newVars[index] = { ...newVars[index], ...updates };
    updateEnvironment(selectedEnvId!, { variables: newVars });
  };

  const removeVariable = (index: number) => {
    if (!selectedEnv) return;
    updateEnvironment(selectedEnvId!, {
      variables: selectedEnv.variables.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Environments</h2>
          <p className="section-desc">Manage environment variables</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => createEnvironment(`Environment ${currentFile.environments.length + 1}`)}
        >
          <Plus size={14} />
          New Environment
        </button>
      </div>

      <div className="env-layout">
        <div className="env-list">
          {currentFile.environments.map(env => (
            <div
              key={env.id}
              className={`env-item ${selectedEnvId === env.id ? 'selected' : ''} ${env.id === currentFile.activeEnvironmentId ? 'active-env' : ''}`}
              onClick={() => setSelectedEnvId(env.id)}
            >
              <div className="env-item-main">
                <span className="env-name">{env.name}</span>
                {env.id === currentFile.activeEnvironmentId && (
                  <CheckCircle size={14} className="active-icon" />
                )}
              </div>
              <span className="env-vars">{env.variables.length} variables</span>
            </div>
          ))}
        </div>

        {selectedEnv && (
          <div className="env-editor">
            <div className="env-editor-header">
              <input
                type="text"
                value={selectedEnv.name}
                onChange={(e) => updateEnvironment(selectedEnvId!, { name: e.target.value })}
                className="env-name-input"
              />
              <div className="env-actions">
                {currentFile.activeEnvironmentId !== selectedEnvId && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveEnvironment(selectedEnvId!)}
                  >
                    Set Active
                  </button>
                )}
                {currentFile.environments.length > 1 && (
                  <button
                    className="btn-icon danger"
                    onClick={() => {
                      deleteEnvironment(selectedEnvId!);
                      setSelectedEnvId(currentFile.environments.filter(e => e.id !== selectedEnvId)[0]?.id || null);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <table className="vars-table">
              <thead>
                <tr>
                  <th className="col-check"></th>
                  <th>VARIABLE</th>
                  <th>VALUE</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {selectedEnv.variables.map((variable, idx) => (
                  <tr key={idx} className={!variable.enabled ? 'disabled' : ''}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={variable.enabled}
                        onChange={(e) => updateVariable(idx, { enabled: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={variable.key}
                        onChange={(e) => updateVariable(idx, { key: e.target.value })}
                        placeholder="variable_name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={variable.value}
                        onChange={(e) => updateVariable(idx, { value: e.target.value })}
                        placeholder="value"
                      />
                    </td>
                    <td className="col-actions">
                      <button className="btn-icon" onClick={() => removeVariable(idx)}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="add-row">
                  <td className="col-check"></td>
                  <td>
                    <input
                      type="text"
                      value={newVarKey}
                      onChange={(e) => setNewVarKey(e.target.value)}
                      placeholder="Add variable..."
                      onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder="value"
                      onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                    />
                  </td>
                  <td className="col-actions">
                    <button className="btn-icon" onClick={addVariable} disabled={!newVarKey.trim()}>
                      <Plus size={14} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="env-hint">
              <Info size={14} />
              <span>Use {"{{variable_name}}"} in requests</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
                .section { height: 100%; }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                .section-header h2 { font-size: 20px; margin-bottom: 4px; }
                .section-desc { color: var(--text-secondary); font-size: 13px; }
                .env-layout { display: flex; gap: 24px; height: calc(100% - 80px); }
                .env-list { width: 220px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
                .env-item {
                    display: flex; flex-direction: column; gap: 4px;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }
                .env-item:hover { border-color: var(--border-focus); }
                .env-item.selected { border-color: var(--primary); background: var(--primary-muted); }
                .env-item.active-env { border-left: 3px solid var(--success); }
                .env-item-main { display: flex; align-items: center; justify-content: space-between; }
                .env-name { font-size: 13px; font-weight: 500; }
                .active-icon { color: var(--success); }
                .env-vars { font-size: 11px; color: var(--text-muted); }
                .env-editor {
                    flex: 1;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    overflow: auto;
                }
                .env-editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .env-name-input {
                    font-size: 16px; font-weight: 600;
                    background: transparent; border: none; padding: 0; width: 200px;
                }
                .env-name-input:focus { outline: none; box-shadow: none; }
                .env-actions { display: flex; gap: 8px; }
                .btn-icon.danger:hover { color: var(--error); background: rgba(239, 68, 68, 0.1); }
                .vars-table { width: 100%; border-collapse: collapse; }
                .vars-table th {
                    text-align: left; padding: 8px;
                    font-size: 10px; font-weight: 600; color: var(--text-muted);
                    border-bottom: 1px solid var(--border-secondary);
                    text-transform: uppercase;
                }
                .vars-table td { border-bottom: 1px solid var(--border-secondary); }
                .vars-table tr.disabled td { opacity: 0.5; }
                .vars-table input[type="text"] {
                    width: 100%; padding: 10px 8px;
                    background: transparent; border: none;
                    font-size: 13px; font-family: var(--font-mono);
                }
                .vars-table input[type="text"]:focus { background: var(--bg-tertiary); outline: none; }
                .vars-table input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); }
                .col-check { width: 40px; text-align: center; }
                .col-actions { width: 40px; text-align: center; }
                .add-row td { border-bottom: none; }
                .env-hint {
                    display: flex; align-items: center; gap: 8px;
                    margin-top: 16px; padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                    font-size: 12px; color: var(--text-muted);
                }
            `}</style>
    </div>
  );
};

// Data Section
const DataSection = () => {
  const { currentFile, saveFile, clearHistory, history, importPostmanCollection, exportAsPostman } = useWorkspace();

  return (
    <div className="section">
      <h2>Data Management</h2>
      <p className="section-desc">Export, import, and manage your data</p>

      {currentFile && (
        <div className="setting-group">
          <h4>Export</h4>
          <div className="action-cards">
            <div className="action-card">
              <div className="card-icon"><Download size={20} /></div>
              <div className="card-info">
                <h5>Save File</h5>
                <p>Download as .kobi.json</p>
              </div>
              <button className="btn btn-primary" onClick={saveFile}>Save</button>
            </div>
            <div className="action-card">
              <div className="card-icon"><ExternalLink size={20} /></div>
              <div className="card-info">
                <h5>Export as Postman</h5>
                <p>Postman Collection v2.1</p>
              </div>
              <button className="btn btn-secondary" onClick={exportAsPostman}>Export</button>
            </div>
          </div>
        </div>
      )}

      <div className="setting-group danger">
        <h4>Clear Data</h4>
        <div className="action-cards">
          <div className="action-card danger">
            <div className="card-icon"><Trash2 size={20} /></div>
            <div className="card-info">
              <h5>Clear History</h5>
              <p>{history.length} entries</p>
            </div>
            <button className="btn btn-danger" onClick={clearHistory}>Clear</button>
          </div>
        </div>
      </div>

      <style jsx>{`
                .section { max-width: 700px; }
                .section h2 { font-size: 20px; margin-bottom: 8px; }
                .section-desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 32px; }
                .setting-group { margin-bottom: 32px; }
                .setting-group h4 {
                    font-size: 12px; font-weight: 600; color: var(--text-muted);
                    text-transform: uppercase; margin-bottom: 12px;
                }
                .setting-group.danger h4 { color: var(--error); }
                .action-cards { display: flex; flex-direction: column; gap: 12px; }
                .action-card {
                    display: flex; align-items: center; gap: 16px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                }
                .action-card.danger { border-color: rgba(239, 68, 68, 0.3); }
                .card-icon {
                    width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }
                .action-card.danger .card-icon { background: rgba(239, 68, 68, 0.1); color: var(--error); }
                .card-info { flex: 1; }
                .card-info h5 { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
                .card-info p { font-size: 12px; color: var(--text-muted); }
            `}</style>
    </div>
  );
};

// About Section
const AboutSection = () => (
  <div className="section">
    <div className="about-hero">
      <div className="about-logo">K</div>
      <div className="about-info">
        <h1>Kobi</h1>
        <p className="version">Version 2.0.0</p>
        <p className="tagline">The Offline-First API Client</p>
      </div>
    </div>

    <div className="about-description">
      <p>
        Kobi is a modern, lightweight API client built for developers who value speed, simplicity, and privacy.
        All your data stays local – no cloud sync, no accounts, no tracking.
      </p>
    </div>

    <div className="features-grid">
      <div className="feature-card">
        <Database size={20} />
        <div>
          <h5>File-Based</h5>
          <p>Save & share .kobi.json files</p>
        </div>
      </div>
      <div className="feature-card">
        <Shield size={20} />
        <div>
          <h5>Privacy First</h5>
          <p>No telemetry or tracking</p>
        </div>
      </div>
      <div className="feature-card">
        <Globe size={20} />
        <div>
          <h5>Offline Ready</h5>
          <p>Works without internet</p>
        </div>
      </div>
      <div className="feature-card">
        <ExternalLink size={20} />
        <div>
          <h5>Postman Compatible</h5>
          <p>Import/export collections</p>
        </div>
      </div>
    </div>

    <div className="about-footer">
      <p>Made with <Heart size={14} className="heart" /> for developers</p>
      <p className="copyright">© 2024 Kobi. Open Source under MIT License.</p>
    </div>

    <style jsx>{`
            .section { max-width: 600px; }
            .about-hero { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; }
            .about-logo {
                width: 72px; height: 72px;
                background: var(--primary);
                border-radius: var(--radius-xl);
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 32px; color: white;
            }
            .about-info h1 { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
            .about-info .version { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
            .about-info .tagline { font-size: 14px; color: var(--primary); font-weight: 500; }
            .about-description { margin-bottom: 32px; }
            .about-description p { font-size: 14px; line-height: 1.7; color: var(--text-secondary); }
            .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px; }
            .feature-card {
                display: flex; align-items: flex-start; gap: 12px;
                padding: 16px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-md);
            }
            .feature-card > :first-child { color: var(--primary); flex-shrink: 0; margin-top: 2px; }
            .feature-card h5 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
            .feature-card p { font-size: 12px; color: var(--text-muted); }
            .about-footer { text-align: center; padding-top: 24px; border-top: 1px solid var(--border-secondary); }
            .about-footer p {
                font-size: 13px; color: var(--text-secondary);
                display: flex; align-items: center; justify-content: center; gap: 4px;
            }
            .about-footer .heart { color: var(--error); }
            .about-footer .copyright { margin-top: 8px; font-size: 12px; color: var(--text-muted); }
        `}</style>
  </div>
);
