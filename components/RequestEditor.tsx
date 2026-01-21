'use client';

import React, { useState, useCallback } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Link, List, FileJson, Key, Code, Plus, Trash2, Check, X, GripVertical
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type TabType = 'params' | 'headers' | 'body' | 'auth' | 'scripts';

interface KeyValue {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

export const RequestEditor = () => {
  const { activeRequest, updateRequest, currentFile, showContextMenu } = useWorkspace();
  const [activeTab, setActiveTab] = useState<TabType>('params');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, null, 'request-editor');
  };

  if (!currentFile || !activeRequest) {
    return (
      <div className="request-editor empty" onContextMenu={handleContextMenu}>
        <div className="empty-state">
          <List size={28} />
          <h3>No Request Selected</h3>
          <p>Select a request from the sidebar or create a new one</p>
        </div>

        <style jsx>{`
                    .request-editor.empty {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-primary);
                    }
                `}</style>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'params', label: 'Params', icon: <Link size={14} />, count: activeRequest.params.filter(p => p.enabled).length },
    { id: 'headers', label: 'Headers', icon: <List size={14} />, count: activeRequest.headers.filter(h => h.enabled).length },
    { id: 'body', label: 'Body', icon: <FileJson size={14} /> },
    { id: 'auth', label: 'Auth', icon: <Key size={14} /> },
    { id: 'scripts', label: 'Scripts', icon: <Code size={14} /> }
  ];

  return (
    <div className="request-editor" onContextMenu={handleContextMenu}>
      {/* Tabs */}
      <div className="editor-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="editor-content">
        {activeTab === 'params' && (
          <KeyValueEditor
            items={activeRequest.params}
            onChange={(params) => updateRequest(activeRequest.id, { params })}
            placeholder="Query parameter"
          />
        )}

        {activeTab === 'headers' && (
          <KeyValueEditor
            items={activeRequest.headers}
            onChange={(headers) => updateRequest(activeRequest.id, { headers })}
            placeholder="Header"
          />
        )}

        {activeTab === 'body' && (
          <BodyEditor
            body={activeRequest.body}
            onChange={(body) => updateRequest(activeRequest.id, { body })}
          />
        )}

        {activeTab === 'auth' && (
          <AuthEditor
            auth={activeRequest.auth}
            onChange={(auth) => updateRequest(activeRequest.id, { auth })}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptsEditor
            preRequestScript={activeRequest.preRequestScript}
            testScript={activeRequest.testScript}
            onChange={(scripts) => updateRequest(activeRequest.id, scripts)}
          />
        )}
      </div>

      <style jsx>{`
                .request-editor {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    overflow: hidden;
                }

                .editor-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 8px 16px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                    flex-shrink: 0;
                }

                .editor-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .editor-tab:hover {
                    color: var(--text-primary);
                }

                .editor-tab.active {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .tab-count {
                    background: var(--primary-muted);
                    color: var(--primary);
                    padding: 1px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                }

                .editor-content {
                    flex: 1;
                    overflow: auto;
                }
            `}</style>
    </div>
  );
};

// Key-Value Editor Component
const KeyValueEditor = ({
  items,
  onChange,
  placeholder
}: {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  placeholder: string;
}) => {
  const addItem = () => {
    onChange([...items, {
      id: uuidv4(),
      key: '',
      value: '',
      description: '',
      enabled: true
    }]);
  };

  const updateItem = (id: string, updates: Partial<KeyValue>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="kv-editor">
      <table className="kv-table">
        <thead>
          <tr>
            <th className="col-check"></th>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>
            <th className="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={!item.enabled ? 'disabled' : ''}>
              <td className="col-check">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateItem(item.id, { enabled: e.target.checked })}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => updateItem(item.id, { key: e.target.value })}
                  placeholder={`${placeholder} key`}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateItem(item.id, { value: e.target.value })}
                  placeholder="Value"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                />
              </td>
              <td className="col-actions">
                <button className="delete-btn" onClick={() => removeItem(item.id)}>
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-btn" onClick={addItem}>
        <Plus size={14} />
        Add {placeholder}
      </button>

      <style jsx>{`
                .kv-editor {
                    padding: 16px;
                }

                .kv-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .kv-table th {
                    text-align: left;
                    padding: 8px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-muted);
                    border-bottom: 1px solid var(--border-secondary);
                    text-transform: uppercase;
                }

                .kv-table td {
                    border-bottom: 1px solid var(--border-secondary);
                }

                .kv-table tr.disabled td {
                    opacity: 0.5;
                }

                .kv-table input[type="text"] {
                    width: 100%;
                    padding: 10px 8px;
                    background: transparent;
                    border: none;
                    font-size: 13px;
                    font-family: var(--font-mono);
                }

                .kv-table input[type="text"]:focus {
                    background: var(--bg-secondary);
                    outline: none;
                }

                .kv-table input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--primary);
                }

                .col-check {
                    width: 40px;
                    text-align: center;
                }

                .col-actions {
                    width: 40px;
                    text-align: center;
                }

                .delete-btn {
                    padding: 4px;
                    color: var(--text-muted);
                    border-radius: var(--radius-sm);
                    opacity: 0;
                    transition: var(--transition-fast);
                }

                tr:hover .delete-btn {
                    opacity: 1;
                }

                .delete-btn:hover {
                    color: var(--error);
                    background: var(--error-muted);
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 12px;
                    padding: 8px 12px;
                    color: var(--text-secondary);
                    font-size: 13px;
                }

                .add-btn:hover {
                    color: var(--primary);
                }
            `}</style>
    </div>
  );
};

// Body Editor Component
const BodyEditor = ({
  body,
  onChange
}: {
  body: { type: string; content: string };
  onChange: (body: { type: string; content: string }) => void;
}) => {
  const bodyTypes = ['none', 'json', 'form-data', 'raw', 'binary', 'graphql'];

  return (
    <div className="body-editor">
      <div className="body-type-selector">
        {bodyTypes.map(type => (
          <button
            key={type}
            className={`type-btn ${body.type === type ? 'active' : ''}`}
            onClick={() => onChange({ ...body, type })}
          >
            {type === 'none' ? 'none' : type.toUpperCase()}
          </button>
        ))}
      </div>

      {body.type !== 'none' && (
        <textarea
          className="body-content"
          value={body.content}
          onChange={(e) => onChange({ ...body, content: e.target.value })}
          placeholder={body.type === 'json' ? '{\n  "key": "value"\n}' : 'Enter body content...'}
        />
      )}

      {body.type === 'none' && (
        <div className="no-body">
          <p>This request does not have a body</p>
        </div>
      )}

      <style jsx>{`
                .body-editor {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .body-type-selector {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-secondary);
                }

                .type-btn {
                    padding: 6px 12px;
                    border-radius: var(--radius-md);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .type-btn:hover {
                    color: var(--text-primary);
                }

                .type-btn.active {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .body-content {
                    flex: 1;
                    margin: 16px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.5;
                    resize: none;
                }

                .body-content:focus {
                    border-color: var(--primary);
                }

                .no-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    font-size: 13px;
                }
            `}</style>
    </div>
  );
};

// Auth Editor Component
const AuthEditor = ({
  auth,
  onChange
}: {
  auth: { type: string; token?: string; username?: string; password?: string; apiKey?: string; apiKeyHeader?: string };
  onChange: (auth: typeof auth) => void;
}) => {
  const authTypes = ['none', 'bearer', 'basic', 'api-key'];

  return (
    <div className="auth-editor">
      <div className="auth-type-selector">
        <label>Type</label>
        <select value={auth.type} onChange={(e) => onChange({ ...auth, type: e.target.value })}>
          {authTypes.map(type => (
            <option key={type} value={type}>
              {type === 'none' ? 'No Auth' : type === 'bearer' ? 'Bearer Token' : type === 'basic' ? 'Basic Auth' : 'API Key'}
            </option>
          ))}
        </select>
      </div>

      {auth.type === 'bearer' && (
        <div className="auth-fields">
          <div className="form-group">
            <label>Token</label>
            <input
              type="text"
              value={auth.token || ''}
              onChange={(e) => onChange({ ...auth, token: e.target.value })}
              placeholder="Enter bearer token"
            />
          </div>
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="auth-fields">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={auth.username || ''}
              onChange={(e) => onChange({ ...auth, username: e.target.value })}
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={auth.password || ''}
              onChange={(e) => onChange({ ...auth, password: e.target.value })}
              placeholder="Password"
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="auth-fields">
          <div className="form-group">
            <label>Key</label>
            <input
              type="text"
              value={auth.apiKey || ''}
              onChange={(e) => onChange({ ...auth, apiKey: e.target.value })}
              placeholder="API Key value"
            />
          </div>
          <div className="form-group">
            <label>Header Name</label>
            <input
              type="text"
              value={auth.apiKeyHeader || 'X-API-Key'}
              onChange={(e) => onChange({ ...auth, apiKeyHeader: e.target.value })}
              placeholder="X-API-Key"
            />
          </div>
        </div>
      )}

      {auth.type === 'none' && (
        <div className="no-auth">
          <p>This request does not use any authorization</p>
        </div>
      )}

      <style jsx>{`
                .auth-editor {
                    padding: 16px;
                }

                .auth-type-selector {
                    margin-bottom: 20px;
                }

                .auth-type-selector label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .auth-type-selector select {
                    padding: 8px 12px;
                    min-width: 200px;
                }

                .auth-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    max-width: 400px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .form-group input {
                    width: 100%;
                    font-family: var(--font-mono);
                }

                .no-auth {
                    padding: 32px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 13px;
                }
            `}</style>
    </div>
  );
};

// Scripts Editor Component
const ScriptsEditor = ({
  preRequestScript,
  testScript,
  onChange
}: {
  preRequestScript: string;
  testScript: string;
  onChange: (scripts: { preRequestScript?: string; testScript?: string }) => void;
}) => {
  const [activeScript, setActiveScript] = useState<'pre' | 'test'>('pre');

  return (
    <div className="scripts-editor">
      <div className="script-tabs">
        <button
          className={`script-tab ${activeScript === 'pre' ? 'active' : ''}`}
          onClick={() => setActiveScript('pre')}
        >
          Pre-request Script
        </button>
        <button
          className={`script-tab ${activeScript === 'test' ? 'active' : ''}`}
          onClick={() => setActiveScript('test')}
        >
          Tests
        </button>
      </div>

      <div className="script-content">
        {activeScript === 'pre' ? (
          <textarea
            value={preRequestScript}
            onChange={(e) => onChange({ preRequestScript: e.target.value })}
            placeholder="// JavaScript code to run before the request..."
          />
        ) : (
          <textarea
            value={testScript}
            onChange={(e) => onChange({ testScript: e.target.value })}
            placeholder="// JavaScript tests to run after the response..."
          />
        )}
      </div>

      <style jsx>{`
                .scripts-editor {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .script-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-secondary);
                }

                .script-tab {
                    padding: 6px 12px;
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .script-tab:hover {
                    color: var(--text-primary);
                }

                .script-tab.active {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .script-content {
                    flex: 1;
                    padding: 16px;
                }

                .script-content textarea {
                    width: 100%;
                    height: 100%;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.5;
                    resize: none;
                }

                .script-content textarea:focus {
                    border-color: var(--primary);
                }
            `}</style>
    </div>
  );
};
