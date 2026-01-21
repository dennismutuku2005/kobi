'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Copy, Check, ChevronDown, Code, ArrowLeft, AlertCircle } from 'lucide-react';

const languages = [
    { id: 'curl', name: 'cURL', icon: '🔄' },
    { id: 'javascript', name: 'JavaScript (Fetch)', icon: '🟨' },
    { id: 'python', name: 'Python (Requests)', icon: '🐍' },
    { id: 'nodejs', name: 'Node.js (Axios)', icon: '🟢' },
    { id: 'php', name: 'PHP (cURL)', icon: '🐘' }
];

export const CodeGenerator = () => {
    const { activeRequest, currentFile, generateCode, setViewMode, resolveVariables } = useWorkspace();
    const [selectedLanguage, setSelectedLanguage] = useState('curl');
    const [copied, setCopied] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleCopy = () => {
        const code = generateCodeForLanguage();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateCodeForLanguage = (): string => {
        if (!activeRequest) return '';

        const url = resolveVariables(activeRequest.url);
        const headers = activeRequest.headers.filter(h => h.enabled && h.key);
        const body = activeRequest.body.type !== 'none' ? resolveVariables(activeRequest.body.content) : null;

        switch (selectedLanguage) {
            case 'curl':
                let curl = `curl -X ${activeRequest.method} \\
  "${url}"`;
                headers.forEach(h => {
                    curl += ` \\
  -H "${h.key}: ${resolveVariables(h.value)}"`;
                });
                if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                    curl += ` \\
  -H "Authorization: Bearer ${activeRequest.auth.token}"`;
                }
                if (body) {
                    curl += ` \\
  -d '${body}'`;
                }
                return curl;

            case 'javascript':
                let jsCode = `fetch("${url}", {
  method: "${activeRequest.method}",
  headers: {`;
                headers.forEach((h, i) => {
                    jsCode += `\n    "${h.key}": "${resolveVariables(h.value)}"${i < headers.length - 1 ? ',' : ''}`;
                });
                if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                    jsCode += `${headers.length > 0 ? ',' : ''}\n    "Authorization": "Bearer ${activeRequest.auth.token}"`;
                }
                jsCode += `\n  }`;
                if (body) {
                    jsCode += `,\n  body: JSON.stringify(${body})`;
                }
                jsCode += `
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
                return jsCode;

            case 'python':
                let pyCode = `import requests

url = "${url}"
headers = {`;
                headers.forEach((h, i) => {
                    pyCode += `\n    "${h.key}": "${resolveVariables(h.value)}"${i < headers.length - 1 ? ',' : ''}`;
                });
                if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                    pyCode += `${headers.length > 0 ? ',' : ''}\n    "Authorization": "Bearer ${activeRequest.auth.token}"`;
                }
                pyCode += `\n}

response = requests.${activeRequest.method.toLowerCase()}(url, headers=headers`;
                if (body) {
                    pyCode += `, json=${body}`;
                }
                pyCode += `)
print(response.json())`;
                return pyCode;

            case 'nodejs':
                let nodeCode = `const axios = require('axios');

axios({
  method: '${activeRequest.method.toLowerCase()}',
  url: '${url}',
  headers: {`;
                headers.forEach((h, i) => {
                    nodeCode += `\n    '${h.key}': '${resolveVariables(h.value)}'${i < headers.length - 1 ? ',' : ''}`;
                });
                if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                    nodeCode += `${headers.length > 0 ? ',' : ''}\n    'Authorization': 'Bearer ${activeRequest.auth.token}'`;
                }
                nodeCode += `\n  }`;
                if (body) {
                    nodeCode += `,\n  data: ${body}`;
                }
                nodeCode += `
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
                return nodeCode;

            case 'php':
                let phpCode = `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${activeRequest.method}",
  CURLOPT_HTTPHEADER => [`;
                headers.forEach((h, i) => {
                    phpCode += `\n    "${h.key}: ${resolveVariables(h.value)}"${i < headers.length - 1 ? ',' : ''}`;
                });
                if (activeRequest.auth.type === 'bearer' && activeRequest.auth.token) {
                    phpCode += `${headers.length > 0 ? ',' : ''}\n    "Authorization: Bearer ${activeRequest.auth.token}"`;
                }
                phpCode += `\n  ]`;
                if (body) {
                    phpCode += `,\n  CURLOPT_POSTFIELDS => '${body}'`;
                }
                phpCode += `
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;`;
                return phpCode;

            default:
                return '';
        }
    };

    const selectedLang = languages.find(l => l.id === selectedLanguage);

    if (!currentFile || !activeRequest) {
        return (
            <div className="code-generator empty">
                <div className="empty-state">
                    <AlertCircle size={28} />
                    <h3>No Request Selected</h3>
                    <p>Select a request to generate code</p>
                    <button className="btn btn-primary" onClick={() => setViewMode('collections')}>
                        <ArrowLeft size={14} />
                        Back to Collections
                    </button>
                </div>

                <style jsx>{`
                    .code-generator.empty {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-primary);
                        padding: 40px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="code-generator">
            {/* Header */}
            <div className="generator-header">
                <button className="back-btn" onClick={() => setViewMode('collections')}>
                    <ArrowLeft size={16} />
                    <span>Back to Request</span>
                </button>
                <div className="header-info">
                    <Code size={20} />
                    <h2>Code Generation</h2>
                </div>
            </div>

            {/* Request Info */}
            <div className="request-info">
                <span className={`method ${activeRequest.method.toLowerCase()}`}>
                    {activeRequest.method}
                </span>
                <span className="url">{activeRequest.url || 'No URL'}</span>
            </div>

            {/* Language Selector */}
            <div className="language-section">
                <label>Language</label>
                <div className="language-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
                    <span className="lang-icon">{selectedLang?.icon}</span>
                    <span className="lang-name">{selectedLang?.name}</span>
                    <ChevronDown size={14} />

                    {showDropdown && (
                        <div className="dropdown-menu">
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    className={`dropdown-item ${selectedLanguage === lang.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedLanguage(lang.id);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <span className="lang-icon">{lang.icon}</span>
                                    <span>{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Code Output */}
            <div className="code-section">
                <div className="code-header">
                    <span>Generated Code</span>
                    <button className="copy-btn" onClick={handleCopy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
                <pre className="code-block">
                    <code>{generateCodeForLanguage()}</code>
                </pre>
            </div>

            <style jsx>{`
                .code-generator {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    overflow: hidden;
                }

                .generator-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    color: var(--text-secondary);
                    font-size: 13px;
                }

                .back-btn:hover {
                    color: var(--text-primary);
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-left: 16px;
                    border-left: 1px solid var(--border-secondary);
                }

                .header-info h2 {
                    font-size: 16px;
                }

                .request-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-primary);
                }

                .method {
                    font-family: var(--font-mono);
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                }

                .method.get { background: var(--success-muted); color: var(--success); }
                .method.post { background: var(--warning-muted); color: var(--warning); }
                .method.put { background: var(--info-muted); color: var(--info); }
                .method.patch { background: rgba(168, 85, 247, 0.12); color: #A855F7; }
                .method.delete { background: var(--error-muted); color: var(--error); }

                .url {
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .language-section {
                    padding: 16px 24px;
                }

                .language-section label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .language-dropdown {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    position: relative;
                    max-width: 300px;
                }

                .language-dropdown:hover {
                    border-color: var(--border-focus);
                }

                .lang-icon {
                    font-size: 16px;
                }

                .lang-name {
                    flex: 1;
                    font-size: 13px;
                }

                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    right: 0;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    padding: 4px;
                    z-index: 10;
                    box-shadow: var(--shadow-lg);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 13px;
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

                .code-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    margin: 0 24px 24px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bg-tertiary);
                    border-bottom: 1px solid var(--border-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .copy-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .copy-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .code-block {
                    flex: 1;
                    overflow: auto;
                    margin: 0;
                    padding: 16px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.6;
                    background: transparent;
                    border: none;
                }

                .code-block code {
                    color: var(--text-primary);
                    white-space: pre-wrap;
                    word-break: break-word;
                }
            `}</style>
        </div>
    );
};
