import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env["NEXTAUTH_SECRET"],
  providers: [GoogleProvider({ clientId: process.env["GOOGLE_CLIENT_ID"] || "580694929186-gq4v5qehbf0376fs1ob9c671o7r36h2f.apps.googleusercontent.com", clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "" })],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
};
