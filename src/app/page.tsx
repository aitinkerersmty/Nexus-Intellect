"use client";

import { useMemo, useState } from "react";
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotTextarea } from "@copilotkit/react-textarea";
import { BookOpen, ChevronDown, Sparkles } from "lucide-react";
import { papers, type PaperId } from "@/lib/mockData";

function ThesisWorkspace() {
  const [paperId, setPaperId] = useState<PaperId>("1");
  const [drafts, setDrafts] = useState<Record<PaperId, string>>({
    "1": papers["1"].draft,
    "2": papers["2"].draft,
  });
  const paper = papers[paperId];

  const readableContext = useMemo(
    () => ({
      paperId: paper.id,
      title: paper.title,
      keywords: paper.keywords,
      localNotes: paper.contextMarkdown,
      approvedBibliography: paper.bibliography,
      instruction:
        "Responde exclusivamente con base en este contexto. Si faltan datos, dilo y propone una consulta bibliográfica sin inventar referencias.",
    }),
    [paper],
  );

  useCopilotReadable({
    description: "Contexto local y bibliografía del documento de tesis seleccionado.",
    value: readableContext,
  });

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-h-[680px] flex-col border-b border-slate-800 lg:border-b-0 lg:border-r">
          <header className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300"><Sparkles size={20} /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Nexus Intellect</p>
                <h1 className="text-lg font-semibold">Workspace de tesis</h1>
              </div>
            </div>
            <label className="relative flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
              <BookOpen size={16} className="text-cyan-300" />
              <select
                aria-label="Documento de investigación activo"
                className="appearance-none bg-transparent pr-6 outline-none"
                value={paperId}
                onChange={(event) => setPaperId(event.target.value as PaperId)}
              >
                {Object.values(papers).map((item) => <option key={item.id} value={item.id}>{`Paper ${item.id}: ${item.shortTitle}`}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3" />
            </label>
          </header>

          <div className="flex-1 p-5">
            <div className="mb-4 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <p className="text-xs font-medium uppercase tracking-widest text-cyan-300">Contexto activo</p>
              <h2 className="mt-1 text-base font-semibold">{paper.title}</h2>
              <p className="mt-2 text-sm text-slate-400">Palabras clave: {paper.keywords.join(" · ")}</p>
            </div>
            <CopilotTextarea
              className="min-h-[470px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-200 outline-none transition focus:border-cyan-400"
              placeholder="Escribe el borrador de tu tesis…"
              value={drafts[paperId]}
              onValueChange={(value: string) => setDrafts((current) => ({ ...current, [paperId]: value }))}
            />
          </div>
        </section>

        <aside className="min-h-[680px] bg-slate-950/40 p-4">
          <CopilotSidebar
            defaultOpen
            clickOutsideToClose={false}
            labels={{ title: "Agente contextual", initial: "Estoy listo para revisar el borrador y las referencias del paper activo." }}
            instructions="Ayuda a redactar y revisar la tesis del documento seleccionado. Nunca inventes fuentes, DOI, resultados o citas."
          >
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Nuevos breakthroughs detectados</p>
              <p className="mt-2 text-slate-400">La sincronización programada añadirá hallazgos de Exa aquí.</p>
            </div>
          </CopilotSidebar>
        </aside>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ThesisWorkspace />
    </CopilotKit>
  );
}
