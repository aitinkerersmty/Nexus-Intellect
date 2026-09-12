"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { NexusMark } from "@/components/NexusMark";

export default function LoginPage() {
  return <main className="nx-shell grid min-h-screen place-items-center p-5"><section className="nx-panel w-full max-w-md rounded-2xl p-7 shadow-xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold nx-muted hover:underline"><ArrowLeft size={15} />Volver al workspace</Link><div className="mt-8 flex items-center gap-3"><NexusMark size={42} /><div><p className="text-sm font-bold">Nexus Intellect</p><p className="text-xs nx-muted">Research operating system</p></div></div><h1 className="mt-8 text-2xl font-bold tracking-tight">Sincroniza tu investigación.</h1><p className="mt-3 text-sm leading-6 nx-muted">Tu workspace funciona en modo invitado. Conecta Google para vincular identidad y futuras capacidades de sincronización.</p><button onClick={() => signIn("google", { callbackUrl: "/" })} className="nx-btn-primary mt-7 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold">Continuar con Google <ChevronRight size={16} /></button><div className="mt-6 flex items-start gap-2 border-t pt-5 text-xs leading-5 nx-muted nx-border"><LockKeyhole size={14} className="mt-0.5 shrink-0" />Nexus no bloquea el trabajo por autenticación: puedes regresar y explorar el corpus, editor y grafo sin iniciar sesión.</div></section></main>;
}
