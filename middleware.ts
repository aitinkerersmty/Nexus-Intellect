import { NextResponse } from "next/server";

// The research workspace supports an intentional guest mode. Authentication is
// available from the account menu for sync, but never blocks a researcher from
// opening a corpus, reviewing evidence, or drafting a document.
export function middleware() {
  return NextResponse.next();
}
