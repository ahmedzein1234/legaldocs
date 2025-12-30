'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Table as TableIcon,
  Highlighter,
  Type,
  Pilcrow,
  MoreHorizontal,
  Plus,
  Minus,
  SeparatorHorizontal,
  Variable,
} from 'lucide-react';
import { VariablePicker } from './variable-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Custom extension for legal paragraph numbering
const LegalNumbering = Extension.create({
  name: 'legalNumbering',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          'data-article': {
            default: null,
            parseHTML: element => element.getAttribute('data-article'),
            renderHTML: attributes => {
              if (!attributes['data-article']) return {};
              return { 'data-article': attributes['data-article'] };
            },
          },
          'data-clause': {
            default: null,
            parseHTML: element => element.getAttribute('data-clause'),
            renderHTML: attributes => {
              if (!attributes['data-clause']) return {};
              return { 'data-clause': attributes['data-clause'] };
            },
          },
        },
      },
    ];
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  direction?: 'ltr' | 'rtl';
  className?: string;
  minHeight?: string;
}

export function TiptapEditor({
  content,
  onChange,
  onHtmlChange,
  placeholder = 'Start typing your document...',
  editable = true,
  direction = 'ltr',
  className,
  minHeight = '400px',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'legal-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      LegalNumbering,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none dark:prose-invert focus:outline-none',
          'prose-headings:font-bold prose-headings:text-foreground',
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:my-0',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-table:border-collapse prose-table:w-full',
          'prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted',
          'prose-td:border prose-td:border-border prose-td:p-2',
          direction === 'rtl' && 'text-right',
          className
        ),
        dir: direction,
        style: `min-height: ${minHeight}; padding: 1rem;`,
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const html = editor.getHTML();
      onChange(text);
      // Sanitize HTML output to prevent XSS attacks
      onHtmlChange?.(sanitizeHtml(html));
    },
  });

  // Update content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update direction when prop changes
  React.useEffect(() => {
    if (editor) {
      editor.view.dom.setAttribute('dir', direction);
    }
  }, [direction, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-muted rounded-lg" style={{ minHeight }} />
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1">
        {/* Text Style Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Heading Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                <Type className="h-4 w-4" />
                <span className="text-xs">
                  {editor.isActive('heading', { level: 1 })
                    ? 'H1'
                    : editor.isActive('heading', { level: 2 })
                    ? 'H2'
                    : editor.isActive('heading', { level: 3 })
                    ? 'H3'
                    : 'Text'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <Pilcrow className="h-4 w-4 mr-2" />
                Normal Text
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1 - Article
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2 - Section
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3 - Clause
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote/Recital"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Table & Insert Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <TableIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Insert Table (3x3)
              </DropdownMenuItem>
              {editor.isActive('table') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                    Add Column After
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                    Add Column Before
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                    Add Row After
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                    Add Row Before
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                    Delete Row
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()}>
                    <Minus className="h-4 w-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <SeparatorHorizontal className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Variable Picker */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <VariablePicker
            onInsert={(placeholder) => {
              editor.chain().focus().insertContent(placeholder).run();
            }}
            language={direction === 'rtl' ? 'ar' : 'en'}
          />
        </div>

        {/* Legal Document Shortcuts */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                + Legal
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent({
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'ARTICLE [X]: [Title]' }],
                  }).run();
                }}
              >
                Insert Article
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent({
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Section [X.X]: [Title]' }],
                  }).run();
                }}
              >
                Insert Section
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent({
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Clause [X.X.X]:' }],
                  }).run();
                }}
              >
                Insert Clause
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent(`

WHEREAS, [First Party] desires to [purpose]; and

WHEREAS, [Second Party] agrees to [terms]; and

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

`).run();
                }}
              >
                Insert Recitals (Whereas)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent(`

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________
[Party A Name]
Date: _______________

_______________________________
[Party B Name]
Date: _______________

`).run();
                }}
              >
                Insert Signature Block
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent(`

WITNESSES:

1. _______________________________
   Name:
   ID Number:

2. _______________________________
   Name:
   ID Number:

`).run();
                }}
              >
                Insert Witness Block
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  editor.chain().focus().insertContent(`

SCHEDULE A
[Schedule Title]

| Item | Description | Value |
|------|-------------|-------|
|      |             |       |
|      |             |       |

`).run();
                }}
              >
                Insert Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="overflow-y-auto" style={{ maxHeight: '60vh' }} />

      {/* Footer with word count */}
      <div className="border-t bg-muted/30 px-3 py-1 flex justify-between text-xs text-muted-foreground">
        <span>
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters
        </span>
        <span>
          {editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'default';
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  size = 'default',
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      className={cn(
        size === 'sm' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0',
        active && 'bg-primary/20 text-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export default TiptapEditor;
