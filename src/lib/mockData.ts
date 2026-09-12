export type EdgeKind = "citation" | "topic";

export type ResearchDocument = {
  id: string;
  title: string;
  doi?: string;
  year: number;
  authors: string[];
  summary: string;
  affinity: number;
  affinityReason: string;
  entities: string[];
  color: "orange" | "blue" | "teal";
  isSeed?: boolean;
};

export type KnowledgeEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label: string;
};

export type ResearchProject = {
  id: string;
  name: string;
  purpose: string;
  scope: string;
  documents: ResearchDocument[];
  edges: KnowledgeEdge[];
};

export const demoProject: ResearchProject = {
  id: "rocket-suborbital",
  name: "Diseño de Cohete Suborbital",
  purpose: "Maximizar la potencia bruta y calcular el delta-v para alcanzar grandes altitudes utilizando propulsión sólida.",
  scope: "Modelo de una etapa, propulsante sólido, relación de masas, pérdidas de misión y geometría de grano.",
  documents: [
    {
      id: "thermodynamics",
      title: "Modelo termodinámico y delta-v para motores cohete de propulsante sólido",
      doi: "10.0000/nexus.thermo.2024",
      year: 2024,
      authors: ["M. Rivera", "L. Campos"],
      summary: "Formula la envolvente de desempeño con la ecuación de Tsiolkovsky, impulso específico efectivo y pérdidas gravitacionales.",
      affinity: 95,
      affinityReason: "Relaciona directamente el delta-v y el desempeño del motor con el propósito del proyecto.",
      entities: ["Tsiolkovsky", "delta-v", "impulso específico", "pérdidas gravitacionales"],
      color: "orange",
      isSeed: true,
    },
    {
      id: "grain-geometry",
      title: "Geometrías de grano y perfiles de empuje para propulsantes compuestos",
      doi: "10.0000/nexus.grain.2024",
      year: 2024,
      authors: ["S. Ibarra", "P. Torres"],
      summary: "Evalúa geometrías cilíndricas, estrella y finocil para controlar el área de combustión y el perfil de empuje.",
      affinity: 95,
      affinityReason: "La geometría del grano determina la curva de empuje requerida para el perfil suborbital.",
      entities: ["geometría de grano", "área de combustión", "presión de cámara", "propulsante compuesto"],
      color: "orange",
      isSeed: true,
    },
    {
      id: "mission-losses",
      title: "Estimación de pérdidas de trayectoria en ascensos suborbitales",
      year: 2022,
      authors: ["A. Nuñez"],
      summary: "Marco de estimación para separar pérdidas por gravedad y arrastre de la velocidad ideal disponible.",
      affinity: 82,
      affinityReason: "Complementa el cálculo ideal de delta-v con pérdidas de misión relevantes.",
      entities: ["arrastre", "trayectoria", "pérdidas de gravedad"],
      color: "blue",
    },
  ],
  edges: [
    { id: "grain-cites-thermo", source: "grain-geometry", target: "thermodynamics", kind: "citation", label: "cita el modelo de delta-v" },
    { id: "thermo-topic-losses", source: "thermodynamics", target: "mission-losses", kind: "topic", label: "afinidad: pérdidas de misión" },
    { id: "grain-topic-losses", source: "grain-geometry", target: "mission-losses", kind: "topic", label: "afinidad: perfil de ascenso" },
  ],
};

export const graphContext = (project: ResearchProject) => ({
  project: { name: project.name, purpose: project.purpose, scope: project.scope },
  documents: project.documents.map(({ id, title, summary, affinity, entities, authors, year }) => ({ id, title, summary, affinity, entities, authors, year })),
  edges: project.edges.map((edge) => ({
    from: project.documents.find((document) => document.id === edge.source)?.title,
    to: project.documents.find((document) => document.id === edge.target)?.title,
    relationship: edge.kind === "citation" ? `CITACIÓN REAL: ${edge.label}` : `AFINIDAD TEMÁTICA: ${edge.label}`,
  })),
});
