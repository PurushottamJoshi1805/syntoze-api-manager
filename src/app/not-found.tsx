import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090C] text-zinc-100 p-4 font-sans selection:bg-indigo-500/25 selection:text-white">
      <div className="text-center space-y-3 max-w-sm">
        <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          404
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-white">Page not found</h2>
        <p className="text-xs text-zinc-400">
          The requested route or resource does not exist in this vault.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Return to vault
          </Link>
        </div>
      </div>
    </div>
  );
}
