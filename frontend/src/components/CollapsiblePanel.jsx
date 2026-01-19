import { useState } from 'react';

/**
 * 可折叠面板组件
 * Collapsible Panel Component
 */
function CollapsiblePanel({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="panel">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left font-medium text-lg mb-2"
            >
                <span>{title}</span>
                <span className="text-2xl">{isOpen ? '−' : '+'}</span>
            </button>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
}

export default CollapsiblePanel;
