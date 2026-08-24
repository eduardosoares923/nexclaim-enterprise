import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
}

const BotaoBarra: React.FC<{
  ativo?: boolean;
  onClick: () => void;
  titulo: string;
  children: React.ReactNode;
}> = ({ ativo, onClick, titulo, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={titulo}
    className={`w-8 h-8 rounded text-xs flex items-center justify-center transition cursor-pointer border ${
      ativo
        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onEditorReady }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onCreate: ({ editor }) => onEditorReady?.(editor),
    editorProps: {
      attributes: {
        class: 'prose-documento focus:outline-none min-h-[420px] px-6 py-5',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
        <BotaoBarra titulo="Título Principal" ativo={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </BotaoBarra>
        <BotaoBarra titulo="Seção" ativo={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </BotaoBarra>
        <BotaoBarra titulo="Texto normal" ativo={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <i className="fa-solid fa-paragraph"></i>
        </BotaoBarra>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <BotaoBarra titulo="Negrito" ativo={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <i className="fa-solid fa-bold"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Itálico" ativo={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i className="fa-solid fa-italic"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Sublinhado" ativo={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <i className="fa-solid fa-underline"></i>
        </BotaoBarra>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <BotaoBarra titulo="Lista com marcadores" ativo={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <i className="fa-solid fa-list-ul"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Lista numerada" ativo={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <i className="fa-solid fa-list-ol"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Aumentar recuo" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          <i className="fa-solid fa-indent"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Diminuir recuo" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
          <i className="fa-solid fa-outdent"></i>
        </BotaoBarra>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <BotaoBarra titulo="Alinhar à esquerda" ativo={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <i className="fa-solid fa-align-left"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Centralizar" ativo={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <i className="fa-solid fa-align-center"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Justificar" ativo={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <i className="fa-solid fa-align-justify"></i>
        </BotaoBarra>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <BotaoBarra titulo="Linha de assinatura" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <i className="fa-solid fa-minus"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <i className="fa-solid fa-rotate-left"></i>
        </BotaoBarra>
        <BotaoBarra titulo="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <i className="fa-solid fa-rotate-right"></i>
        </BotaoBarra>
      </div>

      <div className="max-h-[520px] overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
