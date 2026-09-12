"use client";

import { Bot, CheckCircle2, LoaderCircle, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ResearchProject } from "@/lib/mockData";

type Answer = { answer: string; sources: Array<{ id: string; title: string }>; mode: "model" | "contingency"; model: string };
const availableModels = ["openai/gpt-4o-mini", "google/gemini-2.0-flash-001", "meta-llama/llama-3.1-70b-instruct", "anthropic/claude-3.5-sonnet"];

export function ResearchAgent({ project, selectedId, model }: { project: ResearchProject; selectedId: string; model: string }) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([model]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function toggleModel(item: string) {
    setSelectedModels((current) => current.includes(item) ? (current.length === 1 ? current : current.filter((entry) => entry !== item)) : [...current, item].slice(0, 3));
  }
  async function ask() {
    if (!question.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const results = await Promise.all(selectedModels.map(async (selectedModel) => {
        const response = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, project, selectedId, model: selectedModel }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "El agente no pudo analizar el corpus.");
        return { ...body, model: selectedModel } as Answer;
      }));
      setAnswers(results);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "El agente no pudo completar la consulta.");
    } finally { setLoading(false); }
  }
  return <section className="overflow-hidden rounded-xl border nx-border"><header className="flex items-center justify-between border-b px-4 py-3 nx-border"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md nx-btn-primary"><Bot size={15} /></span><div><p className="text-sm font-bold">Nexus · agente de investigación</p><p className="text-[11px] nx-muted">Contexto: editor + corpus + grafo</p></div></div><Sparkles size={15} className="nx-muted" /></header>
    <div className="p-4"><p className="text-[11px] font-bold uppercase tracking-[.14em] nx-muted">Panel de modelos · máximo 3</p><div className="mt-2 flex flex-wrap gap-1.5">{availableModels.map((item) => <button key={item} onClick={() => toggleModel(item)} className="rounded-full border px-2 py-1 text-[10px] font-bold" style={{ borderColor: selectedModels.includes(item) ? "var(--nx-accent)" : "var(--nx-line)", background: selectedModels.includes(item) ? "var(--nx-soft)" : "transparent" }}>{selectedModels.includes(item) ? "✓ " : ""}{item.replace(/.*\//, "")}</button>)}</div>
      {answers.length > 0 ? <div className="mt-4 space-y-3">{answers.map((answer) => <article key={answer.model} className="rounded-lg border p-3 nx-border"><div className="flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 size={14} style={{ color: answer.mode === "model" ? "var(--nx-success)" : "var(--nx-warning)" }} />{answer.model.replace(/.*\//, "")} · {answer.mode === "model" ? "modelo" : "contingencia"}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{answer.answer}</p><p className="mt-2 border-t pt-2 text-[11px] nx-muted nx-border">Fuentes: {answer.sources.map((source) => source.title).join(" · ")}</p></article>)}</div> : <p className="mt-3 text-sm leading-6 nx-muted">Pregunta por una contradicción, una conexión entre papers o un vacío. Nexus devuelve una interpretación por cada modelo seleccionado.</p>}
      {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{error}</p>}
      <div className="mt-4 flex gap-2"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); void ask(); } }} className="nx-input min-h-20 flex-1 resize-none rounded-lg p-2.5 text-sm" placeholder="Ej. ¿Qué supuesto une estas dos fuentes y cómo lo valido?" /><button disabled={!question.trim() || loading} onClick={() => void ask()} className="nx-btn-primary grid h-10 w-10 place-items-center self-end rounded-lg" title="Consultar agente">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}</button></div><p className="mt-2 text-[11px] nx-muted">Ctrl + Enter para consultar · las interpretaciones se mantienen separadas.</p>
    </div>
  </section>;
}
