export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-5">
      <h1 className="text-xl font-bold text-white">TaskMS</h1>

      <nav className="mt-8 space-y-1">
        <a
          href="/dashboard"
          className="block rounded-lg bg-slate-800 px-4 py-3 text-sm text-white"
        >
          Dashboard
        </a>

        <a
          href="/tasks"
          className="block rounded-lg px-4 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          Tasks
        </a>
      </nav>
    </aside>
  );
}
