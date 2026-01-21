'use client';

import { useWorkspace } from '@/context/WorkspaceContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { RequestEditor } from '@/components/RequestEditor';
import { ResponseViewer } from '@/components/ResponseViewer';
import { SettingsView } from '@/components/SettingsView';
import { HistoryView } from '@/components/HistoryView';
import { ContextMenu } from '@/components/ContextMenu';
import { TabBar } from '@/components/TabBar';
import { ConsolePanel } from '@/components/ConsolePanel';
import { CodeGenerator } from '@/components/CodeGenerator';
import { ResizeHandle } from '@/components/ResizeHandle';
import { WelcomeView } from '@/components/WelcomeView';
import { Database, Terminal, Wifi, Save, Circle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Home() {
  const {
    viewMode,
    currentFile,
    hasUnsavedChanges,
    showContextMenu,
    showBottomPanel,
    setShowBottomPanel,
    bottomPanelHeight,
    setBottomPanelHeight,
    tabs,
    isLoading,
    saveFile
  } = useWorkspace();

  const [editorWidth, setEditorWidth] = useState(50);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().length > 0;

    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      hasSelection
    ) {
      return;
    }

    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, null, 'general');
  };

  const handleEditorResize = (deltaX: number) => {
    if (!mainRef.current) return;
    const containerWidth = mainRef.current.offsetWidth;
    const deltaPercent = (deltaX / containerWidth) * 100;
    setEditorWidth(prev => Math.max(30, Math.min(70, prev + deltaPercent)));
  };

  const handleBottomResize = (deltaY: number) => {
    setBottomPanelHeight(prev => Math.max(100, Math.min(400, prev - deltaY)));
  };

  // Show welcome screen if no file is open
  if (!currentFile && viewMode !== 'history') {
    return (
      <main className="app" onContextMenu={handleGlobalContextMenu}>
        <ContextMenu />
        <WelcomeView />
      </main>
    );
  }

  const renderMainContent = () => {
    switch (viewMode) {
      case 'welcome':
        return <WelcomeView />;
      case 'settings':
      case 'environments':
        return <SettingsView />;
      case 'history':
        return <HistoryView />;
      case 'codegen':
        return <CodeGenerator />;
      default:
        return (
          <>
            <TabBar />
            <TopBar />
            <div className="editor-container" ref={mainRef}>
              <div className="editor-pane" style={{ width: `${editorWidth}%` }}>
                <RequestEditor />
              </div>
              <ResizeHandle
                direction="horizontal"
                onResize={handleEditorResize}
              />
              <div className="response-pane" style={{ width: `${100 - editorWidth}%` }}>
                <ResponseViewer />
              </div>
            </div>
          </>
        );
    }
  };

  const getEnvName = () => {
    if (!currentFile) return 'No Env';
    const env = currentFile.environments.find(e => e.id === currentFile.activeEnvironmentId);
    return env?.name || 'No Env';
  };

  return (
    <main className="app" onContextMenu={handleGlobalContextMenu}>
      <ContextMenu />

      <Sidebar />

      <div className="main-panel">
        <div className="main-content">
          {renderMainContent()}
        </div>

        {/* Bottom Panel (Console) */}
        {showBottomPanel && viewMode === 'collections' && (
          <>
            <ResizeHandle
              direction="vertical"
              onResize={handleBottomResize}
            />
            <div className="bottom-panel" style={{ height: bottomPanelHeight }}>
              <ConsolePanel />
            </div>
          </>
        )}

        {/* Status Bar */}
        <footer className="statusbar">
          <div className="status-left">
            <div className="status-item">
              <span className={`status-dot ${isLoading ? 'loading' : ''}`} />
              <span>{isLoading ? 'Sending...' : 'Ready'}</span>
            </div>
            {currentFile && (
              <>
                <div className="status-divider" />
                <button
                  className={`status-item clickable ${showBottomPanel ? 'active' : ''}`}
                  onClick={() => setShowBottomPanel(!showBottomPanel)}
                  title="Toggle Console (Ctrl+`)"
                >
                  <Terminal size={12} />
                  <span>Console</span>
                </button>
              </>
            )}
          </div>
          <div className="status-right">
            {currentFile && (
              <>
                {hasUnsavedChanges && (
                  <button
                    className="status-item clickable unsaved"
                    onClick={saveFile}
                    title="Save (Ctrl+S)"
                  >
                    <Circle size={8} fill="currentColor" />
                    <span>Unsaved</span>
                  </button>
                )}
                <div className="status-item">
                  <Wifi size={12} />
                  <span className="mono">{getEnvName()}</span>
                </div>
                <div className="status-divider" />
                <div className="status-item">
                  <Database size={12} />
                  <span className="mono">{currentFile.name}</span>
                </div>
                <div className="status-divider" />
                <div className="status-item">
                  <span>{tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>
        </footer>
      </div>

      <style jsx>{`
                .app {
                    display: flex;
                    height: 100vh;
                    width: 100vw;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    overflow: hidden;
                }

                .main-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow: hidden;
                }

                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }

                .editor-container {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                    min-height: 0;
                }

                .editor-pane,
                .response-pane {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow: hidden;
                }

                .bottom-panel {
                    border-top: 1px solid var(--border-primary);
                    background: var(--bg-secondary);
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .statusbar {
                    height: var(--statusbar-height);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-primary);
                    font-size: 11px;
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .status-left,
                .status-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-item.clickable {
                    padding: 2px 6px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .status-item.clickable:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .status-item.active {
                    color: var(--primary);
                }

                .status-item.unsaved {
                    color: var(--warning);
                }

                .status-item.unsaved:hover {
                    color: var(--primary);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--success);
                    border-radius: 50%;
                }

                .status-dot.loading {
                    background: var(--warning);
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .status-divider {
                    width: 1px;
                    height: 12px;
                    background: var(--border-primary);
                }
            `}</style>
    </main>
  );
}
