import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Nexus Intellect",
  description: "Agente coautor de tesis contextualizado",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
