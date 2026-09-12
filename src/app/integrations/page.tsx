"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Boxes, Check, Cloud, ExternalLink, FileSearch, GitFork as Github, Link2, MessageSquare, Monitor as Chrome, Plug, Search, ShieldCheck } from "lucide-react";
import { NexusMark } from "@/components/NexusMark";

type Integration = { name: string; category: "Fuentes" | "Bibliografía" | "Documentos" | "Colaboración" | "Automatización"; description: string; status: "Disponible" | "Próximamente" };
const integrations: Integration[] = [
  { name: "Scopus", category: "Fuentes", description: "Metadatos, citas y alertas de literatura.", status: "Disponible" },
  { name: "Web of Science", category: "Fuentes", description: "Índices de citación y referencias.", status: "Próximamente" },
  { name: "Crossref", category: "Fuentes", description: "Resolución DOI y metadatos abiertos.", status: "Disponible" },
  { name: "OpenAlex", category: "Fuentes", description: "Grafo abierto de trabajos y autores.", status: "Próximamente" },
  { name: "Semantic Scholar", category: "Fuentes", description: "Relevancia semántica y citas.", status: "Próximamente" },
  { name: "arXiv", category: "Fuentes", description: "Preprints y seguimiento de temas.", status: "Próximamente" },
  { name: "PubMed", category: "Fuentes", description: "Literatura biomédica indexada.", status: "Próximamente" },
  { name: "IEEE Xplore", category: "Fuentes", description: "Ingeniería y ciencias computacionales.", status: "Próximamente" },
  { name: "Mendeley", category: "Bibliografía", description: "Biblioteca, colecciones y anotaciones.", status: "Disponible" },
  { name: "Zotero", category: "Bibliografía", description: "Colecciones, etiquetas y referencias.", status: "Próximamente" },
  { name: "EndNote", category: "Bibliografía", description: "Sincronización de bibliografías.", status: "Próximamente" },
  { name: "Readwise", category: "Bibliografía", description: "Resaltados y notas de lectura.", status: "Próximamente" },
  { name: "Google Drive", category: "Documentos", description: "Documentos, PDFs y carpetas.", status: "Próximamente" },
  { name: "Dropbox", category: "Documentos", description: "Archivos de investigación compartidos.", status: "Próximamente" },
  { name: "OneDrive", category: "Documentos", description: "Workspace y documentos institucionales.", status: "Próximamente" },
  { name: "Notion", category: "Documentos", description: "Notas, bases de datos y wikis.", status: "Próximamente" },
  { name: "Slack", category: "Colaboración", description: "Alertas, discusiones y resúmenes.", status: "Disponible" },
  { name: "Microsoft Teams", category: "Colaboración", description: "Notificaciones de hallazgos.", status: "Próximamente" },
  { name: "Discord", category: "Colaboración", description: "Canales de laboratorio y comunidad.", status: "Próximamente" },
  { name: "GitHub", category: "Colaboración", description: "Versionado de código y manuscritos.", status: "Disponible" },
  { name: "Trigger.dev", category: "Automatización", description: "Monitoreos y tareas programadas.", status: "Disponible" },
  { name: "Zapier", category: "Automatización", description: "Flujos entre herramientas.", status: "Próximamente" },
  { name: "Make", category: "Automatización", description: "Automatización visual de procesos.", status: "Próximamente" },
  { name: "n8n", category: "Automatización", description: "Orquestación autoalojable.", status: "Próximamente" },
];

const categoryIcon = { Fuentes: FileSearch, Bibliografía: BookOpen, Documentos: Cloud, Colaboración: MessageSquare, Automatización: Boxes };

export default function IntegrationsPage() {
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState<string[]>([]);
  const filtered = useMemo(() => integrations.filter((item) => (item.name + " " + item.category + " " + item.description).toLowerCase().includes(query.toLowerCase())), [query]);
  return <main className="nx-shell min-h-screen"><header className="flex h-14 items-center gap-3 border-b px-4 nx-panel"><NexusMark size={32} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">Nexus Intellect</p><p className="text-[10px] font-bold uppercase tracking-[.16em] nx-muted">Integration hub</p></div><Link href="/" className="nx-btn-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"><ArrowLeft size={15} />Workspace</Link></header>
    <div className="mx-auto max-w-7xl px-5 py-9"><section className="grid gap-6 border-b pb-8 lg:grid-cols-[1fr_330px] nx-border"><div><p className="text-xs font-bold uppercase tracking-[.18em] nx-muted">Centro de integraciones</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Conecta el ecosistema que ya usa tu investigación.</h1><p className="mt-3 max-w-2xl leading-7 nx-muted">Nexus transforma archivos, bibliotecas, colaboración y alertas en contexto controlable. Cada conector declara qué aporta antes de pedir autorización.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full px-3 py-1.5 text-xs font-bold nx-soft">{integrations.length} conectores</span><span className="rounded-full px-3 py-1.5 text-xs font-bold nx-soft">{connected.length} conectados en esta sesión</span><span className="rounded-full px-3 py-1.5 text-xs font-bold nx-soft">Permisos explícitos</span></div></div><aside className="nx-panel rounded-xl p-4"><div className="flex items-center gap-2"><Chrome size={18} /><p className="font-bold">Nexus Capture</p></div><p className="mt-2 text-sm leading-6 nx-muted">Extensión Chromium para capturar la página actual, DOI o PDF y enviarlo a la cola de ingesta.</p><a href="/extension/README.md" className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline">Guía de instalación <ExternalLink size={14} /></a></aside></section>
      <div className="relative mt-7"><Search size={17} className="absolute left-3 top-3 nx-muted" /><input className="nx-input w-full rounded-xl py-3 pl-10 pr-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar Scopus, Mendeley, Slack, GitHub…" /></div>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((integration) => { const Icon = categoryIcon[integration.category]; const active = connected.includes(integration.name); return <article key={integration.name} className="nx-panel rounded-xl p-4"><div className="flex items-start justify-between gap-4"><span className="grid h-9 w-9 place-items-center rounded-lg nx-soft"><Icon size={17} /></span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${integration.status === "Disponible" ? "nx-soft" : "border nx-border nx-muted"}`}>{integration.status}</span></div><p className="mt-4 font-bold">{integration.name}</p><p className="mt-1 text-sm nx-muted">{integration.description}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs font-semibold nx-muted">{integration.category}</span><button disabled={integration.status !== "Disponible"} onClick={() => setConnected((current) => active ? current.filter((name) => name !== integration.name) : [...current, integration.name])} className="nx-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-45">{active ? <><Check size={13} />Conectado</> : <><Plug size={13} />Conectar</>}</button></div></article>; })}</section>
      <section className="mt-9 grid gap-4 border-t pt-7 md:grid-cols-3 nx-border"><article className="rounded-xl p-4 nx-soft"><ShieldCheck size={18} /><h2 className="mt-3 font-bold">Permisos por conector</h2><p className="mt-1 text-sm nx-muted">Revisa qué colecciones, mensajes o metadatos entran al corpus antes de conectar.</p></article><article className="rounded-xl p-4 nx-soft"><Link2 size={18} /><h2 className="mt-3 font-bold">Contexto trazable</h2><p className="mt-1 text-sm nx-muted">Cada elemento conserva origen, conector y estado de enriquecimiento.</p></article><article className="rounded-xl p-4 nx-soft"><Github size={18} /><h2 className="mt-3 font-bold">Extensible</h2><p className="mt-1 text-sm nx-muted">Los conectores pueden añadirse como adaptadores sin cambiar el editor ni el grafo.</p></article></section>
    </div>
  </main>;
}
