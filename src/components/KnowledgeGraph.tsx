"use client";

import { type ComponentType, useEffect, useMemo, useState } from "react";
import type { KnowledgeEdge, ResearchDocument } from "@/lib/mockData";

type Props = { documents: ResearchDocument[]; edges: KnowledgeEdge[]; selectedId: string | null; onSelect: (document: ResearchDocument) => void; onSelectEdge?: (edge: KnowledgeEdge) => void };
type ForceGraphComponent = ComponentType<Record<string, unknown>>;
const positions = [[50, 32], [72, 62], [31, 72], [58, 82], [20, 44]];
const colors = { orange: "#18181b", blue: "#71717a", teal: "#a1a1aa" };

function Legend() {
  return <div className="pointer-events-none absolute left-5 top-5 z-20 rounded-lg border border-zinc-300 bg-white/90 px-3 py-2 text-xs text-zinc-700 backdrop-blur"><span className="mr-3 inline-flex items-center gap-1.5"><i className="h-2 w-5 bg-zinc-900" /> Citación real</span><span className="inline-flex items-center gap-1.5"><i className="h-0 w-5 border-t-2 border-dashed border-zinc-400" /> Afinidad temática</span></div>;
}

export function KnowledgeGraph({ documents, edges, selectedId, onSelect, onSelectEdge = (edge) => window.alert(`${edge.kind === "citation" ? "Citación real" : "Afinidad temática"}: ${edge.label}`) }: Props) {
  const [ForceGraph2D, setForceGraph2D] = useState<ForceGraphComponent | null>(null);
  const graph = useMemo(() => documents.map((document, index) => ({ document, point: positions[index % positions.length] })), [documents]);
  const pointFor = (id: string) => graph.find((item) => item.document.id === id)?.point ?? [50, 50];
  const neighbors = new Set(edges.filter((edge) => edge.source === selectedId || edge.target === selectedId).flatMap((edge) => [edge.source, edge.target]));

  useEffect(() => {
    const importer = new Function("moduleName", "return import(moduleName)") as (moduleName: string) => Promise<{ default: ForceGraphComponent }>;
    void importer("react-force-graph-2d").then((module) => setForceGraph2D(() => module.default)).catch(() => undefined);
  }, []);

  return <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-zinc-200 bg-[#fafafa]"><div className="pointer-events-none absolute inset-0 z-10 opacity-50 [background-image:linear-gradient(#e4e4e7_1px,transparent_1px),linear-gradient(90deg,#e4e4e7_1px,transparent_1px)] [background-size:32px_32px]" /><Legend />{ForceGraph2D ? <ForceGraph2D graphData={{ nodes: documents, links: edges }} nodeId="id" nodeLabel="title" nodeColor={(node: ResearchDocument) => colors[node.color]} nodeVal={(node: ResearchDocument) => node.id === selectedId ? 12 : 7} linkColor={(edge: KnowledgeEdge) => edge.kind === "citation" ? "#18181b" : "#a1a1aa"} linkLineDash={(edge: KnowledgeEdge) => edge.kind === "citation" ? undefined : [4, 3]} onNodeClick={(node: ResearchDocument) => onSelect(node)} onLinkClick={(edge: KnowledgeEdge) => onSelectEdge(edge)} backgroundColor="rgba(0,0,0,0)" /> : <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="Grafo de conocimiento">{edges.map((edge) => { const [x1, y1] = pointFor(edge.source); const [x2, y2] = pointFor(edge.target); return <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edge.kind === "citation" ? "#18181b" : "#a1a1aa"} strokeWidth="1.2" strokeDasharray={edge.kind === "citation" ? undefined : "1 0.7"} className="cursor-pointer" onClick={() => onSelectEdge(edge)} />; })}{graph.map(({ document, point: [x, y] }) => { const dimmed = Boolean(selectedId && document.id !== selectedId && !neighbors.has(document.id)); const label = document.title.length > 34 ? `${document.title.slice(0, 34)}…` : document.title; return <g key={document.id} onClick={() => onSelect(document)} className="cursor-pointer" opacity={dimmed ? .3 : 1}><circle cx={x} cy={y} r={document.id === selectedId ? 3.5 : 2.7} fill={colors[document.color]} stroke={document.id === selectedId ? "#ffffff" : "#d4d4d8"} strokeWidth={document.id === selectedId ? .6 : .2} /><text x={x} y={y + 5.2} textAnchor="middle" fill="#27272a" fontSize="2.3" fontFamily="Arial">{label}</text></g>; })}</svg>}</div>;
}
