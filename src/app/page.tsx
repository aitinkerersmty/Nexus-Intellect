"use client";

import { ChangeEvent, FormEvent, type HTMLAttributes, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { FileText, FolderKanban, Network, Plus, Search, Sparkles, Upload } from "lucide-react";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { demoProject, graphContext, type ResearchDocument, type ResearchProject } from "@/lib/mockData";

const AnimatePresence = ({ children }: { children: ReactNode; mode?: string }) => <>{children}</>;
const MotionArticle = ({ initial, animate, exit, children, ...props }: HTMLAttributes<HTMLElement> & { initial?: unknown; animate?: unknown; exit?: unknown; children?: ReactNode }) => {
  void initial; void animate; void exit;
  return <article {...props}>{children}</article>;
};
const motion = { article: MotionArticle };

function AffinityBadge({ value }: { value: number }) {
  return <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">{value}% afinidad</span>;
}

type ModelOption = { id: string; name: string };
type Interpretation = { model: string; summary: string; ok: boolean; error?: string };

const fallbackModelOptions: ModelOption[] = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct" },
];

function ModelInterpretationPanel({ document, project }: { document: ResearchDocument; project: ResearchProject }) {
  const [options, setOptions] = useState<ModelOption[]>(fallbackModelOptions);
  const [selectedModels, setSelectedModels] = useState<string[]>([fallbackModelOptions[0].id]);
  const [modelToAdd, setModelToAdd] = useState(fallbackModelOptions[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/models")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ models?: ModelOption[] }>;
      })
      .then((data) => { if (active && data.models?.length) setOptions(data.models); })
      .catch(() => { /* The curated fallback remains available. */ })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const addModel = () => {
    const id = modelToAdd.trim();
    if (!id || selectedModels.includes(id) || selectedModels.length >= 4) return;
    setSelectedModels((current) => [...current, id]);
  };

  async function interpretPaper() {
    if (!selectedModels.length) return;
    setIsInterpreting(true); setError(null); setInterpretations([]);
    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, project, models: selectedModels }),
      });
      const data = await response.json() as { interpretations?: Interpretation[]; simulated?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "No fue posible interpretar el paper.");
      setInterpretations(data.interpretations ?? []);
      setIsSimulated(Boolean(data.simulated));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible interpretar el paper.");
    } finally {
      setIsInterpreting(false);
    }
  }

  return <div className="mt-5 border-t border-slate-100 pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-900">Interpretación de resultados</p><p className="mt-1 text-xs text-slate-500">Compara hasta 4 modelos; cada uno genera su propia lectura del paper.</p></div><button type="button" onClick={interpretPaper} disabled={!selectedModels.length || isInterpreting} className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{isInterpreting ? "Interpretando…" : "Interpretar con modelos"}</button></div><div className="mt-3 flex gap-2"><select value={modelToAdd} onChange={(event) => setModelToAdd(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"><option value="">Selecciona un modelo…</option>{options.map((model) => <option key={model.id} value={model.id}>{model.name} · {model.id}</option>)}</select><button type="button" onClick={addModel} disabled={!modelToAdd || selectedModels.length >= 4} className="rounded-lg border border-blue-200 px-3 text-xs font-bold text-blue-800 disabled:opacity-50">Añadir</button></div><input value={modelToAdd} onChange={(event) => setModelToAdd(event.target.value)} placeholder="o escribe un slug, ej. openai/gpt-4o" className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-orange-400" /><div className="mt-2 flex flex-wrap gap-2">{selectedModels.map((model) => <span key={model} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">{options.find((option) => option.id === model)?.name ?? model}<button type="button" onClick={() => setSelectedModels((current) => current.filter((item) => item !== model))} aria-label={`Quitar ${model}`} className="ml-1 leading-none text-blue-600 hover:text-orange-600">×</button></span>)}</div>{isLoading && <p className="mt-2 text-xs text-slate-400">Actualizando catálogo de OpenRouter…</p>}{error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}{isSimulated && interpretations.length > 0 && <p className="mt-3 rounded-lg bg-orange-50 p-2 text-xs text-orange-800">Vista previa: configura OPENROUTER_API_KEY para obtener respuestas reales.</p>}<div className="mt-3 space-y-2">{interpretations.map((interpretation) => <div key={interpretation.model} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold text-blue-900">{options.find((option) => option.id === interpretation.model)?.name ?? interpretation.model}<span className="ml-1 font-normal text-slate-400">· {interpretation.model}</span></p>{interpretation.ok ? <p className="mt-2 text-sm leading-6 text-slate-600">{interpretation.summary}</p> : <p className="mt-2 text-xs text-red-700">{interpretation.error}</p>}</div>)}</div></div>;
}

function Dashboard({ onOpen }: { onOpen: () => void }) {
  const [purpose, setPurpose] = useState("");
  const [scope, setScope] = useState("");
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-900 lg:p-12"><div className="mx-auto max-w-5xl"><div className="mb-10 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500 text-white"><Network /></span><div><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-500">Nexus Intellect</p><h1 className="text-2xl font-bold text-blue-950">Proyectos de investigación</h1></div></div><div className="grid gap-6 md:grid-cols-[1.15fr_.85fr]"><button onClick={onOpen} className="rounded-2xl border border-blue-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-8 flex items-start justify-between"><span className="rounded-xl bg-orange-50 p-3 text-orange-500"><FolderKanban /></span><span className="text-sm text-slate-400">3 documentos · 3 conexiones</span></div><h2 className="text-xl font-bold text-blue-950">{demoProject.name}</h2><p className="mt-3 leading-6 text-slate-600">{demoProject.purpose}</p><span className="mt-6 inline-block text-sm font-bold text-orange-600">Abrir workspace →</span></button><form onSubmit={(event) => { event.preventDefault(); onOpen(); }} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-blue-950"><Plus size={18} /><h2 className="font-bold">Crear proyecto</h2></div><p className="mt-2 text-sm text-slate-500">Define el propósito y alcance antes de añadir documentos.</p><label className="mt-5 block text-sm font-semibold">Propósito<textarea required value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-orange-400" placeholder="¿Qué pregunta quieres responder?" /></label><label className="mt-4 block text-sm font-semibold">Alcance<textarea required value={scope} onChange={(event) => setScope(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-orange-400" placeholder="Límites, disciplinas y criterios…" /></label><button className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600">Crear workspace</button></form></div></div></main>;
}

function ProjectWorkspace({ onShowProjects }: { onShowProjects: () => void }) {
  const [project, setProject] = useState<ResearchProject>(demoProject);
  const [selectedId, setSelectedId] = useState("grain-geometry");
  const [doi, setDoi] = useState(""); const [isIngesting, setIsIngesting] = useState(false); const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = project.documents.find((document) => document.id === selectedId) ?? project.documents[0];
  const context = useMemo(() => graphContext(project), [project]);
  useCopilotReadable({ description: "Corpus del proyecto y topología del grafo. Usa las aristas para explicar de dónde viene una idea.", value: context });

  async function ingestDoi(event: FormEvent) {
    event.preventDefault(); if (!doi.trim()) return; setIsIngesting(true); setNotice(null);
    try { const response = await fetch("/api/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doi, project }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "No fue posible ingerir el DOI."); setProject((current) => ({ ...current, documents: [...current.documents, data.document], edges: [...current.edges, ...data.edges] })); setSelectedId(data.document.id); setDoi(""); setNotice(data.simulated ? "Añadido en modo demo. Configura Exa y OpenRouter para ingesta verificable." : "Documento ingerido y conectado al grafo."); } catch (error) { setNotice(error instanceof Error ? error.message : "Error de ingesta."); } finally { setIsIngesting(false); }
  }

  async function addLocalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; const id = `local-${Date.now()}`;
    const document: ResearchDocument = { id, title: file.name.replace(/\.[^.]+$/, ""), year: new Date().getFullYear(), authors: ["Documento local"], summary: file.name.endsWith(".md") ? (await file.text()).slice(0, 240) || "Documento Markdown local." : "Archivo PDF local listo para extracción en una integración posterior.", affinity: 70, affinityReason: "Afinidad preliminar: requiere extracción y validación del contenido.", entities: [file.name.endsWith(".pdf") ? "PDF" : "Markdown", "ingesta local"], color: "teal" };
    setProject((current) => ({ ...current, documents: [...current.documents, document], edges: [...current.edges, { id: `${id}-topic`, source: id, target: "thermodynamics", kind: "topic", label: "afinidad preliminar por propósito" }] })); setSelectedId(id); setNotice("Documento local agregado al workspace."); event.target.value = "";
  }

  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6"><div className="flex items-center gap-3"><button onClick={onShowProjects} title="Ver proyectos" className="rounded-lg p-2 text-blue-900 transition hover:bg-blue-50"><FolderKanban size={20} /></button><span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-white"><Network size={19} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-500">Nexus Intellect</p><h1 className="text-sm font-bold text-blue-950">{project.name}</h1></div></div><div className="hidden max-w-xl text-right text-xs text-slate-500 lg:block"><span className="font-semibold text-blue-900">Propósito: </span>{project.purpose}</div></header><div className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[310px_minmax(0,1fr)]"><aside className="border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-blue-950">Documentos</h2><span className="text-xs text-slate-400">{project.documents.length} en corpus</span></div><form onSubmit={ingestDoi} className="rounded-xl bg-blue-950 p-3 text-white shadow-sm"><label className="text-xs font-bold uppercase tracking-wider text-blue-200">Agregar mediante DOI</label><div className="mt-2 flex gap-2"><input value={doi} onChange={(event) => setDoi(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-blue-800 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-orange-400" placeholder="10.xxxx/ejemplo" /><button disabled={isIngesting} className="rounded-lg bg-orange-500 px-3 text-sm font-bold disabled:opacity-60">{isIngesting ? "…" : <Search size={17} />}</button></div></form><input ref={fileInput} onChange={addLocalFile} accept=".md,.pdf" type="file" className="hidden" /><button onClick={() => fileInput.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 px-3 py-2.5 text-sm font-semibold text-blue-800 transition hover:border-orange-400 hover:bg-orange-50"><Upload size={16} /> Añadir archivo .md o .pdf</button>{notice && <p className="mt-3 rounded-lg bg-orange-50 p-2 text-xs leading-5 text-orange-800">{notice}</p>}<div className="mt-4 space-y-2">{project.documents.map((document) => <button key={document.id} onClick={() => setSelectedId(document.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === document.id ? "border-orange-300 bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200"}`}><div className="flex items-start justify-between gap-2"><FileText size={16} className="mt-0.5 shrink-0 text-blue-800" /><AffinityBadge value={document.affinity} /></div><p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-blue-950">{document.title}</p><p className="mt-1 text-xs text-slate-500">{document.authors.join(", ")} · {document.year}</p></button>)}</div></aside><section className="min-w-0 p-4 lg:p-6"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-500">Mapa de conocimiento</p><h2 className="text-xl font-bold text-blue-950">El origen y la relación de las ideas</h2></div><button onClick={() => setNotice(`Exploración preparada para ${selected.title}. Al conectar Exa, buscará avances recientes desde este nodo.`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"><Sparkles size={16} /> Explorar vanguardia</button></div><div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_310px]"><KnowledgeGraph documents={project.documents} edges={project.edges} selectedId={selectedId} onSelect={(document) => setSelectedId(document.id)} /><AnimatePresence mode="wait"><motion.article key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-500">Documento seleccionado</p><h3 className="mt-3 font-serif text-xl font-bold leading-7 text-blue-950">{selected.title}</h3><p className="mt-2 text-sm text-slate-500">{selected.authors.join(", ")} · {selected.year}</p><p className="mt-5 text-sm leading-6 text-slate-600">{selected.summary}</p><ModelInterpretationPanel document={selected} project={project} /><div className="mt-5 border-t border-slate-100 pt-4"><AffinityBadge value={selected.affinity} /><p className="mt-2 text-xs leading-5 text-slate-500">{selected.affinityReason}</p></div><div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-blue-900">Entidades extraídas</p><div className="mt-2 flex flex-wrap gap-2">{selected.entities.map((entity) => <span key={entity} className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800">{entity}</span>)}</div></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-900">Conexiones</p>{project.edges.filter((edge) => edge.source === selected.id || edge.target === selected.id).map((edge) => <p key={edge.id} className="mt-2 text-xs text-slate-600"><b className={edge.kind === "citation" ? "text-orange-600" : "text-blue-600"}>{edge.kind === "citation" ? "CITACIÓN" : "TEMA"}</b> · {edge.label}</p>)}</div></motion.article></AnimatePresence></div></section></div></main>;
}

export default function Home() {
  const [showProjects, setShowProjects] = useState(false);
  if (showProjects) return <Dashboard onOpen={() => setShowProjects(false)} />;
  return <CopilotKit runtimeUrl="/api/copilotkit"><CopilotSidebar defaultOpen clickOutsideToClose={false} labels={{ title: "Agente de investigación", initial: "Pregunta qué conecta dos documentos o qué hueco cubriría un nuevo paper." }} instructions="Razona usando los documentos y las aristas del grafo disponibles. Distingue siempre entre citación real y afinidad temática."><ProjectWorkspace onShowProjects={() => setShowProjects(true)} /></CopilotSidebar></CopilotKit>;
}
