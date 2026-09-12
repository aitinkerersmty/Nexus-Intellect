import { NextResponse } from "next/server";
import Exa from "exa-js";
import OpenAI from "openai";
import type { KnowledgeEdge, ResearchDocument, ResearchProject } from "@/lib/mockData";

const normalizeDoi = (value: string) => value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type Extraction = Pick<ResearchDocument, "title" | "authors" | "summary" | "affinity" | "affinityReason" | "entities"> & {
  citations: Array<{ documentId: string; explanation: string }>;
};

export async function POST(request: Request) {
  try {
    const { doi: rawDoi, project } = (await request.json()) as { doi?: string; project?: ResearchProject };
    const doi = rawDoi ? normalizeDoi(rawDoi) : "";
    if (!doi || !project) return NextResponse.json({ error: "Se requiere DOI y contexto del proyecto." }, { status: 400 });

    const id = `doi-${doi.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    if (project.documents.some((document) => document.doi === doi)) return NextResponse.json({ error: "Ese DOI ya está en el corpus." }, { status: 409 });

    if (!process.env.EXA_API_KEY || !process.env.OPENROUTER_API_KEY) {
      const document: ResearchDocument = {
        id, doi, title: `Documento DOI: ${doi}`, year: new Date().getFullYear(), authors: ["Metadatos pendientes"],
        summary: "Ingesta de demostración. Añade EXA_API_KEY y OPENROUTER_API_KEY para extraer metadatos, contenido y citas verificables.",
        affinity: 75, affinityReason: `Coincidencia preliminar con el propósito: ${project.purpose}`, entities: ["DOI", "pendiente de extracción"], color: "teal",
      };
      const edges: KnowledgeEdge[] = [{ id: `${id}-topic`, source: id, target: project.documents[0].id, kind: "topic", label: "afinidad preliminar por propósito" }];
      return NextResponse.json({ document, edges, simulated: true });
    }

    const exa = new Exa(process.env.EXA_API_KEY);
    const search = await exa.searchAndContents(`doi:${doi}`, { type: "auto", numResults: 1, text: { maxCharacters: 6_000 } });
    const result = search.results[0];
    if (!result) return NextResponse.json({ error: "Exa no encontró contenido para ese DOI." }, { status: 404 });

    const existing = project.documents.map((document) => ({ id: document.id, title: document.title, summary: document.summary }));
    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Extrae información bibliográfica sin inventar datos. Devuelve JSON con title, authors (string[]), summary, affinity (0-100), affinityReason, entities (string[]) y citations ({documentId, explanation}[]). citations solo puede usar IDs del corpus existente y solo cuando el texto demuestra una cita real." },
        { role: "user", content: JSON.stringify({ projectPurpose: project.purpose, existingCorpus: existing, candidate: { doi, title: result.title, url: result.url, text: result.text?.slice(0, 6_000) } }) },
      ],
    });
    const extraction = JSON.parse(completion.choices[0]?.message.content ?? "{}") as Partial<Extraction>;
    const document: ResearchDocument = {
      id, doi, title: extraction.title || result.title || `DOI ${doi}`, year: new Date().getFullYear(),
      authors: extraction.authors?.length ? extraction.authors : ["Autor no disponible"],
      summary: extraction.summary || result.text?.slice(0, 500) || "Sin resumen disponible.",
      affinity: Math.max(0, Math.min(100, Number(extraction.affinity) || 0)),
      affinityReason: extraction.affinityReason || "El modelo no devolvió explicación de afinidad.",
      entities: extraction.entities?.slice(0, 8) || [], color: "teal",
    };
    const citations = (extraction.citations || []).filter((citation) => project.documents.some((document) => document.id === citation.documentId));
    const edges: KnowledgeEdge[] = citations.length
      ? citations.map((citation) => ({ id: `${id}-cites-${citation.documentId}`, source: id, target: citation.documentId, kind: "citation", label: citation.explanation || "citación extraída" }))
      : [{ id: `${id}-topic`, source: id, target: project.documents[0].id, kind: "topic", label: "afinidad temática con el propósito" }];

    return NextResponse.json({ document, edges, simulated: false });
  } catch (error) {
    console.error("DOI ingestion failed", error);
    return NextResponse.json({ error: "La ingesta DOI falló. Verifica las claves y el DOI." }, { status: 500 });
  }
}
