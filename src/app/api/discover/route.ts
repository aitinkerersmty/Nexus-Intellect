import { NextResponse } from "next/server";
import Exa from "exa-js";
import type { ResearchDocument, ResearchProject } from "@/lib/mockData";

export async function POST(request: Request) {
  const { project, selectedDocument } = (await request.json()) as { project?: ResearchProject; selectedDocument?: ResearchDocument };
  if (!project) return NextResponse.json({ error: "Falta el contexto del proyecto." }, { status: 400 });
  if (!process.env.EXA_API_KEY) return NextResponse.json({ error: "EXA_API_KEY no está configurada. Añádela en .env.local para buscar avances reales." }, { status: 503 });
  const focus = selectedDocument ? `${selectedDocument.title}. ${selectedDocument.summary}. Entidades: ${selectedDocument.entities.join(", ")}` : "";
  const query = `${project.purpose}. ${project.scope}. ${focus} artículos científicos recientes revisados por pares`;
  try {
    const exa = new Exa(process.env.EXA_API_KEY);
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("La búsqueda tardó demasiado.")), 15_000));
    const response = await Promise.race([exa.searchAndContents(query, { type: "auto", numResults: 5, text: { maxCharacters: 700 } }), timeout]);
    if (!response.results.length) return NextResponse.json({ error: "Exa no encontró resultados para este contexto." }, { status: 404 });
    return NextResponse.json({ query, findings: response.results.map((item) => ({ title: item.title ?? "Artículo sin título", url: item.url, domain: new URL(item.url).hostname, summary: item.text?.slice(0, 320) ?? "Sin resumen disponible.", publishedDate: item.publishedDate })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible consultar Exa.";
    return NextResponse.json({ error: message.includes("timeout") ? "Tiempo de espera agotado al consultar Exa." : `Error de búsqueda: ${message}` }, { status: 502 });
  }
}
