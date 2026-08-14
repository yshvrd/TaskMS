import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Filter, Calendar, User, LayoutList } from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import TaskModal from '../components/TaskModal';

// A sleek skeleton loader for the table
const TableSkeleton = ({ columns }) => (
  <div className="animate-pulse space-y-0 py-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100">
        <div className="flex gap-4 items-center w-1/3">
          <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 rounded-full w-20"></div></div>
        {columns > 4 && <div className="flex-1 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></div>}
        <div className="flex-1 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></div>
      </div>
    ))}
  </div>
);

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // User & Admin States
  const [currentUser, setCurrentUser] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  
  // URL States for filtering/pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Initialization: Get user role and mapped names if admin
  useEffect(() => {
    const initializeData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;
        setCurrentUser(user);

        if (user.role === 'admin') {
          try {
            const usersListRes = await api.get('/users/');
            const map = {};
            usersListRes.data.forEach(u => {
              map[u.id] = u.name;
            });
            setUsersMap(map);
          } catch (err) {
            console.error("Failed to fetch user list for admin", err);
          }
        }
      } catch (error) {
        console.error("Failed to initialize user data", error);
      } finally {
        setInitLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/tasks/?${params.toString()}`);
      setTasks(response.data.items);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search effect
  useEffect(() => {
    if (initLoading) return; // Wait for auth check before fetching tasks
    const delayDebounceFn = setTimeout(() => { fetchTasks(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, page, initLoading]);

  const isAdmin = currentUser?.role === 'admin';
  const tableColumns = isAdmin ? 5 : 4;

  if (initLoading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading workspace...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create, assign, and track your team's progress.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-sm shadow-indigo-200 hover:shadow-md transition-all active:scale-95">
          <Plus className="h-4 w-4 mr-2" /> Create Task
        </Button>
      </div>

      {/* Control Bar (Search & Filters) */}
      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task name..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex items-center px-1">
          <Filter className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <select 
            className="w-full sm:w-auto bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 cursor-pointer text-slate-700 font-medium transition-all outline-none appearance-none pr-8 relative"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Task Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={tableColumns}><TableSkeleton columns={tableColumns} /></td></tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns} className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 border border-slate-100">
                      <LayoutList className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">No tasks found</h3>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters, or create a new task.</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  // Determine display name for avatar & column
                  const assigneeName = isAdmin 
                    ? (usersMap[task.assigned_to] || 'Unassigned') 
                    : (currentUser?.name || 'Me');
                  const initials = assigneeName !== 'Unassigned' ? assigneeName.charAt(0).toUpperCase() : '?';

                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm mr-4 border border-indigo-200 shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">Created {format(new Date(task.created_at), 'MMM dd')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-slate-700">
                            <User className="h-4 w-4 mr-2 text-slate-400" />
                            {assigneeName}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-slate-600">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : <span className="text-slate-400">No date</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />
    </div>
  );
};

export default TaskList;
