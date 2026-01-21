'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Send, Variable, ChevronDown, Check, AlertCircle } from 'lucide-react';

export const TopBar = () => {
  const {
    activeRequest,
    updateRequest,
    sendRequest,
    isLoading,
    currentFile,
    setActiveEnvironment
  } = useWorkspace();

  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const envDropdownRef = useRef<HTMLDivElement>(null);
  const methodDropdownRef = useRef<HTMLDivElement>(null);

  const methods: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'> = [
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (envDropdownRef.current && !envDropdownRef.current.contains(e.target as Node)) {
        setShowEnvDropdown(false);
      }
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(e.target as Node)) {
        setShowMethodDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentFile || !activeRequest) {
    return (
      <div className="topbar empty">
        <div className="empty-message">
          <AlertCircle size={16} />
          <span>Select a request from the sidebar or create a new one</span>
        </div>

        <style jsx>{`
                    .topbar.empty {
                        height: var(--topbar-height);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 16px;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-primary);
                    }
                    .empty-message {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: var(--text-muted);
                        font-size: 13px;
                    }
                `}</style>
      </div>
    );
  }

  const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;
  const activeEnv = currentFile.environments.find(e => e.id === currentFile.activeEnvironmentId);

  return (
    <div className="topbar">
      {/* Method Selector */}
      <div className="method-dropdown" ref={methodDropdownRef}>
        <button
          className={`method-btn ${getMethodClass(activeRequest.method)}`}
          onClick={() => setShowMethodDropdown(!showMethodDropdown)}
        >
          <span>{activeRequest.method}</span>
          <ChevronDown size={14} />
        </button>
        {showMethodDropdown && (
          <div className="dropdown-menu">
            {methods.map(method => (
              <button
                key={method}
                className={`dropdown-item ${getMethodClass(method)} ${activeRequest.method === method ? 'active' : ''}`}
                onClick={() => {
                  updateRequest(activeRequest.id, { method });
                  setShowMethodDropdown(false);
                }}
              >
                {method}
                {activeRequest.method === method && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* URL Input */}
      <input
        type="text"
        className="url-input"
        value={activeRequest.url}
        onChange={(e) => updateRequest(activeRequest.id, { url: e.target.value })}
        placeholder="Enter request URL..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            sendRequest();
          }
        }}
      />

      {/* Environment Selector */}
      <div className="env-dropdown" ref={envDropdownRef}>
        <button
          className="env-btn"
          onClick={() => setShowEnvDropdown(!showEnvDropdown)}
        >
          <Variable size={14} />
          <span>{activeEnv?.name || 'No Env'}</span>
          <ChevronDown size={12} />
        </button>
        {showEnvDropdown && (
          <div className="dropdown-menu right">
            <div className="dropdown-header">Environments</div>
            {currentFile.environments.map(env => (
              <button
                key={env.id}
                className={`dropdown-item ${currentFile.activeEnvironmentId === env.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveEnvironment(env.id);
                  setShowEnvDropdown(false);
                }}
              >
                <span>{env.name}</span>
                <span className="var-count">{env.variables.length} vars</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Send Button */}
      <button
        className="send-btn"
        onClick={sendRequest}
        disabled={isLoading || !activeRequest.url}
      >
        {isLoading ? (
          <>
            <div className="spinner spinner-sm" />
            <span>Sending</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>Send</span>
          </>
        )}
      </button>

      <style jsx>{`
                .topbar {
                    height: var(--topbar-height);
                    min-height: var(--topbar-height);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 12px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                    flex-shrink: 0;
                }

                .method-dropdown {
                    position: relative;
                }

                .method-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                }

                .method-btn:hover {
                    border-color: var(--border-focus);
                }

                .url-input {
                    flex: 1;
                    padding: 8px 12px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-primary);
                    font-size: 13px;
                    font-family: var(--font-mono);
                }

                .url-input:focus {
                    border-color: var(--primary);
                }

                .env-dropdown {
                    position: relative;
                }

                .env-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .env-btn:hover {
                    border-color: var(--border-focus);
                    color: var(--text-primary);
                }

                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    min-width: 160px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    padding: 4px;
                    z-index: 100;
                    box-shadow: var(--shadow-lg);
                }

                .dropdown-menu.right {
                    left: auto;
                    right: 0;
                }

                .dropdown-header {
                    padding: 6px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 8px 10px;
                    border-radius: var(--radius-sm);
                    font-size: 12px;
                    text-align: left;
                    color: var(--text-secondary);
                }

                .dropdown-item:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .dropdown-item.active {
                    background: var(--primary-muted);
                    color: var(--primary);
                }

                .var-count {
                    font-size: 10px;
                    color: var(--text-muted);
                }

                .send-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-md);
                    font-size: 13px;
                    font-weight: 500;
                }

                .send-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                }

                .send-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
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
