import { NextResponse } from "next/server";

type OpenRouterModel = {
  id?: string;
  name?: string;
  architecture?: { output_modalities?: string[] };
};

const fallbackModels = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct" },
];

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models?output_modalities=text&sort=most-popular", {
      headers: process.env.OPENROUTER_API_KEY ? { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } : {},
      next: { revalidate: 3_600 },
    });
    if (!response.ok) throw new Error(`OpenRouter devolvió ${response.status}`);

    const payload = (await response.json()) as { data?: OpenRouterModel[] };
    const models = (payload.data ?? [])
      .filter((model) => model.id && model.architecture?.output_modalities?.includes("text"))
      .slice(0, 250)
      .map((model) => ({ id: model.id!, name: model.name || model.id! }));

    return NextResponse.json({ models: models.length ? models : fallbackModels });
  } catch {
    // The selector remains useful offline and before the API key has been configured.
    return NextResponse.json({ models: fallbackModels, fallback: true });
  }
}
