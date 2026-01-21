'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Copy, Check, Download, Clock, Activity, Globe, Code, List,
  FileJson, Search, X, ChevronDown, ChevronUp, Maximize2, Minimize2
} from 'lucide-react';

export const ResponseViewer = () => {
  const { response, isLoading, showContextMenu, cancelRequest, activeRequest, addConsoleLog } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'headers' | 'cookies'>('pretty');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLPreElement>(null);

  // Listen for copy response event
  useEffect(() => {
    const handleCopy = () => {
      if (response) {
        handleCopyResponse();
      }
    };

    const handleCopyJson = () => {
      if (response) {
        navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
        addConsoleLog('info', 'Copied JSON to clipboard');
      }
    };

    const handleSaveResponse = () => {
      if (response) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `response-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addConsoleLog('success', 'Saved response to file');
      }
    };

    window.addEventListener('copy-response', handleCopy);
    window.addEventListener('copy-json', handleCopyJson);
    window.addEventListener('save-response', handleSaveResponse);
    return () => {
      window.removeEventListener('copy-response', handleCopy);
      window.removeEventListener('copy-json', handleCopyJson);
      window.removeEventListener('save-response', handleSaveResponse);
    };
  }, [response, addConsoleLog]);

  // Handle Ctrl+F to show search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && response) {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [response]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, null, 'response-viewer');
  };

  const handleCopyResponse = () => {
    if (response) {
      const text = typeof response.data === 'object'
        ? JSON.stringify(response.data, null, 2)
        : String(response.data);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addConsoleLog('info', 'Copied response to clipboard');
    }
  };

  const handleDownload = () => {
    if (!response) return;
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeRequest?.name || 'response'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusClass = (status: number) => {
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 400) return 'status-error';
    return 'status-warning';
  };

  const getStatusEmoji = (status: number) => {
    if (status >= 200 && status < 300) return '✓';
    if (status >= 400 && status < 500) return '⚠';
    if (status >= 500) return '✕';
    return '○';
  };

  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const highlightJson = (json: string): React.ReactNode[] => {
    const lines = json.split('\n');
    return lines.map((line, idx) => {
      // Highlight search matches
      if (searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase())) {
        const parts = line.split(new RegExp(`(${searchQuery})`, 'gi'));
        return (
          <div key={idx} className="json-line highlight">
            {parts.map((part, pIdx) =>
              part.toLowerCase() === searchQuery.toLowerCase()
                ? <mark key={pIdx}>{part}</mark>
                : part
            )}
          </div>
        );
      }
      return <div key={idx} className="json-line">{line}</div>;
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="response-viewer loading" onContextMenu={handleContextMenu}>
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <span className="loading-text">Sending request...</span>
          <p className="loading-subtext">
            {activeRequest?.method} {activeRequest?.url?.substring(0, 50)}
            {activeRequest?.url && activeRequest.url.length > 50 ? '...' : ''}
          </p>
          <button className="btn btn-secondary" onClick={cancelRequest}>
            Cancel Request
          </button>
        </div>

        <style jsx>{`
                    .response-viewer.loading {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-primary);
                    }

                    .loading-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                        text-align: center;
                    }

                    .loading-text {
                        color: var(--text-secondary);
                        font-size: 14px;
                        font-weight: 500;
                    }

                    .loading-subtext {
                        font-size: 12px;
                        color: var(--text-muted);
                        font-family: var(--font-mono);
                        max-width: 300px;
                    }
                `}</style>
      </div>
    );
  }

  // Empty State
  if (!response) {
    return (
      <div className="response-viewer empty" onContextMenu={handleContextMenu}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Globe size={28} />
          </div>
          <h3>Response</h3>
          <p>Send a request to see the response here</p>
          <div className="shortcut-hint">
            <span className="kbd">Ctrl</span>
            <span>+</span>
            <span className="kbd">Enter</span>
            <span className="hint-text">to send</span>
          </div>
        </div>

        <style jsx>{`
                    .response-viewer.empty {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-primary);
                    }

                    .shortcut-hint {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin-top: 16px;
                        color: var(--text-muted);
                        font-size: 12px;
                    }

                    .hint-text {
                        margin-left: 4px;
                    }
                `}</style>
      </div>
    );
  }

  // Response Display
  const headersCount = Object.keys(response.headers || {}).length;
  const cookiesCount = Object.keys(response.cookies || {}).length;
  const prettyJson = formatJson(response.data);

  return (
    <div className={`response-viewer ${isFullscreen ? 'fullscreen' : ''}`} onContextMenu={handleContextMenu}>
      {/* Header */}
      <div className="response-header">
        <div className="response-status">
          <span className={`status-badge ${getStatusClass(response.status)}`}>
            {getStatusEmoji(response.status)} {response.status} {response.statusText}
          </span>
          <div className="response-metrics">
            <div className="metric">
              <Clock size={12} />
              <span>{response.time}ms</span>
            </div>
            <div className="metric">
              <Activity size={12} />
              <span>{response.size}</span>
            </div>
          </div>
        </div>

        <div className="response-actions">
          <button
            className="btn-icon"
            onClick={() => setShowSearch(!showSearch)}
            title="Search (Ctrl+F)"
          >
            <Search size={14} />
          </button>
          <button className="btn-icon" onClick={handleCopyResponse} title="Copy">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className="btn-icon" onClick={handleDownload} title="Download">
            <Download size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search in response..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <span className="search-count">
              {searchMatches.length} matches
            </span>
          )}
          <button className="btn-icon" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="response-tabs">
        <button
          className={`response-tab ${activeTab === 'pretty' ? 'active' : ''}`}
          onClick={() => setActiveTab('pretty')}
        >
          <Code size={14} />
          Pretty
        </button>
        <button
          className={`response-tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <FileJson size={14} />
          Raw
        </button>
        <button
          className={`response-tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          <List size={14} />
          Headers
          {headersCount > 0 && <span className="tab-badge">{headersCount}</span>}
        </button>
        {cookiesCount > 0 && (
          <button
            className={`response-tab ${activeTab === 'cookies' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookies')}
          >
            Cookies
            <span className="tab-badge">{cookiesCount}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="response-content">
        {activeTab === 'pretty' && (
          <pre ref={contentRef} className="response-body mono">
            {highlightJson(prettyJson)}
          </pre>
        )}

        {activeTab === 'raw' && (
          <pre className="response-body mono raw">
            {response.rawBody || JSON.stringify(response.data)}
          </pre>
        )}

        {activeTab === 'headers' && (
          <div className="headers-list">
            {Object.entries(response.headers || {}).map(([key, value]) => (
              <div key={key} className="header-row">
                <span className="header-key mono">{key}</span>
                <span className="header-value mono">{value as string}</span>
              </div>
            ))}
            {headersCount === 0 && (
              <div className="no-data">No headers received</div>
            )}
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="headers-list">
            {Object.entries(response.cookies || {}).map(([key, value]) => (
              <div key={key} className="header-row">
                <span className="header-key mono">{key}</span>
                <span className="header-value mono">{value as string}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
                .response-viewer {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    min-width: 0;
                    overflow: hidden;
                }

                .response-viewer.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100;
                }

                .response-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                }

                .response-status {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .response-metrics {
                    display: flex;
                    gap: 12px;
                }

                .metric {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .response-actions {
                    display: flex;
                    gap: 4px;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-tertiary);
                    border-bottom: 1px solid var(--border-primary);
                }

                .search-bar input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    font-size: 13px;
                    padding: 0;
                }

                .search-bar input:focus {
                    outline: none;
                    box-shadow: none;
                }

                .search-count {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .response-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 8px 16px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                }

                .response-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .response-tab:hover {
                    color: var(--text-primary);
                }

                .response-tab.active {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .response-content {
                    flex: 1;
                    overflow: auto;
                    background: var(--bg-primary);
                }

                .response-body {
                    margin: 0;
                    padding: 16px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--text-primary);
                }

                .response-body.raw {
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .json-line {
                    min-height: 19px;
                }

                .json-line.highlight {
                    background: var(--warning-muted);
                }

                .json-line mark {
                    background: var(--warning);
                    color: var(--bg-primary);
                    padding: 1px 2px;
                    border-radius: 2px;
                }

                .headers-list {
                    padding: 16px;
                }

                .header-row {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 16px;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--border-secondary);
                    font-size: 12px;
                }

                .header-key {
                    color: var(--primary);
                    font-weight: 500;
                }

                .header-value {
                    color: var(--text-secondary);
                    word-break: break-all;
                }

                .no-data {
                    padding: 32px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 13px;
                }
            `}</style>
    </div>
  );
};
