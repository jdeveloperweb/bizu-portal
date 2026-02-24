"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Type
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuButton = ({
    onClick,
    isActive,
    children
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode
}) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'hover:bg-primary/10 hover:text-primary text-muted-foreground'}`}
    >
        {children}
    </button>
);

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: placeholder || 'Escreva o enunciado aqui...' }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="w-full bg-card group/editor">
            <div className="flex flex-wrap items-center gap-1.5 p-4 border-b border-muted bg-muted/20 backdrop-blur-sm transition-colors group-focus-within/editor:bg-white group-focus-within/editor:border-primary/10">
                <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-muted/50">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                    >
                        <Bold className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                    >
                        <Italic className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-muted/50">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                    >
                        <Heading1 className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                    >
                        <Heading2 className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-muted/50">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                    >
                        <List className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                    >
                        <Quote className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex-grow" />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                        <Undo className="w-4 h-4 text-muted-foreground/60" />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                        <Redo className="w-4 h-4 text-muted-foreground/60" />
                    </MenuButton>
                </div>
            </div>
            <div className="p-8 min-h-[300px] prose dark:prose-invert max-w-none prose-lg focus:outline-none selection:bg-primary/20 transition-all font-medium text-slate-700 leading-relaxed">
                <style jsx global>{`
                    .ProseMirror p.is-editor-empty:first-child::before {
                        content: attr(data-placeholder);
                        float: left;
                        color: #adb5bd;
                        pointer-events: none;
                        height: 0;
                        font-style: italic;
                    }
                    .ProseMirror:focus {
                        outline: none;
                    }
                `}</style>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
