import { NextResponse } from "next/server";
import type { ResearchProject } from "@/lib/mockData";

const supportedModels = new Set(["anthropic/claude-3.5-sonnet", "openai/gpt-4o-mini", "google/gemini-2.0-flash-001", "meta-llama/llama-3.1-70b-instruct"]);
function contingency(project: ResearchProject, selectedId: string | undefined, question: string) {
  const selected = project.documents.find((document) => document.id === selectedId) ?? project.documents[0];
  const related = project.edges.filter((edge) => edge.source === selected.id || edge.target === selected.id);
  const evidence = project.documents.filter((document) => document.id === selected.id || related.some((edge) => edge.source === document.id || edge.target === document.id)).slice(0, 3);
  const names = evidence.map((document) => "“" + document.title + "”").join(", ");
  const relationship = related.length
    ? "El grafo contiene " + related.length + " relación(es) explicada(s) desde este nodo; revísalas antes de convertirlas en una afirmación."
    : "No hay una cita verificable directa desde este nodo; trátalo como un vacío de investigación, no como una conclusión.";
  return {
    answer: "Modo de contingencia: la inferencia remota no estuvo disponible. HECHO: “" + selected.title + "” aporta " + selected.summary + " INFERENCIA: para responder “" + question + "”, contrasta esta fuente con " + names + ". VACÍO: " + relationship + " Próxima acción: abre el grafo y valida la arista antes de incorporarla al borrador.",
    sources: evidence.map((document) => ({ id: document.id, title: document.title })),
    mode: "contingency",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string; project?: ResearchProject; selectedId?: string; model?: string };
  if (!body.question?.trim() || !body.project) return NextResponse.json({ error: "Se requiere una pregunta y un corpus de investigación." }, { status: 400 });
  const question = body.question;
  const project = body.project;
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json(contingency(project, body.selectedId, question));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);
  try {
    const context = {
      goal: project.purpose,
      scope: project.scope,
      selected: project.documents.find((document) => document.id === body.selectedId),
      documents: project.documents.map(({ id, title, authors, year, summary, entities }) => ({ id, title, authors, year, summary, entities })),
      relationships: project.edges.map((edge) => ({ from: edge.source, to: edge.target, kind: edge.kind, explanation: edge.label })),
    };
    const model = supportedModels.has(body.model ?? "") ? body.model! : (process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini");
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", signal: controller.signal, headers: { Authorization: "Bearer " + process.env.OPENROUTER_API_KEY, "Content-Type": "application/json", "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://nexus-intellect.vercel.app", "X-Title": "Nexus Intellect" }, body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: "system", content: "Eres Nexus Intellect, un agente de investigación. Responde en español. Usa solamente el corpus recibido; cita fuentes por título, distingue HECHO, INFERENCIA y VACÍO; nunca conviertas afinidades temáticas en citas. Cierra con una próxima acción concreta." }, { role: "user", content: JSON.stringify({ question, context }) }] }) });
    const payload = await upstream.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!upstream.ok) throw new Error("OpenRouter " + upstream.status + ": " + (payload.error?.message ?? "respuesta no válida"));
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("El modelo no devolvió contenido.");
    return NextResponse.json({ answer, sources: project.documents.slice(0, 4).map(({ id, title }) => ({ id, title })), mode: "model" });
  } catch (error) {
    console.error("Nexus agent provider failed", { message: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json(contingency(project, body.selectedId, question));
  } finally { clearTimeout(timer); }
}
