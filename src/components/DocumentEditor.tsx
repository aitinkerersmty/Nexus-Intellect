"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, FileText, Image as ImageIcon, Italic, Link, List, ListOrdered, Paperclip, Quote, Redo2, Save, Underline, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Attachment = { id: string; name: string; type: string; size: number };
type Props = { title: string; initialContent: string; onChange?: (content: string) => void };

const fallback = "<h1>Borrador de investigación</h1><p>Escribe una idea, selecciona evidencia del grafo o pregunta a Nexus para comenzar.</p><h2>Hipótesis de trabajo</h2><p>El modelo relaciona el desempeño del motor, las pérdidas de misión y la geometría de grano como un sistema de decisiones trazable.</p><blockquote>Las afirmaciones deben enlazarse a fuentes verificables dentro del corpus.</blockquote>";

export function DocumentEditor({ title, initialContent, onChange }: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState("Guardado localmente");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => { if (editor.current && !editor.current.innerHTML) editor.current.innerHTML = initialContent || fallback; }, [initialContent]);
  function execute(command: string, value?: string) { editor.current?.focus(); document.execCommand(command, false, value); save(); }
  function save() { const content = editor.current?.innerHTML ?? ""; onChange?.(content); setSaved("Guardando…"); window.setTimeout(() => setSaved("Guardado localmente"), 550); }
  async function addFile(file: File) {
    const attachment = { id: `${file.name}-${Date.now()}`, name: file.name, type: file.type || "documento", size: file.size };
    setAttachments((items) => [...items, attachment]);
    if (file.type.startsWith("image/")) {
      const url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      editor.current?.focus(); document.execCommand("insertHTML", false, `<img src="${url}" alt="${file.name}" /><p></p>`);
    } else {
      editor.current?.focus(); document.execCommand("insertHTML", false, `<span class="nx-attachment">📎 ${file.name} · ${attachment.type}</span><p></p>`);
      if (/\.(md|txt)$/i.test(file.name)) { const text = await file.text(); document.execCommand("insertText", false, `\n${text.slice(0, 6000)}\n`); }
    }
    save();
  }
  function insertLink() { const url = window.prompt("URL de la fuente"); if (url) execute("createLink", url); }
  return <section className="nx-panel flex min-h-[calc(100vh-12rem)] flex-col rounded-2xl shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4 nx-border"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.16em] nx-muted">Editor de documento · trabajo activo</p><h1 className="mt-1 truncate text-lg font-bold">{title}</h1></div><div className="flex items-center gap-2 text-xs nx-muted"><span className="hidden sm:inline">{saved}</span><Save size={15} /><span className="nx-kbd">⌘ S</span></div></header>
    <div className="flex flex-wrap gap-1 border-b p-2 nx-border" aria-label="Barra de herramientas del editor">
      <button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Deshacer" onClick={() => execute("undo")}><Undo2 size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Rehacer" onClick={() => execute("redo")}><Redo2 size={15} /></button><i className="mx-1 h-7 border-l nx-border" />
      <select aria-label="Estilo de texto" onChange={(e) => execute("formatBlock", e.target.value)} className="h-8 rounded border px-2 text-xs nx-border"><option value="p">Párrafo</option><option value="h1">Título 1</option><option value="h2">Título 2</option><option value="blockquote">Cita</option></select>
      <button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Negritas" onClick={() => execute("bold")}><Bold size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Cursivas" onClick={() => execute("italic")}><Italic size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Subrayar" onClick={() => execute("underline")}><Underline size={15} /></button>
      <i className="mx-1 h-7 border-l nx-border" /><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Alinear izquierda" onClick={() => execute("justifyLeft")}><AlignLeft size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Centrar" onClick={() => execute("justifyCenter")}><AlignCenter size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Alinear derecha" onClick={() => execute("justifyRight")}><AlignRight size={15} /></button>
      <i className="mx-1 h-7 border-l nx-border" /><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Lista" onClick={() => execute("insertUnorderedList")}><List size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Lista numerada" onClick={() => execute("insertOrderedList")}><ListOrdered size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Cita" onClick={() => execute("formatBlock", "blockquote")}><Quote size={15} /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-black/5" title="Enlazar fuente" onClick={insertLink}><Link size={15} /></button>
      <input ref={upload} className="hidden" type="file" accept=".pdf,.doc,.docx,.md,.txt,image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void addFile(file); event.currentTarget.value = ""; }} /><button className="ml-auto inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-bold hover:bg-black/5" title="Insertar imagen, PDF o documento" onClick={() => upload.current?.click()}><ImageIcon size={15} />Insertar</button>
    </div>
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:px-12"><div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Documento de investigación" className="nx-editor" onInput={save} onBlur={save} />
      {attachments.length > 0 && <section className="mt-8 border-t pt-4 nx-border"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider nx-muted"><Paperclip size={14} />Material incorporado</p><div className="mt-2 flex flex-wrap gap-2">{attachments.map((attachment) => <span key={attachment.id} className="nx-attachment"><FileText size={14} />{attachment.name} · {Math.max(1, Math.round(attachment.size / 1024))} KB</span>)}</div></section>}
    </div>
  </section>;
}
