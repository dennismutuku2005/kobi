'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface KeyValue {
    id: string;
    key: string;
    value: string;
    description: string;
    enabled: boolean;
}

export interface KobiRequest {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    folderId?: string;
    headers: KeyValue[];
    params: KeyValue[];
    body: {
        type: 'none' | 'json' | 'form-data' | 'raw' | 'binary' | 'graphql';
        content: string;
    };
    auth: {
        type: 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
        apiKeyHeader?: string;
    };
    preRequestScript: string;
    testScript: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Folder {
    id: string;
    name: string;
    parentId?: string;
    collapsed?: boolean;
}

export interface Environment {
    id: string;
    name: string;
    variables: { key: string; value: string; enabled: boolean; secret?: boolean }[];
}

export interface HistoryItem {
    id: string;
    requestId: string;
    requestName: string;
    method: string;
    url: string;
    timestamp: string;
    duration: number;
    response: ResponseData | null;
}

export interface ResponseData {
    status: number;
    statusText: string;
    time: number;
    size: string;
    sizeBytes: number;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    data: any;
    rawBody?: string;
}

export interface ConsoleLog {
    id: string;
    type: 'info' | 'warn' | 'error' | 'success';
    message: string;
    timestamp: string;
    requestId?: string;
}

// Workspace file - this is what gets saved/loaded
export interface KobiFile {
    id: string;
    name: string;
    filePath?: string; // For recently opened files
    version: string;
    description: string;
    requests: KobiRequest[];
    folders: Folder[];
    environments: Environment[];
    activeEnvironmentId: string | null;
    settings: {
        timeout: number;
        followRedirects: boolean;
        validateSSL: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export type ViewMode = 'welcome' | 'collections' | 'history' | 'environments' | 'settings' | 'codegen';
export type PanelType = 'sidebar' | 'request-list' | 'request-editor' | 'response-viewer' | 'tabs' | 'general';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    targetId: string | null;
    panelType: PanelType;
}

export interface TabItem {
    id: string;
    requestId: string;
    name: string;
    method: string;
    isDirty: boolean;
}

// Recent files stored in localStorage
interface RecentFile {
    name: string;
    path: string;
    lastOpened: string;
}

interface WorkspaceContextType {
    // File Management
    currentFile: KobiFile | null;
    hasUnsavedChanges: boolean;
    recentFiles: RecentFile[];
    createNewFile: (name: string) => void;
    openFile: (file: File) => void;
    saveFile: () => void;
    saveFileAs: () => void;
    closeFile: () => void;

    // View
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    bottomPanelHeight: number;
    setBottomPanelHeight: (height: number) => void;
    showBottomPanel: boolean;
    setShowBottomPanel: (show: boolean) => void;

    // Tabs
    tabs: TabItem[];
    activeTabId: string | null;
    openTab: (requestId: string) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;

    // Active Request
    activeRequestId: string | null;
    setActiveRequestId: (id: string | null) => void;
    activeRequest: KobiRequest | null;

    // Request Operations
    createRequest: (folderId?: string) => KobiRequest | null;
    updateRequest: (id: string, updates: Partial<KobiRequest>) => void;
    deleteRequest: (id: string) => void;
    duplicateRequest: (id: string) => void;
    archiveRequest: (id: string) => void;
    restoreRequest: (id: string) => void;
    moveRequestToFolder: (requestId: string, folderId: string | null) => void;

    // Folder Operations
    createFolder: (name: string, parentId?: string) => void;
    updateFolder: (id: string, updates: Partial<Folder>) => void;
    deleteFolder: (id: string) => void;
    toggleFolderCollapse: (id: string) => void;

    // Environment Operations
    createEnvironment: (name: string) => void;
    updateEnvironment: (id: string, updates: Partial<Environment>) => void;
    deleteEnvironment: (id: string) => void;
    setActiveEnvironment: (id: string | null) => void;
    duplicateEnvironment: (id: string) => void;

    // Request Execution
    sendRequest: () => Promise<void>;
    cancelRequest: () => void;
    response: ResponseData | null;
    isLoading: boolean;

    // Console
    consoleLogs: ConsoleLog[];
    addConsoleLog: (type: ConsoleLog['type'], message: string, requestId?: string) => void;
    clearConsoleLogs: () => void;

    // History
    history: HistoryItem[];
    clearHistory: () => void;
    deleteHistoryItem: (id: string) => void;

    // Import/Export
    importPostmanCollection: (file: File) => void;
    exportAsPostman: () => void;

    // Context Menu
    contextMenu: ContextMenuState;
    showContextMenu: (x: number, y: number, targetId: string | null, panelType: PanelType) => void;
    hideContextMenu: () => void;

    // Code Generation
    generateCode: (language: string) => string;

    // Utilities
    resolveVariables: (text: string) => string;
    getActiveEnvironment: () => Environment | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const RECENT_FILES_KEY = 'kobi_recent_files';
const HISTORY_KEY = 'kobi_history';

const createEmptyFile = (name: string): KobiFile => ({
    id: uuidv4(),
    name,
    version: '1.0.0',
    description: '',
    requests: [],
    folders: [],
    environments: [
        {
            id: 'env-default',
            name: 'Default',
            variables: []
        }
    ],
    activeEnvironmentId: 'env-default',
    settings: {
        timeout: 30000,
        followRedirects: true,
        validateSSL: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

const createEmptyRequest = (folderId?: string): KobiRequest => ({
    id: uuidv4(),
    name: 'New Request',
    method: 'GET',
    url: '',
    folderId: folderId || undefined,
    headers: [
        { id: uuidv4(), key: 'Content-Type', value: 'application/json', description: '', enabled: true }
    ],
    params: [],
    body: { type: 'none', content: '' },
    auth: { type: 'none' },
    preRequestScript: '',
    testScript: '',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentFile, setCurrentFile] = useState<KobiFile | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('welcome');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
    const [showBottomPanel, setShowBottomPanel] = useState(false);
    const [tabs, setTabs] = useState<TabItem[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetId: null,
        panelType: 'general'
    });

    // Load recent files and history from localStorage on mount
    useEffect(() => {
        try {
            const savedRecent = localStorage.getItem(RECENT_FILES_KEY);
            if (savedRecent) {
                setRecentFiles(JSON.parse(savedRecent));
            }
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }, []);

    // Save history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }, [history]);

    // Active request from active tab
    const activeRequestId = tabs.find(t => t.id === activeTabId)?.requestId || null;
    const activeRequest = currentFile?.requests.find(r => r.id === activeRequestId) || null;

    const setActiveRequestId = (id: string | null) => {
        if (id) {
            openTab(id);
        }
    };

    // FILE MANAGEMENT
    const createNewFile = useCallback((name: string) => {
        const newFile = createEmptyFile(name);
        setCurrentFile(newFile);
        setHasUnsavedChanges(true);
        setViewMode('collections');
        setTabs([]);
        setActiveTabId(null);
        addConsoleLog('success', `Created new file: ${name}`);
    }, []);

    const openFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target?.result as string);
                // Validate it's a Kobi file
                if (parsed.requests && parsed.environments) {
                    setCurrentFile({
                        ...parsed,
                        filePath: file.name
                    });
                    setHasUnsavedChanges(false);
                    setViewMode('collections');
                    setTabs([]);
                    setActiveTabId(null);

                    // Add to recent files
                    const recent: RecentFile = {
                        name: parsed.name || file.name,
                        path: file.name,
                        lastOpened: new Date().toISOString()
                    };
                    setRecentFiles(prev => {
                        const filtered = prev.filter(r => r.path !== file.name);
                        const updated = [recent, ...filtered].slice(0, 10);
                        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
                        return updated;
                    });

                    addConsoleLog('success', `Opened file: ${file.name}`);
                } else {
                    addConsoleLog('error', 'Invalid file format');
                }
            } catch (err) {
                addConsoleLog('error', 'Failed to parse file');
            }
        };
        reader.readAsText(file);
    }, []);

    const saveFile = useCallback(() => {
        if (!currentFile) return;

        const fileToSave = {
            ...currentFile,
            updatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(fileToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFile.name.toLowerCase().replace(/\s+/g, '-')}.kobi.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setHasUnsavedChanges(false);
        addConsoleLog('success', `Saved: ${currentFile.name}`);
    }, [currentFile]);

    const saveFileAs = useCallback(() => {
        saveFile(); // For now, same as save
    }, [saveFile]);

    const closeFile = useCallback(() => {
        if (hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                return;
            }
        }
        setCurrentFile(null);
        setViewMode('welcome');
        setTabs([]);
        setActiveTabId(null);
        setResponse(null);
        addConsoleLog('info', 'Closed file');
    }, [hasUnsavedChanges]);

    // Mark file as changed
    const markChanged = useCallback(() => {
        setHasUnsavedChanges(true);
        if (currentFile) {
            setCurrentFile(prev => prev ? { ...prev, updatedAt: new Date().toISOString() } : null);
        }
    }, [currentFile]);

    // Tab Operations
    const openTab = useCallback((requestId: string) => {
        if (!currentFile) return;
        const request = currentFile.requests.find(r => r.id === requestId);
        if (!request) return;

        const existingTab = tabs.find(t => t.requestId === requestId);
        if (existingTab) {
            setActiveTabId(existingTab.id);
        } else {
            const newTab: TabItem = {
                id: uuidv4(),
                requestId,
                name: request.name,
                method: request.method,
                isDirty: false
            };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(newTab.id);
        }
        setViewMode('collections');
    }, [tabs, currentFile]);

    const closeTab = useCallback((tabId: string) => {
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        setTabs(prev => prev.filter(t => t.id !== tabId));

        if (activeTabId === tabId) {
            if (tabs.length > 1) {
                const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
                const newActiveTab = tabs.filter(t => t.id !== tabId)[newIndex];
                setActiveTabId(newActiveTab?.id || null);
            } else {
                setActiveTabId(null);
            }
        }
    }, [tabs, activeTabId]);

    const setActiveTab = useCallback((tabId: string) => {
        setActiveTabId(tabId);
    }, []);

    // Update tab when request changes
    useEffect(() => {
        if (activeRequest) {
            setTabs(prev => prev.map(tab =>
                tab.requestId === activeRequest.id
                    ? { ...tab, name: activeRequest.name, method: activeRequest.method }
                    : tab
            ));
        }
    }, [activeRequest?.name, activeRequest?.method]);

    // Console Logs
    const addConsoleLog = useCallback((type: ConsoleLog['type'], message: string, requestId?: string) => {
        const log: ConsoleLog = {
            id: uuidv4(),
            type,
            message,
            timestamp: new Date().toISOString(),
            requestId
        };
        setConsoleLogs(prev => [log, ...prev].slice(0, 500));
    }, []);

    const clearConsoleLogs = useCallback(() => {
        setConsoleLogs([]);
    }, []);

    // Request Operations
    const createRequest = useCallback((folderId?: string) => {
        if (!currentFile) {
            addConsoleLog('error', 'No file open. Create or open a file first.');
            return null;
        }

        const newRequest = createEmptyRequest(folderId);
        setCurrentFile(prev => prev ? {
            ...prev,
            requests: [...prev.requests, newRequest]
        } : null);
        markChanged();
        openTab(newRequest.id);
        addConsoleLog('info', `Created request${folderId ? ' in folder' : ''}: ${newRequest.name}`);
        return newRequest;
    }, [currentFile, openTab, markChanged]);

    const updateRequest = useCallback((id: string, updates: Partial<KobiRequest>) => {
        setCurrentFile(prev => prev ? {
            ...prev,
            requests: prev.requests.map(r =>
                r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
        } : null);
        markChanged();

        // Mark tab as dirty
        setTabs(prev => prev.map(tab =>
            tab.requestId === id ? { ...tab, isDirty: true } : tab
        ));
    }, [markChanged]);

    const deleteRequest = useCallback((id: string) => {
        if (!currentFile) return;

        // Close any open tabs for this request
        const tabToClose = tabs.find(t => t.requestId === id);
        if (tabToClose) {
            closeTab(tabToClose.id);
        }

        setCurrentFile(prev => prev ? {
            ...prev,
            requests: prev.requests.filter(r => r.id !== id)
        } : null);
        markChanged();
        addConsoleLog('warn', 'Deleted request');
    }, [currentFile, tabs, closeTab, markChanged]);

    const duplicateRequest = useCallback((id: string) => {
        if (!currentFile) return;
        const original = currentFile.requests.find(r => r.id === id);
        if (!original) return;

        const copy: KobiRequest = {
            ...original,
            id: uuidv4(),
            name: `${original.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setCurrentFile(prev => prev ? {
            ...prev,
            requests: [...prev.requests, copy]
        } : null);
        markChanged();
        openTab(copy.id);
        addConsoleLog('info', `Duplicated: ${original.name}`);
    }, [currentFile, openTab, markChanged]);

    const archiveRequest = useCallback((id: string) => {
        updateRequest(id, { isArchived: true });
        const tabToClose = tabs.find(t => t.requestId === id);
        if (tabToClose) {
            closeTab(tabToClose.id);
        }
        addConsoleLog('info', 'Archived request');
    }, [updateRequest, tabs, closeTab]);

    const restoreRequest = useCallback((id: string) => {
        updateRequest(id, { isArchived: false });
        addConsoleLog('info', 'Restored request');
    }, [updateRequest]);

    const moveRequestToFolder = useCallback((requestId: string, folderId: string | null) => {
        updateRequest(requestId, { folderId: folderId || undefined });
        addConsoleLog('info', folderId ? 'Moved to folder' : 'Moved to root');
    }, [updateRequest]);

    // Folder Operations
    const createFolder = useCallback((name: string, parentId?: string) => {
        if (!currentFile) {
            addConsoleLog('error', 'No file open');
            return;
        }

        const newFolder: Folder = { id: uuidv4(), name, parentId, collapsed: false };
        setCurrentFile(prev => prev ? {
            ...prev,
            folders: [...prev.folders, newFolder]
        } : null);
        markChanged();
        addConsoleLog('info', `Created folder: ${name}`);
    }, [currentFile, markChanged]);

    const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
        setCurrentFile(prev => prev ? {
            ...prev,
            folders: prev.folders.map(f => f.id === id ? { ...f, ...updates } : f)
        } : null);
        markChanged();
    }, [markChanged]);

    const deleteFolder = useCallback((id: string) => {
        if (!currentFile) return;

        setCurrentFile(prev => prev ? {
            ...prev,
            folders: prev.folders.filter(f => f.id !== id),
            requests: prev.requests.map(r => r.folderId === id ? { ...r, folderId: undefined } : r)
        } : null);
        markChanged();
        addConsoleLog('warn', 'Deleted folder');
    }, [currentFile, markChanged]);

    const toggleFolderCollapse = useCallback((id: string) => {
        setCurrentFile(prev => {
            if (!prev) return null;
            const folder = prev.folders.find(f => f.id === id);
            if (!folder) return prev;
            return {
                ...prev,
                folders: prev.folders.map(f => f.id === id ? { ...f, collapsed: !f.collapsed } : f)
            };
        });
    }, []);

    // Environment Operations
    const createEnvironment = useCallback((name: string) => {
        if (!currentFile) return;

        const newEnv: Environment = { id: uuidv4(), name, variables: [] };
        setCurrentFile(prev => prev ? {
            ...prev,
            environments: [...prev.environments, newEnv]
        } : null);
        markChanged();
        addConsoleLog('info', `Created environment: ${name}`);
    }, [currentFile, markChanged]);

    const updateEnvironment = useCallback((id: string, updates: Partial<Environment>) => {
        setCurrentFile(prev => prev ? {
            ...prev,
            environments: prev.environments.map(e => e.id === id ? { ...e, ...updates } : e)
        } : null);
        markChanged();
    }, [markChanged]);

    const deleteEnvironment = useCallback((id: string) => {
        if (!currentFile) return;

        setCurrentFile(prev => prev ? {
            ...prev,
            environments: prev.environments.filter(e => e.id !== id),
            activeEnvironmentId: prev.activeEnvironmentId === id ? null : prev.activeEnvironmentId
        } : null);
        markChanged();
        addConsoleLog('warn', 'Deleted environment');
    }, [currentFile, markChanged]);

    const setActiveEnvironment = useCallback((id: string | null) => {
        setCurrentFile(prev => prev ? {
            ...prev,
            activeEnvironmentId: id
        } : null);
        markChanged();
        const env = currentFile?.environments.find(e => e.id === id);
        if (env) {
            addConsoleLog('info', `Environment: ${env.name}`);
        }
    }, [currentFile, markChanged]);

    const duplicateEnvironment = useCallback((id: string) => {
        if (!currentFile) return;
        const original = currentFile.environments.find(e => e.id === id);
        if (!original) return;

        const copy: Environment = {
            ...original,
            id: uuidv4(),
            name: `${original.name} (Copy)`,
            variables: [...original.variables]
        };

        setCurrentFile(prev => prev ? {
            ...prev,
            environments: [...prev.environments, copy]
        } : null);
        markChanged();
        addConsoleLog('info', `Duplicated environment: ${original.name}`);
    }, [currentFile, markChanged]);

    const getActiveEnvironment = useCallback(() => {
        return currentFile?.environments.find(e => e.id === currentFile.activeEnvironmentId) || null;
    }, [currentFile]);

    // Variable Resolution
    const resolveVariables = useCallback((text: string): string => {
        if (!text) return text;
        const env = getActiveEnvironment();
        if (!env) return text;

        let result = text;
        env.variables.filter(v => v.enabled).forEach(v => {
            result = result.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
        });
        return result;
    }, [getActiveEnvironment]);

    // Request Execution
    const sendRequest = useCallback(async () => {
        if (!activeRequest || !currentFile) return;

        setIsLoading(true);
        setResponse(null);
        addConsoleLog('info', `Sending ${activeRequest.method} ${activeRequest.url}`, activeRequest.id);

        const controller = new AbortController();
        setAbortController(controller);

        const startTime = Date.now();

        try {
            let url = resolveVariables(activeRequest.url);

            const activeParams = activeRequest.params.filter(p => p.enabled && p.key);
            if (activeParams.length > 0) {
                const queryString = activeParams
                    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(resolveVariables(p.value))}`)
                    .join('&');
                url += (url.includes('?') ? '&' : '?') + queryString;
            }

            const headers: Record<string, string> = {};
            activeRequest.headers.filter(h => h.enabled && h.key).forEach(h => {
                headers[h.key] = resolveVariables(h.value);
            });

            if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                headers['Authorization'] = `Bearer ${activeRequest.auth.token}`;
            } else if (activeRequest.auth.type === 'basic' && activeRequest.auth.username) {
                const encoded = btoa(`${activeRequest.auth.username}:${activeRequest.auth.password || ''}`);
                headers['Authorization'] = `Basic ${encoded}`;
            } else if (activeRequest.auth.type === 'api-key' && activeRequest.auth.apiKey) {
                headers[activeRequest.auth.apiKeyHeader || 'X-API-Key'] = activeRequest.auth.apiKey;
            }

            const fetchResponse = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    method: activeRequest.method,
                    headers,
                    body: activeRequest.body.type !== 'none' ? resolveVariables(activeRequest.body.content) : undefined,
                    timeout: currentFile.settings.timeout
                }),
                signal: controller.signal
            });

            const result = await fetchResponse.json();
            const endTime = Date.now();
            const duration = result.time || (endTime - startTime);

            const responseData: ResponseData = {
                status: result.status || 0,
                statusText: result.statusText || '',
                time: duration,
                size: result.size || '0 B',
                sizeBytes: result.sizeBytes || 0,
                headers: result.headers || {},
                cookies: result.cookies || {},
                data: result.data,
                rawBody: result.rawBody
            };

            setResponse(responseData);

            const statusType = responseData.status >= 200 && responseData.status < 300 ? 'success' : 'error';
            addConsoleLog(statusType, `${activeRequest.method} ${url} - ${responseData.status} (${duration}ms)`, activeRequest.id);

            // Add to history
            const historyItem: HistoryItem = {
                id: uuidv4(),
                requestId: activeRequest.id,
                requestName: activeRequest.name,
                method: activeRequest.method,
                url: activeRequest.url,
                timestamp: new Date().toISOString(),
                duration,
                response: responseData
            };
            setHistory(prev => [historyItem, ...prev].slice(0, 100));

            // Mark tab as not dirty
            setTabs(prev => prev.map(tab =>
                tab.requestId === activeRequest.id ? { ...tab, isDirty: false } : tab
            ));

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                const errorResponse: ResponseData = {
                    status: 0,
                    statusText: 'Error',
                    time: Date.now() - startTime,
                    size: '0 B',
                    sizeBytes: 0,
                    headers: {},
                    cookies: {},
                    data: { error: error.message }
                };
                setResponse(errorResponse);
                addConsoleLog('error', `Failed: ${error.message}`, activeRequest.id);
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    }, [activeRequest, currentFile, resolveVariables, addConsoleLog]);

    const cancelRequest = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setIsLoading(false);
            setAbortController(null);
            addConsoleLog('warn', 'Request cancelled');
        }
    }, [abortController, addConsoleLog]);

    // History
    const clearHistory = useCallback(() => {
        setHistory([]);
        addConsoleLog('info', 'Cleared history');
    }, [addConsoleLog]);

    const deleteHistoryItem = useCallback((id: string) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    }, []);

    // Import/Export
    const importPostmanCollection = useCallback((file: File) => {
        if (!currentFile) {
            addConsoleLog('error', 'Open a file first');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const postman = JSON.parse(e.target?.result as string);
                const requests: KobiRequest[] = [];
                const folders: Folder[] = [];

                const parseItems = (items: any[], folderId?: string) => {
                    items.forEach(item => {
                        if (item.item) {
                            const folder: Folder = { id: uuidv4(), name: item.name, parentId: folderId, collapsed: false };
                            folders.push(folder);
                            parseItems(item.item, folder.id);
                        } else if (item.request) {
                            const req = item.request;
                            const newReq: KobiRequest = {
                                id: uuidv4(),
                                name: item.name,
                                method: (req.method || 'GET') as any,
                                url: typeof req.url === 'string' ? req.url : req.url?.raw || '',
                                folderId,
                                headers: (req.header || []).map((h: any) => ({
                                    id: uuidv4(),
                                    key: h.key,
                                    value: h.value,
                                    description: h.description || '',
                                    enabled: !h.disabled
                                })),
                                params: [],
                                body: {
                                    type: req.body?.mode === 'raw' ? 'json' : 'none',
                                    content: req.body?.raw || ''
                                },
                                auth: { type: 'none' },
                                preRequestScript: '',
                                testScript: '',
                                isArchived: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                            requests.push(newReq);
                        }
                    });
                };

                if (postman.item) {
                    parseItems(postman.item);
                }

                setCurrentFile(prev => prev ? {
                    ...prev,
                    requests: [...prev.requests, ...requests],
                    folders: [...prev.folders, ...folders]
                } : null);
                markChanged();

                addConsoleLog('success', `Imported ${requests.length} requests from Postman`);
            } catch (err) {
                addConsoleLog('error', 'Failed to import Postman collection');
            }
        };
        reader.readAsText(file);
    }, [currentFile, markChanged, addConsoleLog]);

    const exportAsPostman = useCallback(() => {
        if (!currentFile) return;

        const postmanCollection = {
            info: {
                name: currentFile.name,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: currentFile.requests.filter(r => !r.isArchived).map(req => ({
                name: req.name,
                request: {
                    method: req.method,
                    header: req.headers.filter(h => h.enabled).map(h => ({
                        key: h.key,
                        value: h.value,
                        description: h.description
                    })),
                    url: { raw: req.url, host: [req.url] },
                    body: req.body.type !== 'none' ? { mode: 'raw', raw: req.body.content } : undefined
                }
            }))
        };

        const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFile.name.toLowerCase().replace(/\s+/g, '-')}.postman_collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addConsoleLog('success', 'Exported as Postman collection');
    }, [currentFile, addConsoleLog]);

    // Code Generation
    const generateCode = useCallback((language: string): string => {
        if (!activeRequest) return '';

        const url = resolveVariables(activeRequest.url);
        const headers = activeRequest.headers.filter(h => h.enabled && h.key);
        const body = activeRequest.body.type !== 'none' ? resolveVariables(activeRequest.body.content) : null;

        switch (language) {
            case 'curl':
                let curl = `curl -X ${activeRequest.method} "${url}"`;
                headers.forEach(h => {
                    curl += ` \\\n  -H "${h.key}: ${resolveVariables(h.value)}"`;
                });
                if (body) curl += ` \\\n  -d '${body}'`;
                return curl;

            case 'javascript':
                return `fetch("${url}", {
  method: "${activeRequest.method}",
  headers: {
${headers.map(h => `    "${h.key}": "${resolveVariables(h.value)}"`).join(',\n')}
  }${body ? `,\n  body: JSON.stringify(${body})` : ''}
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);`;

            case 'python':
                return `import requests

response = requests.${activeRequest.method.toLowerCase()}(
    "${url}",
    headers={
${headers.map(h => `        "${h.key}": "${resolveVariables(h.value)}"`).join(',\n')}
    }${body ? `,\n    json=${body}` : ''}
)
print(response.json())`;

            default:
                return '';
        }
    }, [activeRequest, resolveVariables]);

    // Context Menu
    const showContextMenu = useCallback((x: number, y: number, targetId: string | null, panelType: PanelType) => {
        setContextMenu({ visible: true, x, y, targetId, panelType });
    }, []);

    const hideContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;

            if (isMod && e.key === 'n') {
                e.preventDefault();
                if (currentFile) {
                    createRequest();
                } else {
                    // Show create file dialog
                    const name = prompt('Enter file name:', 'My API Collection');
                    if (name) createNewFile(name);
                }
            }
            if (isMod && e.key === 's') {
                e.preventDefault();
                if (currentFile) saveFile();
            }
            if (isMod && e.key === 'Enter') {
                e.preventDefault();
                if (activeRequest) sendRequest();
            }
            if (isMod && e.key === 'e' && currentFile) {
                e.preventDefault();
                setViewMode('environments');
            }
            if (isMod && e.key === 'h') {
                e.preventDefault();
                setViewMode('history');
            }
            if (isMod && e.key === 'w' && activeTabId) {
                e.preventDefault();
                closeTab(activeTabId);
            }
            if (isMod && e.key === '`') {
                e.preventDefault();
                setShowBottomPanel(prev => !prev);
            }
            if (e.key === 'Escape') {
                hideContextMenu();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentFile, activeRequest, activeTabId, createRequest, createNewFile, saveFile, sendRequest, closeTab, hideContextMenu]);

    // Click outside to close context menu
    useEffect(() => {
        const handleClick = () => hideContextMenu();
        if (contextMenu.visible) {
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }
    }, [contextMenu.visible, hideContextMenu]);

    return (
        <WorkspaceContext.Provider value={{
            currentFile,
            hasUnsavedChanges,
            recentFiles,
            createNewFile,
            openFile,
            saveFile,
            saveFileAs,
            closeFile,
            viewMode,
            setViewMode,
            sidebarCollapsed,
            setSidebarCollapsed,
            bottomPanelHeight,
            setBottomPanelHeight,
            showBottomPanel,
            setShowBottomPanel,
            tabs,
            activeTabId,
            openTab,
            closeTab,
            setActiveTab,
            activeRequestId,
            setActiveRequestId,
            activeRequest,
            createRequest,
            updateRequest,
            deleteRequest,
            duplicateRequest,
            archiveRequest,
            restoreRequest,
            moveRequestToFolder,
            createFolder,
            updateFolder,
            deleteFolder,
            toggleFolderCollapse,
            createEnvironment,
            updateEnvironment,
            deleteEnvironment,
            setActiveEnvironment,
            duplicateEnvironment,
            sendRequest,
            cancelRequest,
            response,
            isLoading,
            consoleLogs,
            addConsoleLog,
            clearConsoleLogs,
            history,
            clearHistory,
            deleteHistoryItem,
            importPostmanCollection,
            exportAsPostman,
            contextMenu,
            showContextMenu,
            hideContextMenu,
            generateCode,
            resolveVariables,
            getActiveEnvironment
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
