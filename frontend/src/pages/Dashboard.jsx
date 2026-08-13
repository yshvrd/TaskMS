import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setUser(data));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header user={user} />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 text-slate-400">
            Here's what's happening with your tasks.
          </p>
        </main>
      </div>
    </div>
  );
}
