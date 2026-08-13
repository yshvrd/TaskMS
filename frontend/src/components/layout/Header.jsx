export default function Header({ user }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
      </div>

      <div className="text-sm text-slate-400">
        {user?.name}
      </div>
    </header>
  );
}
