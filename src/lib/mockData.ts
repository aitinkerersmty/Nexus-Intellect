export type PaperId = "1" | "2";

export type ResearchPaper = {
  id: PaperId;
  title: string;
  shortTitle: string;
  keywords: string[];
  draft: string;
  contextMarkdown: string;
  bibliography: string[];
};

export const papers: Record<PaperId, ResearchPaper> = {
  "1": {
    id: "1",
    title: "Desarrollo de propulsión de estado sólido y cálculos de delta-v mediante la ecuación de Tsiolkovsky para vuelo suborbital",
    shortTitle: "Propulsión sólida y delta-v",
    keywords: ["Tsiolkovsky", "propulsión de estado sólido", "delta-v", "vuelo suborbital"],
    draft: `# Propulsión sólida para vuelo suborbital\n\n## Planteamiento\n\nEste trabajo evalúa la viabilidad de un motor de propulsante sólido para una misión suborbital. La métrica de diseño principal es el delta-v, calculado mediante la ecuación de Tsiolkovsky.\n\n## Modelo preliminar\n\nLa relación de masas condiciona la velocidad final alcanzable. Se compararán formulaciones de propulsante, impulso específico y pérdidas gravitacionales para establecer una envolvente de misión reproducible.`,
    contextMarkdown: `# Contexto local: propulsión sólida\n\n## Alcance\nSe estudia un vehículo suborbital de una etapa con motor de propulsante sólido. El modelo de primer orden usa:\n\n\\[\\Delta v = I_{sp} g_0 \\ln(m_0/m_f)\\]\n\n- (I_{sp}): impulso específico efectivo.\n- (g_0 = 9.80665\\,m/s^2).\n- (m_0/m_f): relación de masas antes y después de la combustión.\n\n## Suposiciones\n- La ecuación ideal no incluye arrastre, pérdidas gravitacionales ni dispersión de manufactura.\n- El rendimiento depende de geometría del grano, presión de cámara y expansión de tobera.\n- Cualquier cifra de desempeño debe distinguir delta-v ideal y delta-v de misión.\n\n## Preguntas de investigación\n1. ¿Qué combinación de relación de masas e (I_{sp}) satisface el perfil suborbital?\n2. ¿Cómo cambia la predicción al incorporar pérdidas?\n3. ¿Qué parámetros requieren validación experimental?`,
    bibliography: [
      "Tsiolkovsky, K. E. (1903). Exploration of outer space by means of rocket devices.",
      "Sutton, G. P., & Biblarz, O. (2017). Rocket Propulsion Elements (9th ed.). Wiley.",
      "Humble, R. W., Henry, G. N., & Larson, W. J. (1995). Space Propulsion Analysis and Design. McGraw-Hill.",
    ],
  },
  "2": {
    id: "2",
    title: "Análisis de aberraciones cromáticas y trazado de rayos en óptica paraxial para sistemas NLOS",
    shortTitle: "Óptica paraxial y NLOS",
    keywords: ["NLOS", "Zemax", "aberración cromática", "trazado de rayos", "óptica paraxial"],
    draft: `# Óptica paraxial en sistemas NLOS\n\n## Introducción\n\nLos sistemas de imagen no line-of-sight (NLOS) recuperan información de escenas ocultas a partir de luz indirecta. Este estudio modela la contribución de aberraciones cromáticas mediante trazado de rayos paraxial.\n\n## Método\n\nSe contrastará un modelo de lente delgada con simulaciones de trazado de rayos y métricas de dispersión axial y lateral.`,
    contextMarkdown: `# Contexto local: óptica paraxial y NLOS\n\n## Alcance\nEl sistema NLOS se analiza desde una aproximación paraxial; el trazado de rayos permite estimar cómo las aberraciones afectan la reconstrucción de escenas ocultas.\n\n## Conceptos disponibles\n- La aberración cromática longitudinal desplaza el foco según la longitud de onda.\n- La aberración cromática lateral altera la magnificación con la longitud de onda.\n- El modelo paraxial es una aproximación: sus resultados no sustituyen un trazado no paraxial o validación experimental.\n- Zemax se considera una herramienta de simulación y validación óptica, no una fuente bibliográfica.\n\n## Preguntas de investigación\n1. ¿Qué aberración domina el error de reconstrucción NLOS?\n2. ¿Cuándo deja de ser válido el modelo paraxial?\n3. ¿Qué métricas de trazado de rayos deben reportarse para reproducibilidad?`,
    bibliography: [
      "Goodman, J. W. (2015). Introduction to Fourier Optics (4th ed.). W. H. Freeman.",
      "Hecht, E. (2017). Optics (5th ed.). Pearson.",
      "O'Toole, M., Lindell, D. B., & Wetzstein, G. (2018). Confocal non-line-of-sight imaging. Nature, 555, 338–341.",
    ],
  },
};

export const paperList = Object.values(papers);
