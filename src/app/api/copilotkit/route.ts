import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import OpenAI from "openai";

const runtime = new CopilotRuntime();

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
  const serviceAdapter = new OpenAIAdapter({
    openai: openrouter,
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  });
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
};
