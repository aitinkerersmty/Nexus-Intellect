import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import OpenAI from "openai";

const runtime = new CopilotRuntime();
const allowedModels = new Set(["anthropic/claude-3.5-sonnet", "openai/gpt-4o-mini", "google/gemini-2.0-flash-001", "meta-llama/llama-3.1-70b-instruct"]);

export const POST = async (request: Request) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response("OPENROUTER_API_KEY no configurada", { status: 503 });
  }

  const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nexus Intellect",
    },
  });
  const requestedModel = new URL(request.url).searchParams.get("model") ?? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  const serviceAdapter = new OpenAIAdapter({
    openai: openrouter,
    model: allowedModels.has(requestedModel) ? requestedModel : "openai/gpt-4o-mini",
  });
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
};
