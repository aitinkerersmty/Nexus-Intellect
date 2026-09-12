import { schedules, task } from "@trigger.dev/sdk/v3";
import Exa from "exa-js";
import { papers, type PaperId } from "@/lib/mockData";

type ResearchSyncPayload = { paperId: PaperId };

type Breakthrough = {
  title: string;
  url: string;
  publishedDate?: string;
  summary: string;
};

async function findBreakthroughs(paperId: PaperId) {
  const paper = papers[paperId];
  const query = `${paper.keywords.join(" ")} recent peer reviewed research`;

  // La API se mantiene opcional para que la demo funcione sin credenciales.
  if (!process.env.EXA_API_KEY) {
    return {
      paperId,
      query,
      simulated: true,
      findings: [
        {
          title: `Búsqueda pendiente para: ${paper.keywords.slice(0, 2).join(" + ")}`,
          url: "https://exa.ai",
          summary: "Configura EXA_API_KEY para recuperar literatura reciente verificable.",
        },
      ] satisfies Breakthrough[],
    };
  }

  const exa = new Exa(process.env.EXA_API_KEY);
  const response = await exa.searchAndContents(query, {
    type: "auto",
    numResults: 5,
    text: { maxCharacters: 1_200 },
  });

  return {
    paperId,
    query,
    simulated: false,
    findings: response.results.map((result) => ({
      title: result.title ?? "Artículo sin título",
      url: result.url,
      publishedDate: result.publishedDate,
      summary: result.text?.slice(0, 500) ?? "Sin resumen disponible.",
    })) satisfies Breakthrough[],
  };
}

/** Invocable por la UI o una API con el paper que el usuario tiene activo. */
export const researchSync = task({
  id: "research-sync",
  run: async ({ paperId }: ResearchSyncPayload) => findBreakthroughs(paperId),
});

/** Demostración cron: el estado activo real se persistirá en una fase posterior. */
export const researchSyncCron = schedules.task({
  id: "research-sync-cron",
  cron: "0 */6 * * *",
  run: async () => findBreakthroughs("1"),
});
