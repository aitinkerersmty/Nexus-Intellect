import { NextResponse } from "next/server";
import Exa from "exa-js";
import OpenAI from "openai";
import type { KnowledgeEdge, ResearchDocument, ResearchProject } from "@/lib/mockData";

const normalizeDoi = (value: string) => value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
const isUrl = (value: string) => /^https?:\/\//i.test(value);
const withTimeout = <T,>(promise: Promise<T>, milliseconds: number) => Promise.race<T>([
  promise,
  new Promise<T>((_, reject) => setTimeout(() => reject(new Error("El enriquecimiento remoto excedió el tiempo de espera.")), milliseconds)),
]);

type Extraction = Pick<ResearchDocument, "title" | "authors" | "summary" | "affinity" | "affinityReason" | "entities"> & {
  citations: Array<{ documentId: string; explanation: string }>;
};

export async function POST(request: Request) {
  let project: ResearchProject | undefined;
  let source = "";
  let doi: string | undefined;
  try {
    const body = (await request.json()) as { source?: string; doi?: string; project?: ResearchProject };
    project = body.project;
    source = (body.source ?? body.doi ?? "").trim();
    doi = isUrl(source) ? undefined : normalizeDoi(source);
    if (!source || !project) return NextResponse.json({ error: "Se requiere un DOI o URL y el contexto del proyecto." }, { status: 400 });

    const fingerprint = (doi ?? source).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = `source-${fingerprint}`;
    if (project.documents.some((document) => document.doi === doi || document.url === source)) return NextResponse.json({ error: "Ese documento ya está en el corpus." }, { status: 409 });

    if (!process.env.EXA_API_KEY || !process.env.OPENROUTER_API_KEY) {
      const document: ResearchDocument = {
        id, doi, url: isUrl(source) ? source : undefined, title: doi ? `Documento DOI: ${doi}` : "Documento web descubierto", year: new Date().getFullYear(), authors: ["Metadatos pendientes"],
        summary: "Ingesta de demostración. Añade EXA_API_KEY y OPENROUTER_API_KEY para extraer metadatos, contenido y citas verificables.",
        affinity: 75, affinityReason: `Coincidencia preliminar con el propósito: ${project.purpose}`, entities: ["DOI", "pendiente de extracción"], color: "teal",
      };
      const edges: KnowledgeEdge[] = [];
      return NextResponse.json({ document, edges, simulated: true });
    }

    const openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    const exa = new Exa(process.env.EXA_API_KEY);
    const searchQuery = doi ? `doi:${doi}` : source;
    const search = await withTimeout(exa.searchAndContents(searchQuery, { type: "auto", numResults: 1, text: { maxCharacters: 6_000 } }), 15_000);
    const result = search.results[0];
    if (!result) return NextResponse.json({ error: "Exa no encontró contenido para ese DOI." }, { status: 404 });

    const existing = project.documents.map((document) => ({ id: document.id, title: document.title, summary: document.summary }));
    const completion = await withTimeout(openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Extrae información bibliográfica sin inventar datos. Devuelve JSON con title, authors (string[]), summary, affinity (0-100), affinityReason, entities (string[]) y citations ({documentId, explanation}[]). citations solo puede usar IDs del corpus existente y solo cuando el texto demuestra una cita real." },
        { role: "user", content: JSON.stringify({ projectPurpose: project.purpose, existingCorpus: existing, candidate: { doi, source, title: result.title, url: result.url, text: result.text?.slice(0, 6_000) } }) },
      ],
    }), 20_000);
    const extraction = JSON.parse(completion.choices[0]?.message.content ?? "{}") as Partial<Extraction>;
    const document: ResearchDocument = {
      id, doi, url: result.url ?? (isUrl(source) ? source : undefined), title: extraction.title || result.title || (doi ? `DOI ${doi}` : "Documento descubierto"), year: new Date().getFullYear(),
      authors: extraction.authors?.length ? extraction.authors : ["Autor no disponible"],
      summary: extraction.summary || result.text?.slice(0, 500) || "Sin resumen disponible.",
      affinity: Math.max(0, Math.min(100, Number(extraction.affinity) || 0)),
      affinityReason: extraction.affinityReason || "El modelo no devolvió explicación de afinidad.",
      entities: extraction.entities?.slice(0, 8) || [], color: "teal",
    };
    const citations = (extraction.citations || []).filter((citation) => project!.documents.some((document) => document.id === citation.documentId));
    const edges: KnowledgeEdge[] = citations.length
      ? citations.map((citation) => ({ id: `${id}-cites-${citation.documentId}`, source: id, target: citation.documentId, kind: "citation", label: citation.explanation || "citación extraída" }))
      : [];

    return NextResponse.json({ document, edges, simulated: false });
  } catch (error) {
    console.error("DOI ingestion failed", error);
    if (project && source) {
      const fallbackId = `source-${(doi ?? source).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      const document: ResearchDocument = {
        id: fallbackId, doi, url: isUrl(source) ? source : undefined,
        title: doi ? `Documento DOI: ${doi}` : "Fuente descubierta — enriquecimiento pendiente",
        year: new Date().getFullYear(), authors: ["Metadatos pendientes"],
        summary: "La fuente se incorporó de forma segura, pero el enriquecimiento remoto no respondió. Nexus la mantiene separada de las citas verificadas hasta reintentar.",
        affinity: 60, affinityReason: `Coincidencia preliminar con el objetivo: ${project.purpose}`,
        entities: ["enriquecimiento pendiente", "fuente externa"], color: "teal",
      };
      return NextResponse.json({ document, edges: [], simulated: true, degraded: true });
    }
    return NextResponse.json({ error: "La ingesta no pudo procesar la solicitud." }, { status: 500 });
  }
}
