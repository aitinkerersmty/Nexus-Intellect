# Nexus Intellect

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

Completa `OPENROUTER_API_KEY` y, para la investigación proactiva real, `EXA_API_KEY`.

Para registrar las tareas de Trigger.dev:

```bash
npx trigger.dev@latest dev
```
