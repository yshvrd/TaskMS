import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ListTodo, CircleDashed, Zap, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/ui/Badges';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
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
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate actual active tasks properly avoiding NaN issues
  const activeTasksCount = (stats?.pending || 0) + (stats?.in_progress || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 w-full overflow-hidden">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          {/* Forced single liner using truncate / whitespace-nowrap */}
          <p className="text-indigo-100 text-lg truncate whitespace-nowrap w-full">
            You have {activeTasksCount} active {activeTasksCount === 1 ? 'task' : 'tasks'} requiring your attention today. Let's make it a productive day.
          </p>
        </div>
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Stats Grid - 5 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="bg-blue-500" />
        <StatCard title="Pending" value={stats?.pending || 0} icon={CircleDashed} color="bg-slate-500" />
        <StatCard title="In Progress" value={stats?.in_progress || 0} icon={Zap} color="bg-amber-500" />
        <StatCard title="Completed" value={stats?.completed || 0} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertCircle} color="bg-rose-500" />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Tasks</h2>
          <button onClick={() => navigate('/tasks')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center group">
            View all <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent activity found.</div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${task.priority === 'high' || task.priority === 'urgent' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-500">Updated {format(new Date(task.updated_at), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
