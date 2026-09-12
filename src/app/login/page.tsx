"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-500">Nexus Intellect</p><h1 className="mt-3 text-2xl font-bold text-blue-950">Investiga con contexto</h1><p className="mt-3 text-sm text-slate-500">Inicia sesión para acceder a tu workspace de investigación.</p><button onClick={() => signIn("google", { callbackUrl: "/" })} className="mt-7 w-full rounded-xl bg-blue-950 px-4 py-3 text-sm font-bold text-white">Continuar con Google</button></section></main>;
}
