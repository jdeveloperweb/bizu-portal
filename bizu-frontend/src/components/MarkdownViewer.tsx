import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

interface Highlight {
    id: string;
    text: string;
    color?: string;
}

interface MarkdownViewerProps {
    content: string;
    className?: string;
    highlights?: Highlight[];
}

export default function MarkdownViewer({ content, className, highlights = [] }: MarkdownViewerProps) {
    // Process content to inject <mark> tags for highlights
    const getProcessedContent = () => {
        if (!highlights || highlights.length === 0) return content;

        let processed = content;

        // Sort by length to avoid partial replacements of longer phrases
        const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);

        sorted.forEach(h => {
            if (!h.text || h.text.trim().length < 3) return; // Ignore very short markings to avoid noise

            // Escape regex and replace
            const safeText = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${safeText})`, 'gi');

            // We use a specific class for styling. Tailwinding here for consistency.
            processed = processed.replace(regex, `<mark class="highlight-item" data-id="${h.id}">$1</mark>`);
        });

        return processed;
    };

    return (
        <div
            className={cn("markdown-viewer prose dark:prose-invert max-w-none print:hidden", className)}
            onCopy={(e) => {
                e.preventDefault();
                // Bloqueia a cópia para a área de transferência
            }}
            onCut={(e) => {
                e.preventDefault();
            }}
        >
            <style jsx global>{`
                .highlight-item {
                    background-color: rgba(250, 204, 21, 0.4);
                    border-bottom: 2px solid #eab308;
                    border-radius: 2px;
                    padding: 0 2px;
                    color: inherit;
                    cursor: help;
                    transition: all 0.2s;
                }
                .highlight-item:hover {
                    background-color: rgba(250, 204, 21, 0.6);
                }
                .dark .highlight-item {
                    background-color: rgba(234, 179, 8, 0.2);
                    border-bottom-color: #ca8a04;
                }
            `}</style>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {getProcessedContent()}
            </ReactMarkdown>
        </div>
    );
}
