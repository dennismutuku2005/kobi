'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Clock, Trash2, Search, Calendar,
  CheckCircle, XCircle, AlertCircle, RotateCcw, X, ArrowLeft
} from 'lucide-react';

export const HistoryView = () => {
  const {
    history,
    clearHistory,
    deleteHistoryItem,
    openTab,
    setViewMode,
    currentFile
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'success' | 'error' | null>(null);

  // Filter history
  const filteredHistory = history.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.url.toLowerCase().includes(query) &&
        !item.requestName.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterMethod && item.method !== filterMethod) {
      return false;
    }
    if (filterStatus === 'success' && item.response && item.response.status >= 400) {
      return false;
    }
    if (filterStatus === 'error' && item.response && item.response.status < 400) {
      return false;
    }
    return true;
  });

  // Group by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, typeof history>);

  const getMethodClass = (method: string) => `method-${method.toLowerCase()}`;

  const getStatusIcon = (status: number | undefined) => {
    if (!status) return <AlertCircle size={14} />;
    if (status >= 200 && status < 300) return <CheckCircle size={14} />;
    return <XCircle size={14} />;
  };

  const getStatusClass = (status: number | undefined) => {
    if (!status) return '';
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 400) return 'status-error';
    return 'status-warning';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleTimeString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateStr;
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const hasFilters = searchQuery || filterMethod || filterStatus;

  if (history.length === 0) {
    return (
      <div className="history-view empty">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Clock size={28} />
          </div>
          <h3>No History Yet</h3>
          <p>Your request history will appear here after you send requests</p>
          {currentFile && (
            <button className="btn btn-primary" onClick={() => setViewMode('collections')}>
              <ArrowLeft size={14} />
              Go to Collections
            </button>
          )}
        </div>

        <style jsx>{`
                    .history-view.empty {
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
    <div className="history-view">
      <div className="history-header">
        <div className="header-left">
          {currentFile && (
            <button className="back-btn" onClick={() => setViewMode('collections')}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="header-info">
            <h2>Request History</h2>
            <p>{history.length} requests</p>
          </div>
        </div>
        <button className="btn btn-danger" onClick={clearHistory}>
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          {methods.map(method => (
            <button
              key={method}
              className={`filter-chip ${filterMethod === method ? 'active' : ''}`}
              onClick={() => setFilterMethod(filterMethod === method ? null : method)}
            >
              {method}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <button
            className={`filter-chip success ${filterStatus === 'success' ? 'active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === 'success' ? null : 'success')}
          >
            <CheckCircle size={12} />
            OK
          </button>
          <button
            className={`filter-chip error ${filterStatus === 'error' ? 'active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === 'error' ? null : 'error')}
          >
            <XCircle size={12} />
            Error
          </button>
        </div>

        {hasFilters && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSearchQuery('');
              setFilterMethod(null);
              setFilterStatus(null);
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Results */}
      {hasFilters && (
        <div className="results-count">
          Showing {filteredHistory.length} of {history.length}
        </div>
      )}

      {/* History List */}
      <div className="history-list">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} className="history-group">
            <div className="group-header">
              <Calendar size={14} />
              <span>{formatDate(date)}</span>
              <span className="group-count">{items.length}</span>
            </div>
            {items.map(item => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => {
                  if (currentFile) {
                    openTab(item.requestId);
                    setViewMode('collections');
                  }
                }}
              >
                <div className="item-status">
                  <span className={getStatusClass(item.response?.status)}>
                    {getStatusIcon(item.response?.status)}
                  </span>
                </div>
                <span className={`method-tag ${getMethodClass(item.method)}`}>
                  {item.method.substring(0, 3)}
                </span>
                <div className="item-info">
                  <span className="item-name">{item.requestName}</span>
                  <span className="item-url mono truncate">{item.url}</span>
                </div>
                <div className="item-meta">
                  {item.response && (
                    <>
                      <span className={`status-code ${getStatusClass(item.response.status)}`}>
                        {item.response.status}
                      </span>
                      <span className="duration">{item.duration}ms</span>
                    </>
                  )}
                  <span className="item-time">{formatTime(item.timestamp)}</span>
                  <button
                    className="delete-btn btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredHistory.length === 0 && hasFilters && (
          <div className="no-results">
            <Search size={24} />
            <p>No requests match your filters</p>
          </div>
        )}
      </div>

      <style jsx>{`
                .history-view {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-btn {
                    padding: 8px;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                }

                .back-btn:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .header-info h2 {
                    font-size: 18px;
                    margin-bottom: 2px;
                }

                .header-info p {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .filters-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    min-width: 180px;
                }

                .search-box input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    padding: 0;
                }

                .search-box input:focus {
                    outline: none;
                    box-shadow: none;
                }

                .clear-btn {
                    color: var(--text-muted);
                    padding: 2px;
                }

                .clear-btn:hover {
                    color: var(--text-primary);
                }

                .filter-group {
                    display: flex;
                    gap: 4px;
                }

                .filter-chip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-muted);
                    background: var(--bg-tertiary);
                    border: 1px solid transparent;
                    border-radius: var(--radius-full);
                }

                .filter-chip:hover {
                    color: var(--text-primary);
                    border-color: var(--border-primary);
                }

                .filter-chip.active {
                    background: var(--primary-muted);
                    color: var(--primary);
                    border-color: var(--primary);
                }

                .filter-chip.success.active {
                    background: var(--success-muted);
                    color: var(--success);
                    border-color: var(--success);
                }

                .filter-chip.error.active {
                    background: var(--error-muted);
                    color: var(--error);
                    border-color: var(--error);
                }

                .results-count {
                    padding: 8px 24px;
                    font-size: 11px;
                    color: var(--text-muted);
                    background: var(--bg-primary);
                    flex-shrink: 0;
                }

                .history-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;
                }

                .history-group {
                    margin-bottom: 20px;
                }

                .group-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border-secondary);
                }

                .group-count {
                    background: var(--bg-tertiary);
                    padding: 1px6px;
                    border-radius: 8px;
                    font-size: 10px;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: var(--transition-fast);
                }

                .history-item:hover {
                    border-color: var(--border-focus);
                }

                .item-status {
                    display: flex;
                }

                .item-status .status-success { color: var(--success); }
                .item-status .status-error { color: var(--error); }
                .item-status .status-warning { color: var(--warning); }

                .method-tag {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    font-weight: 700;
                    min-width: 28px;
                    text-align: center;
                }

                .method-get { color: var(--success); }
                .method-post { color: var(--warning); }
                .method-put { color: var(--info); }
                .method-patch { color: #A855F7; }
                .method-delete { color: var(--error); }

                .item-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .item-name {
                    font-size: 12px;
                    font-weight: 500;
                }

                .item-url {
                    font-size: 11px;
                    color: var(--text-muted);
                    max-width: 250px;
                }

                .item-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .status-code {
                    font-family: var(--font-mono);
                    font-size: 11px;
                    font-weight: 600;
                }

                .duration {
                    font-size: 10px;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                }

                .item-time {
                    font-size: 10px;
                    color: var(--text-muted);
                    min-width: 50px;
                    text-align: right;
                }

                .delete-btn {
                    opacity: 0;
                    transition: var(--transition-fast);
                }

                .history-item:hover .delete-btn {
                    opacity: 1;
                }

                .delete-btn:hover {
                    color: var(--error) !important;
                    background: var(--error-muted) !important;
                }

                .no-results {
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
};
