"use client";
import { Settings, X } from "lucide-react";
import { useState } from "react";

export type ThemePreset = "vanguardia" | "nebula" | "oceanico";
const presets: Array<{ id: ThemePreset; name: string; colors: string[] }> = [
  { id: "vanguardia", name: "Vanguardia", colors: ["#f97316", "#172554", "#dbeafe"] },
  { id: "nebula", name: "Nébula", colors: ["#7c3aed", "#312e81", "#ede9fe"] },
  { id: "oceanico", name: "Oceánico", colors: ["#0ea5e9", "#0c4a6e", "#e0f2fe"] },
];

export function SettingsPanel({ theme, setTheme, model, setModel }: { theme: ThemePreset; setTheme: (theme: ThemePreset) => void; model: string; setModel: (model: string) => void }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)} title="Configuración" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-blue-950 transition hover:bg-slate-100 theme-toggle"><Settings size={18} /></button>{open && <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/40 p-4"><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl theme-toggle"><header className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-500">Configuración</p><h2 className="text-xl font-bold">Preferencias de plataforma</h2></div><button onClick={() => setOpen(false)} title="Cerrar"><X /></button></header><section className="mt-6 border-t pt-5"><h3 className="font-semibold">Tema de color</h3><div className="mt-3 grid grid-cols-3 gap-3">{presets.map((preset) => <button key={preset.id} onClick={() => setTheme(preset.id)} className={`rounded-xl border p-3 text-left ${theme === preset.id ? "border-orange-400 ring-2 ring-orange-100" : "border-slate-200"}`}><span className="flex gap-1">{preset.colors.map((color) => <i key={color} className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />)}</span><span className="mt-2 block text-xs font-bold">{preset.name}</span></button>)}</div></section><section className="mt-6 border-t pt-5"><h3 className="font-semibold">Modelo preferido</h3><select className="mt-2 w-full rounded-lg border p-2 text-sm" value={model} onChange={(event) => setModel(event.target.value)}><option>openai/gpt-4o-mini</option><option>google/gemini-2.0-flash-001</option><option>meta-llama/llama-3.1-70b-instruct</option><option>anthropic/claude-3.5-sonnet</option></select></section><section className="mt-6 border-t pt-5 text-sm text-slate-500"><h3 className="font-semibold text-slate-700">Próximamente</h3><p className="mt-1">Idioma y densidad de interfaz.</p></section></section></div>}</>;
}
