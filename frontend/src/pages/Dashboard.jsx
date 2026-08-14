import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ListTodo, Clock, Zap, BadgeCheck, AlertOctagon, ArrowRight, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/ui/Badges';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState({ text: '', loading: true });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, userRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/tasks/?limit=5&sort_by=updated_at&sort_order=desc'),
          api.get('/auth/me')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.items);
        setUser(userRes.data);
      } catch (error) {} finally { setLoading(false); }
    };

    const fetchExternalAdvice = async () => {
      try {
        // Now fetching from OUR backend, not directly from the external API
        const response = await api.get('/external/advice');
        setAdvice({ text: response.data.text, loading: false });
      } catch (error) {
        setAdvice({ text: "Stay focused and keep shipping great work.", loading: false });
      }
    };

    fetchDashboardData();
    fetchExternalAdvice();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div></div>;

  const activeTasksCount = (stats?.pending || 0) + (stats?.in_progress || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="relative z-10 w-full md:w-1/2 overflow-hidden">
          <h1 className="text-3xl font-bold mb-2">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h1>
          <p className="text-indigo-100 text-lg truncate whitespace-nowrap w-full">
            You have {activeTasksCount} active {activeTasksCount === 1 ? 'task' : 'tasks'} requiring your attention today. Let's make it a productive day.
          </p>
        </div>

        {/* External API Integration UI */}
        <div className="relative z-10 w-full md:w-1/3 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-indigo-200 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Daily Motivation</p>
              {advice.loading ? (
                <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <p className="text-sm text-white font-medium leading-relaxed">"{advice.text}"</p>
              )}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-64 h-64 bg-white dark:bg-black opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="bg-blue-500" />
        <StatCard title="Pending" value={stats?.pending || 0} icon={Clock} color="bg-slate-500" />
        <StatCard title="In Progress" value={stats?.in_progress || 0} icon={Zap} color="bg-amber-500" />
        <StatCard title="Completed" value={stats?.completed || 0} icon={BadgeCheck} color="bg-emerald-500" />
        <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertOctagon} color="bg-rose-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recently Updated Tasks</h2>
          <button onClick={() => navigate('/tasks')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center group">
            View all <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No recent activity found.</div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${task.priority === 'high' || task.priority === 'urgent' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updated {format(new Date(task.updated_at), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3"><StatusBadge status={task.status} /></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
