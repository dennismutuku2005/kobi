'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ResizeHandleProps {
    direction: 'horizontal' | 'vertical';
    onResize: (delta: number) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startPosRef = useRef(0);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = direction === 'horizontal'
                ? e.clientX - startPosRef.current
                : e.clientY - startPosRef.current;
            startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
            onResize(delta);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, direction, onResize]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    };

    return (
        <div
            className={`resize-handle ${direction} ${isDragging ? 'active' : ''}`}
            onMouseDown={handleMouseDown}
        >
            <div className="resize-line" />

            <style jsx>{`
                .resize-handle {
                    position: relative;
                    flex-shrink: 0;
                    z-index: 10;
                }

                .resize-handle.horizontal {
                    width: 5px;
                    cursor: col-resize;
                }

                .resize-handle.vertical {
                    height: 5px;
                    cursor: row-resize;
                }

                .resize-line {
                    position: absolute;
                    background: var(--border-primary);
                    transition: background 0.15s;
                }

                .resize-handle.horizontal .resize-line {
                    width: 1px;
                    height: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .resize-handle.vertical .resize-line {
                    height: 1px;
                    width: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .resize-handle:hover .resize-line,
                .resize-handle.active .resize-line {
                    background: var(--primary);
                }

                .resize-handle.horizontal:hover .resize-line,
                .resize-handle.horizontal.active .resize-line {
                    width: 3px;
                }

                .resize-handle.vertical:hover .resize-line,
                .resize-handle.vertical.active .resize-line {
                    height: 3px;
                }
            `}</style>
        </div>
    );
};
