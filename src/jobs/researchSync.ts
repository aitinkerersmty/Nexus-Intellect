import { schedules, task } from "@trigger.dev/sdk/v3";
import Exa from "exa-js";
import { demoProject } from "@/lib/mockData";

type ResearchSyncPayload = { documentId?: string; keywords?: string[] };

async function findBreakthroughs({ documentId, keywords }: ResearchSyncPayload) {
  const document = demoProject.documents.find((item) => item.id === documentId);
  const terms = keywords?.length ? keywords : document?.entities ?? ["propulsión sólida", "delta-v"];
  const query = `${terms.join(" ")} recent peer reviewed research`;
  if (!process.env.EXA_API_KEY) return { query, simulated: true, findings: [{ title: "Búsqueda lista para activar", url: "https://exa.ai", summary: "Configura EXA_API_KEY para recuperar avances verificables." }] };
  const exa = new Exa(process.env.EXA_API_KEY);
  const response = await exa.searchAndContents(query, { type: "auto", numResults: 5, text: { maxCharacters: 1_200 } });
  return { query, simulated: false, findings: response.results.map((result) => ({ title: result.title ?? "Artículo sin título", url: result.url, publishedDate: result.publishedDate, summary: result.text?.slice(0, 500) ?? "Sin resumen disponible." })) };
}

export const researchSync = task({ id: "research-sync", run: findBreakthroughs });
export const researchSyncCron = schedules.task({ id: "research-sync-cron", cron: "0 */6 * * *", run: async () => findBreakthroughs({}) });
