"use client";

import { Check, Settings, X } from "lucide-react";
import { useState } from "react";

export type ThemePreset = "monochrome" | "ink" | "indigo" | "forest";

const presets: Array<{ id: ThemePreset; name: string; note: string; colors: string[] }> = [
  { id: "monochrome", name: "Monocromo", note: "Predeterminado · research-grade", colors: ["#18181b", "#ffffff", "#a1a1aa"] },
  { id: "ink", name: "Ink", note: "Entorno oscuro de lectura", colors: ["#0b0b0c", "#fafafa", "#3f3f46"] },
  { id: "indigo", name: "Índigo", note: "Análisis y citación", colors: ["#3730a3", "#ffffff", "#dbe4ff"] },
  { id: "forest", name: "Bosque", note: "Revisión prolongada", colors: ["#1f5c40", "#ffffff", "#d9e6dd"] },
];

export function SettingsPanel({ theme, setTheme, model, setModel }: { theme: ThemePreset; setTheme: (theme: ThemePreset) => void; model: string; setModel: (model: string) => void }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)} title="Configuración" className="grid h-10 w-10 place-items-center rounded-xl nx-btn-secondary"><Settings size={18} /></button>
    {open && <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/35 p-4"><section role="dialog" aria-modal="true" aria-label="Configuración de Nexus" className="nx-panel w-full max-w-xl rounded-2xl p-6 shadow-2xl"><header className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] nx-accent">Configuración</p><h2 className="mt-1 text-xl font-bold">Preferencias del laboratorio</h2><p className="mt-1 text-sm nx-muted">Las preferencias se aplican a tu sesión local.</p></div><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg nx-btn-secondary" aria-label="Cerrar configuración"><X size={18} /></button></header>
      <section className="mt-6 border-t pt-5 nx-border"><h3 className="font-semibold">Sistema visual</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{presets.map((preset) => <button key={preset.id} onClick={() => setTheme(preset.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${theme === preset.id ? "ring-2 ring-black/20" : ""}`} style={{ borderColor: theme === preset.id ? "var(--nx-accent)" : "var(--nx-line)" }}><span className="flex gap-1">{preset.colors.map((color) => <i key={color} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{preset.name}</span><span className="block text-xs nx-muted">{preset.note}</span></span>{theme === preset.id && <Check size={16} />}</button>)}</div></section>
      <section className="mt-6 border-t pt-5 nx-border"><label className="font-semibold" htmlFor="research-model">Modelo preferido</label><select id="research-model" className="nx-input mt-2 w-full rounded-xl p-2.5 text-sm" value={model} onChange={(event) => setModel(event.target.value)}><option>openai/gpt-4o-mini</option><option>google/gemini-2.0-flash-001</option><option>meta-llama/llama-3.1-70b-instruct</option><option>anthropic/claude-3.5-sonnet</option></select><p className="mt-2 text-xs nx-muted">La selección se usa para las acciones de Nexus y no altera tu corpus.</p></section>
    </section></div>}
  </>;
}
