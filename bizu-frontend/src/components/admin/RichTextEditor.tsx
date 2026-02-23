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
    Link as LinkIcon
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
        className={`p-2 rounded-lg transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
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
        <div className="w-full border rounded-[32px] overflow-hidden bg-card focus-within:border-primary transition-all">
            <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-muted/30">
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
                <div className="w-px h-6 bg-border mx-1" />
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
                <div className="w-px h-6 bg-border mx-1" />
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
                <div className="flex-grow" />
                <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </MenuButton>
            </div>
            <div className="p-6 min-h-[250px] prose dark:prose-invert max-w-none prose-sm focus:outline-none">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
