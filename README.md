# Nexus Intellect

Plataforma de investigación con un grafo de conocimiento como contexto del agente. El demo inicia con **Diseño de Cohete Suborbital**, dos papers y una arista de citación real.

## Ejecutar

```bash
npm install
copy .env.example .env.local
npm run dev
```

El comando equivalente al andamiaje solicitado, cuando se inicializa en una carpeta vacía nueva, es:

```bash
npx create-next-app@latest nexus-intellect --typescript --tailwind --eslint --app --src-dir --use-npm
cd nexus-intellect
npm i @copilotkit/react-core @copilotkit/react-ui @copilotkit/react-textarea @copilotkit/runtime @trigger.dev/sdk exa-js openai lucide-react
```

Completa `OPENROUTER_API_KEY` y `EXA_API_KEY` para habilitar la ingesta DOI verificable y la exploración de vanguardia. Sin claves, el flujo DOI funciona en modo demostración y queda marcado como tal.

Para registrar las tareas de Trigger.dev:

```bash
npx trigger.dev@latest dev
```
