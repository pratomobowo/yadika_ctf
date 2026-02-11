import { useState, useRef, useEffect, useCallback } from 'react';

export interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system';
}

export const useTerminalShell = (initialLines: TerminalLine[] = []) => {
    const [lines, setLines] = useState<TerminalLine[]>(initialLines);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [lines, scrollToBottom]);

    const addLines = (newLines: TerminalLine[]) => {
        setLines(prev => [...prev, ...newLines]);
    };

    const clearLines = () => setLines([]);

    const handleHistory = (key: string) => {
        if (key === 'ArrowUp') {
            if (history.length > 0) {
                const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex] || '');
            }
        } else if (key === 'ArrowDown') {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    return {
        lines,
        setLines,
        input,
        setInput,
        addLines,
        clearLines,
        history,
        setHistory,
        historyIndex,
        setHistoryIndex,
        handleHistory,
        scrollRef,
        inputRef,
        scrollToBottom
    };
};
