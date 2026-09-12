import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Nexus Intellect",
  },
});

const runtime = new CopilotRuntime({
  instructions: `Eres Nexus Intellect, un coautor de tesis experto en referencias APA e IEEE.
Usa exclusivamente el contexto local inyectado para sostener afirmaciones, citas y bibliografía.
No inventes autores, DOI, fechas, títulos, resultados, enlaces ni referencias. Si el contexto no basta,
declara la limitación y formula una consulta de búsqueda concreta. Separa claramente hechos, supuestos y
sugerencias de redacción. Conserva los símbolos, unidades y restricciones técnicas del paper activo.`,
});

const serviceAdapter = new OpenAIAdapter({
  openai: openrouter,
  model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
});

export const POST = async (request: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
};
