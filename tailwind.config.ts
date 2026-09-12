import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { primary: "var(--color-primary)", secondary: "var(--color-secondary)", accent: "var(--color-accent)" } } },
} satisfies Config;
