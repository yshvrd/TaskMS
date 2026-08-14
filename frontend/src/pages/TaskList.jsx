import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Filter, Calendar, User, LayoutList, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import TaskModal from '../components/TaskModal';

const TableSkeleton = ({ columns }) => (
  <div className="animate-pulse space-y-0 py-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex gap-4 items-center w-1/3">
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div></div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></div>
        {columns > 4 && <div className="flex-1 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></div>}
        <div className="flex-1 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></div>
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
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10); 
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setCurrentUser(userRes.data);
        if (userRes.data.role === 'admin') {
          try {
            const usersListRes = await api.get('/users/');
            const map = {};
            usersListRes.data.forEach(u => { map[u.id] = u.name; });
            setUsersMap(map);
          } catch (err) {}
        }
      } catch (error) {} finally { setInitLoading(false); }
    };
    initializeData();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, sort_by: sortBy, sort_order: sortOrder });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (assignee) params.append('assignee', assignee);

      const response = await api.get(`/tasks/?${params.toString()}`);
      setTasks(response.data.items);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (initLoading) return;
    const delayDebounceFn = setTimeout(() => { fetchTasks(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, assignee, sortBy, sortOrder, page, initLoading]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  const isAdmin = currentUser?.role === 'admin';
  const tableColumns = isAdmin ? 5 : 4;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  if (initLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse">Loading workspace...</div>;

  // Reusable dropdown styles supporting dark mode
  const selectStyle = "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 cursor-pointer text-slate-700 dark:text-slate-300 font-medium transition-all outline-none appearance-none pr-8";
  const selectBgImage = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create, assign, and track your team's progress.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-md transition-all active:scale-95 shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Create Task
        </Button>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-3 transition-colors">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[250px] flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by task name..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all outline-none"
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0 hidden sm:block" />
            <select className={selectStyle} style={selectBgImage} value={status} onChange={handleFilterChange(setStatus)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <select className={selectStyle} style={selectBgImage} value={priority} onChange={handleFilterChange(setPriority)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {isAdmin && (
            <select className={selectStyle} style={selectBgImage} value={assignee} onChange={handleFilterChange(setAssignee)}>
              <option value="">All Assignees</option>
              <option value="me">Assigned to Me</option>
              {Object.entries(usersMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-1 pl-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sort</span>
            <select className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-300 font-medium transition-all outline-none appearance-none pr-6 py-1" style={selectBgImage} value={sortBy} onChange={handleFilterChange(setSortBy)}>
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
            <button onClick={toggleSortOrder} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
              <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>}
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
              {loading ? (
                <tr><td colSpan={tableColumns}><TableSkeleton columns={tableColumns} /></td></tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns} className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 mb-4 border border-slate-100 dark:border-slate-800">
                      <LayoutList className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No tasks found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters, or create a new task.</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const assigneeName = isAdmin ? (usersMap[task.assigned_to] || 'Unassigned') : (currentUser?.name || 'Me');
                  const initials = assigneeName !== 'Unassigned' ? assigneeName.charAt(0).toUpperCase() : '?';

                  return (
                    <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm mr-4 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[200px] sm:max-w-[300px]">{task.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Created {format(new Date(task.created_at), 'MMM dd')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={task.priority} /></td>
                      
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                            <User className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="truncate max-w-[120px]">{assigneeName}</span>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 shrink-0" />
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : <span className="text-slate-400 dark:text-slate-500">No date</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && tasks.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{startItem}</span> to <span className="font-semibold text-slate-900 dark:text-slate-200">{endItem}</span> of <span className="font-semibold text-slate-900 dark:text-slate-200">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </button>
              <div className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                Page {page} of {totalPages}
              </div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTasks} />
    </div>
  );
};

export default TaskList;
