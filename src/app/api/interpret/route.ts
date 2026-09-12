import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResearchDocument, ResearchProject } from "@/lib/mockData";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Nexus Intellect",
  },
});

const isModelId = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 160 && /^[a-z0-9][a-z0-9._:-]*\/[a-z0-9][a-z0-9._:-]*$/i.test(value);

const demoInterpretation = (document: ResearchDocument, project: ResearchProject) =>
  `Interpretación de demostración: el resumen indica que ${document.summary} En relación con el propósito “${project.purpose}”, este trabajo parece aportar evidencia o un marco útil, pero debe contrastarse con el texto completo y sus resultados cuantitativos antes de extraer conclusiones definitivas.`;

export async function POST(request: Request) {
  try {
    const { document, project, models } = (await request.json()) as {
      document?: ResearchDocument;
      project?: ResearchProject;
      models?: unknown[];
    };
    const selectedModels = [...new Set((models ?? []).filter(isModelId))].slice(0, 4);

    if (!document?.id || !document.title || !project?.purpose) {
      return NextResponse.json({ error: "Se requiere el documento y el contexto del proyecto." }, { status: 400 });
    }
    if (!selectedModels.length) {
      return NextResponse.json({ error: "Selecciona al menos un modelo de OpenRouter." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        simulated: true,
        interpretations: selectedModels.map((model) => ({ model, summary: demoInterpretation(document, project), ok: true })),
      });
    }

    const relatedEdges = project.edges
      .filter((edge) => edge.source === document.id || edge.target === document.id)
      .map((edge) => ({ kind: edge.kind, label: edge.label }));
    const source = {
      title: document.title,
      authors: document.authors,
      year: document.year,
      summary: document.summary.slice(0, 8_000),
      entities: document.entities,
      connections: relatedEdges,
    };
    const messages = [
      {
        role: "system" as const,
        content: "Eres un asistente de investigación riguroso. Interpreta únicamente la información proporcionada; no inventes resultados, métodos, cifras ni causalidad. Escribe en español un resumen breve (máximo 180 palabras) que cubra: aporte o resultado aparente, relevancia para el propósito y una cautela o limitación de la evidencia disponible.",
      },
      { role: "user" as const, content: JSON.stringify({ project: { purpose: project.purpose, scope: project.scope }, paper: source }) },
    ];
    const interpretations = await Promise.all(selectedModels.map(async (model) => {
      try {
        const completion = await openrouter.chat.completions.create({ model, messages, temperature: 0.2, max_tokens: 350 });
        const content = completion.choices[0]?.message.content;
        if (!content || typeof content !== "string") throw new Error("El modelo no devolvió una interpretación.");
        return { model, summary: content.trim(), ok: true };
      } catch (error) {
        console.error(`Interpretation failed for ${model}`, error);
        return { model, summary: "", ok: false, error: "No fue posible obtener la interpretación de este modelo." };
      }
    }));

    return NextResponse.json({ simulated: false, interpretations });
  } catch (error) {
    console.error("Paper interpretation failed", error);
    return NextResponse.json({ error: "No fue posible interpretar el documento." }, { status: 500 });
  }
}
