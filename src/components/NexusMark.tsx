export function NexusMark({ size = 32 }: { size?: number }) {
  return <span aria-label="Nexus Intellect" className="grid shrink-0 place-items-center rounded-lg border border-zinc-900 bg-white text-zinc-950 shadow-sm" style={{ width: size, height: size }}>
    <svg aria-hidden="true" viewBox="0 0 32 32" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} fill="none">
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8 20.8 16 7l8 13.8-8 4.2-8-4.2Z" fill="currentColor" />
      <circle cx="16" cy="16" r="2.7" fill="white" />
    </svg>
  </span>;
}
